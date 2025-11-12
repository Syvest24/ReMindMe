"""
Vercel Serverless Entry Point for ReMindMe Backend
This file wraps the FastAPI application for Vercel serverless deployment.
"""
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import uuid
import pandas as pd
import io
import pytz

# Initialize FastAPI
app = FastAPI(title="ReMindMe API")

# CORS Configuration - Allow Vercel domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.vercel.app",
        "http://localhost:3000",
        "*"  # For development - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection Pooling for Serverless
_mongo_client = None

def get_mongo_client():
    """Singleton MongoDB client for serverless functions"""
    global _mongo_client
    if _mongo_client is None:
        MONGO_URL = os.getenv("MONGO_URL")
        if not MONGO_URL:
            raise ValueError("MONGO_URL environment variable is not set")
        _mongo_client = MongoClient(
            MONGO_URL,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=45000,
            serverSelectionTimeoutMS=5000
        )
    return _mongo_client

def get_database():
    """Get database instance"""
    client = get_mongo_client()
    return client.get_database()

# Initialize database and collections
db = None
users_collection = None
contacts_collection = None
reminders_collection = None
messages_collection = None

def init_collections():
    """Initialize database collections"""
    global db, users_collection, contacts_collection, reminders_collection, messages_collection
    if db is None:
        db = get_database()
        users_collection = db["users"]
        contacts_collection = db["contacts"]
        reminders_collection = db["reminders"]
        messages_collection = db["messages"]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION_MINUTES", "43200"))

# Pydantic Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    timezone: Optional[str] = "UTC"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ContactCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birthday: Optional[str] = None
    relationship: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birthday: Optional[str] = None
    relationship: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class ReminderCreate(BaseModel):
    contact_id: str
    occasion_type: str
    occasion_date: str
    reminder_days_before: int = 3
    custom_message: Optional[str] = None
    is_recurring: bool = True

class MessageGenerate(BaseModel):
    contact_id: str
    occasion_type: str
    tone: str = "friendly"
    custom_context: Optional[str] = None

class EmailSend(BaseModel):
    to_email: str
    subject: str
    body: str

# Utility Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    init_collections()
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    user = users_collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ReMindMe API", "environment": "vercel"}

# Authentication Routes
@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
    init_collections()
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    user = {
        "user_id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "timezone": user_data.timezone,
        "subscription_tier": "free",
        "created_at": datetime.utcnow().isoformat(),
        "preferences": {
            "communication_tone": "friendly",
            "reminder_advance_days": 3
        }
    }
    users_collection.insert_one(user)
    
    token = create_access_token({"sub": user_id})
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "token": token
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    init_collections()
    user = users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token({"sub": user["user_id"]})
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "token": token
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "timezone": current_user.get("timezone", "UTC"),
        "subscription_tier": current_user.get("subscription_tier", "free")
    }

# Contact Routes
@app.post("/api/contacts")
async def create_contact(contact: ContactCreate, current_user: dict = Depends(get_current_user)):
    init_collections()
    contact_id = str(uuid.uuid4())
    contact_data = {
        "contact_id": contact_id,
        "user_id": current_user["user_id"],
        **contact.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "last_contacted": None,
        "contact_frequency": 0
    }
    contacts_collection.insert_one(contact_data)
    return {"contact_id": contact_id, "message": "Contact created successfully"}

@app.get("/api/contacts")
async def get_contacts(current_user: dict = Depends(get_current_user)):
    init_collections()
    contacts = list(contacts_collection.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ))
    return {"contacts": contacts}

@app.get("/api/contacts/{contact_id}")
async def get_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    init_collections()
    contact = contacts_collection.find_one(
        {"contact_id": contact_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@app.put("/api/contacts/{contact_id}")
async def update_contact(
    contact_id: str,
    contact_update: ContactUpdate,
    current_user: dict = Depends(get_current_user)
):
    init_collections()
    update_data = {k: v for k, v in contact_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = contacts_collection.update_one(
        {"contact_id": contact_id, "user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact updated successfully"}

@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    init_collections()
    result = contacts_collection.delete_one(
        {"contact_id": contact_id, "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    reminders_collection.delete_many({"contact_id": contact_id})
    
    return {"message": "Contact deleted successfully"}

@app.post("/api/contacts/import/csv")
async def import_contacts_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    init_collections()
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        imported_count = 0
        for _, row in df.iterrows():
            contact_id = str(uuid.uuid4())
            contact_data = {
                "contact_id": contact_id,
                "user_id": current_user["user_id"],
                "name": row.get('name', row.get('Name', '')),
                "email": row.get('email', row.get('Email', None)),
                "phone": row.get('phone', row.get('Phone', None)),
                "birthday": row.get('birthday', row.get('Birthday', None)),
                "relationship": row.get('relationship', row.get('Relationship', None)),
                "notes": row.get('notes', row.get('Notes', None)),
                "tags": [],
                "custom_fields": {},
                "created_at": datetime.utcnow().isoformat(),
                "last_contacted": None,
                "contact_frequency": 0
            }
            contacts_collection.insert_one(contact_data)
            imported_count += 1
        
        return {"message": f"Successfully imported {imported_count} contacts"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing CSV: {str(e)}")

# Reminder Routes
@app.post("/api/reminders")
async def create_reminder(reminder: ReminderCreate, current_user: dict = Depends(get_current_user)):
    init_collections()
    contact = contacts_collection.find_one({
        "contact_id": reminder.contact_id,
        "user_id": current_user["user_id"]
    })
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    reminder_id = str(uuid.uuid4())
    reminder_data = {
        "reminder_id": reminder_id,
        "user_id": current_user["user_id"],
        **reminder.dict(),
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    reminders_collection.insert_one(reminder_data)
    return {"reminder_id": reminder_id, "message": "Reminder created successfully"}

@app.get("/api/reminders")
async def get_reminders(current_user: dict = Depends(get_current_user)):
    init_collections()
    reminders = list(reminders_collection.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ))
    return {"reminders": reminders}

@app.get("/api/reminders/upcoming")
async def get_upcoming_reminders(days: int = 30, current_user: dict = Depends(get_current_user)):
    init_collections()
    reminders = list(reminders_collection.find(
        {"user_id": current_user["user_id"], "status": "active"},
        {"_id": 0}
    ))
    
    upcoming = []
    today = datetime.utcnow().date()
    
    for reminder in reminders:
        try:
            occasion_date = datetime.fromisoformat(reminder['occasion_date']).date()
            reminder_date = occasion_date - timedelta(days=reminder.get('reminder_days_before', 3))
            
            if today <= reminder_date <= today + timedelta(days=days):
                contact = contacts_collection.find_one(
                    {"contact_id": reminder['contact_id']},
                    {"_id": 0, "name": 1, "email": 1}
                )
                reminder['contact_name'] = contact.get('name', 'Unknown') if contact else 'Unknown'
                reminder['contact_email'] = contact.get('email', '') if contact else ''
                reminder['days_until'] = (reminder_date - today).days
                upcoming.append(reminder)
        except Exception:
            continue
    
    upcoming.sort(key=lambda x: x.get('days_until', 999))
    return {"upcoming_reminders": upcoming}

@app.delete("/api/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    init_collections()
    result = reminders_collection.delete_one({
        "reminder_id": reminder_id,
        "user_id": current_user["user_id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder deleted successfully"}

# AI Message Generation Route
@app.post("/api/messages/generate")
async def generate_message(message_request: MessageGenerate, current_user: dict = Depends(get_current_user)):
    init_collections()
    contact = contacts_collection.find_one(
        {"contact_id": message_request.contact_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # AI Message Generation
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Build tone-specific instructions
        tone_instructions = {
            "friendly": "You are a friendly and casual message writer. Write warm, approachable messages that feel personal and genuine.",
            "professional": "You are a professional message writer. Write polite, respectful messages suitable for business contexts.",
            "warm": "You are a warm and affectionate message writer. Write heartfelt, caring messages that express genuine emotion.",
            "concise": "You are a concise message writer. Write brief, to-the-point messages that are friendly but efficient."
        }
        
        system_message = tone_instructions.get(message_request.tone, tone_instructions["friendly"])
        
        # Build prompt
        occasion_prompts = {
            "birthday": f"Write a {message_request.tone} birthday message for {contact['name']}.",
            "anniversary": f"Write a {message_request.tone} anniversary message for {contact['name']}.",
            "follow-up": f"Write a {message_request.tone} follow-up/check-in message for {contact['name']} to reconnect.",
            "custom": f"Write a {message_request.tone} personalized message for {contact['name']}."
        }
        
        base_prompt = occasion_prompts.get(message_request.occasion_type, occasion_prompts["custom"])
        
        if contact.get('relationship'):
            base_prompt += f" They are my {contact['relationship'].lower()}."
        
        if contact.get('notes'):
            base_prompt += f" Context: {contact['notes'][:200]}"
        
        if message_request.custom_context:
            base_prompt += f" Additional context: {message_request.custom_context}"
        
        base_prompt += " Do not include greetings like 'Subject:' or email formatting. Just write the message content."
        
        # Get AI response
        api_key = os.getenv("EMERGENT_LLM_KEY")
        session_id = f"msg_{message_request.occasion_type}_{hash(contact['name'])}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(text=base_prompt)
        response = await chat.send_message(user_message)
        message = response.strip()
        
        # Clean up response
        for prefix in ["Subject:", "Message:", "Here's", "Here is"]:
            if message.startswith(prefix):
                message = message[len(prefix):].strip()
                if message.startswith(":"):
                    message = message[1:].strip()
        
    except Exception as e:
        print(f"AI generation failed: {e}")
        # Fallback template
        message = f"Hi {contact['name']}! Hope you're doing well. Looking forward to catching up soon!"
    
    # Save generated message
    message_id = str(uuid.uuid4())
    message_data = {
        "message_id": message_id,
        "user_id": current_user["user_id"],
        "contact_id": message_request.contact_id,
        "occasion_type": message_request.occasion_type,
        "tone": message_request.tone,
        "generated_message": message,
        "created_at": datetime.utcnow().isoformat()
    }
    messages_collection.insert_one(message_data)
    
    return {"message": message, "message_id": message_id}

# Analytics Routes
@app.get("/api/analytics/stale-contacts")
async def get_stale_contacts(months: int = 3, current_user: dict = Depends(get_current_user)):
    init_collections()
    cutoff_date = datetime.utcnow() - timedelta(days=months * 30)
    
    contacts = list(contacts_collection.find(
        {
            "user_id": current_user["user_id"],
            "$or": [
                {"last_contacted": {"$lt": cutoff_date.isoformat()}},
                {"last_contacted": None}
            ]
        },
        {"_id": 0}
    ))
    
    return {"stale_contacts": contacts, "count": len(contacts)}

@app.get("/api/analytics/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    init_collections()
    total_contacts = contacts_collection.count_documents({"user_id": current_user["user_id"]})
    total_reminders = reminders_collection.count_documents({"user_id": current_user["user_id"], "status": "active"})
    
    upcoming = await get_upcoming_reminders(7, current_user)
    stale = await get_stale_contacts(3, current_user)
    
    return {
        "total_contacts": total_contacts,
        "total_reminders": total_reminders,
        "upcoming_events_count": len(upcoming["upcoming_reminders"]),
        "stale_contacts_count": stale["count"]
    }

# Email sending route (placeholder)
@app.post("/api/email/send")
async def send_email(email_data: EmailSend, current_user: dict = Depends(get_current_user)):
    return {
        "message": "Email sending is configured as placeholder. Add SMTP credentials to environment.",
        "to": email_data.to_email,
        "subject": email_data.subject
    }

# Vercel serverless handler
handler = app
