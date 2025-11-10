"""
AI Service for generating personalized messages using Gemini via Emergent LLM Key
"""
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
from typing import Optional

class AIMessageGenerator:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
    
    async def generate_message(
        self,
        contact_name: str,
        occasion_type: str,
        tone: str,
        custom_context: Optional[str] = None,
        relationship: Optional[str] = None,
        notes: Optional[str] = None
    ) -> str:
        """
        Generate a personalized message using Gemini AI
        
        Args:
            contact_name: Name of the contact
            occasion_type: Type of occasion (birthday, anniversary, follow-up, custom)
            tone: Desired tone (friendly, professional, warm, concise)
            custom_context: Optional additional context
            relationship: Optional relationship type
            notes: Optional notes about the contact
        
        Returns:
            Generated message string
        """
        
        # Build the system message based on tone
        tone_instructions = {
            "friendly": "You are a friendly and casual message writer. Write warm, approachable messages that feel personal and genuine.",
            "professional": "You are a professional message writer. Write polite, respectful messages suitable for business contexts.",
            "warm": "You are a warm and affectionate message writer. Write heartfelt, caring messages that express genuine emotion.",
            "concise": "You are a concise message writer. Write brief, to-the-point messages that are friendly but efficient."
        }
        
        system_message = tone_instructions.get(tone, tone_instructions["friendly"])
        
        # Build the user prompt
        occasion_prompts = {
            "birthday": f"Write a {tone} birthday message for {contact_name}.",
            "anniversary": f"Write a {tone} anniversary message for {contact_name}.",
            "follow-up": f"Write a {tone} follow-up/check-in message for {contact_name} to reconnect and see how they're doing.",
            "custom": f"Write a {tone} personalized message for {contact_name}."
        }
        
        base_prompt = occasion_prompts.get(occasion_type, occasion_prompts["custom"])
        
        # Add relationship context if available
        if relationship:
            base_prompt += f" They are my {relationship.lower()}."
        
        # Add notes if available
        if notes:
            base_prompt += f" Context about them: {notes[:200]}"
        
        # Add custom context if provided
        if custom_context:
            base_prompt += f" Additional context: {custom_context}"
        
        # Add tone-specific instructions
        if tone == "concise":
            base_prompt += " Keep it under 2 sentences."
        elif tone == "warm":
            base_prompt += " Make it heartfelt and emotional."
        elif tone == "professional":
            base_prompt += " Keep it professional and appropriate for business."
        else:  # friendly
            base_prompt += " Make it casual and warm, like talking to a friend."
        
        base_prompt += " Do not include greetings like 'Subject:' or email formatting. Just write the message content itself."
        
        try:
            # Create a unique session ID for each generation
            session_id = f"message_gen_{occasion_type}_{hash(contact_name)}"
            
            # Initialize the chat with Gemini
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Create user message
            user_message = UserMessage(text=base_prompt)
            
            # Get response from AI
            response = await chat.send_message(user_message)
            
            # Clean up the response
            message = response.strip()
            
            # Remove common prefixes that AI might add
            prefixes_to_remove = ["Subject:", "Message:", "Here's", "Here is"]
            for prefix in prefixes_to_remove:
                if message.startswith(prefix):
                    message = message[len(prefix):].strip()
                    if message.startswith(":"):
                        message = message[1:].strip()
            
            return message
            
        except Exception as e:
            print(f"Error generating message with AI: {e}")
            # Fallback to template if AI fails
            return self._get_fallback_template(contact_name, occasion_type, tone)
    
    def _get_fallback_template(self, contact_name: str, occasion_type: str, tone: str) -> str:
        """Fallback templates if AI generation fails"""
        templates = {
            "birthday": {
                "friendly": f"Happy Birthday {contact_name}! 🎉 Hope you have an amazing day filled with joy and laughter!",
                "professional": f"Dear {contact_name}, Wishing you a very happy birthday and continued success in the year ahead.",
                "warm": f"Happy Birthday dear {contact_name}! May this special day bring you endless happiness and wonderful memories.",
                "concise": f"Happy Birthday {contact_name}! Best wishes! 🎂"
            },
            "follow-up": {
                "friendly": f"Hey {contact_name}! It's been a while since we last connected. Hope you're doing great! Would love to catch up soon.",
                "professional": f"Hello {contact_name}, I wanted to reach out and see how things are going. Looking forward to reconnecting.",
                "warm": f"Hi {contact_name}, I've been thinking about you and wanted to check in. Hope all is well with you!",
                "concise": f"Hi {contact_name}, let's catch up soon!"
            },
            "anniversary": {
                "friendly": f"Happy Anniversary {contact_name}! 🎊 Wishing you many more years of happiness together!",
                "professional": f"Dear {contact_name}, Congratulations on your anniversary. Wishing you continued happiness.",
                "warm": f"Happy Anniversary dear {contact_name}! May your love continue to grow stronger with each passing year.",
                "concise": f"Happy Anniversary {contact_name}! 💕"
            }
        }
        
        occasion = occasion_type.lower()
        if occasion not in templates:
            occasion = "follow-up"
        
        return templates[occasion].get(tone, templates[occasion]["friendly"])


# Global instance
ai_generator = AIMessageGenerator()
