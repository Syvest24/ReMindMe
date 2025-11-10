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
from dotenv import load_dotenv
import uuid
import pandas as pd
import io
import pytz

load_dotenv()

# Initialize FastAPI
app = FastAPI(title="ReMindMe API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/remindme")
client = MongoClient(MONGO_URL)
db = client.get_database()

# Collections
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
    occasion_type: str  # birthday, anniversary, follow-up, custom
    occasion_date: str
    reminder_days_before: int = 3
    custom_message: Optional[str] = None
    is_recurring: bool = True

class MessageGenerate(BaseModel):
    contact_id: str
    occasion_type: str
    tone: str = "friendly"  # friendly, professional, warm, concise
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
    return {"status": "healthy", "service": "ReMindMe API"}

# Authentication Routes
@app.post("/api/auth/signup")
async def signup(user_data: UserSignup):
    # Check if user exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
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
    
    # Generate token
    token = create_access_token({"sub": user_id})
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "token": token
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
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
    contacts = list(contacts_collection.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ))
    return {"contacts": contacts}

@app.get("/api/contacts/{contact_id}")
async def get_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
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
    result = contacts_collection.delete_one(
        {"contact_id": contact_id, "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Also delete associated reminders
    reminders_collection.delete_many({"contact_id": contact_id})
    
    return {"message": "Contact deleted successfully"}

@app.post("/api/contacts/import/csv")
async def import_contacts_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
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
    # Verify contact belongs to user
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
    reminders = list(reminders_collection.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ))
    return {"reminders": reminders}

@app.get("/api/reminders/upcoming")
async def get_upcoming_reminders(days: int = 30, current_user: dict = Depends(get_current_user)):
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
                # Get contact info
                contact = contacts_collection.find_one(
                    {"contact_id": reminder['contact_id']},
                    {"_id": 0, "name": 1, "email": 1}
                )
                reminder['contact_name'] = contact.get('name', 'Unknown') if contact else 'Unknown'
                reminder['contact_email'] = contact.get('email', '') if contact else ''
                reminder['days_until'] = (reminder_date - today).days
                upcoming.append(reminder)
        except:
            continue
    
    upcoming.sort(key=lambda x: x.get('days_until', 999))
    return {"upcoming_reminders": upcoming}

@app.delete("/api/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
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
    # Get contact info
    contact = contacts_collection.find_one(
        {"contact_id": message_request.contact_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Import AI service
    try:
        from ai_service import ai_generator
        
        # Generate message using AI
        message = await ai_generator.generate_message(
            contact_name=contact['name'],
            occasion_type=message_request.occasion_type,
            tone=message_request.tone,
            custom_context=message_request.custom_context,
            relationship=contact.get('relationship'),
            notes=contact.get('notes')
        )
    except Exception as e:
        print(f"AI generation failed: {e}")
        # Fallback to simple template
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
    total_contacts = contacts_collection.count_documents({"user_id": current_user["user_id"]})
    total_reminders = reminders_collection.count_documents({"user_id": current_user["user_id"], "status": "active"})
    
    # Get upcoming events (next 7 days)
    upcoming = await get_upcoming_reminders(7, current_user)
    
    # Get stale contacts (3+ months)
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
    # Placeholder for email sending (will implement SMTP later)
    return {
        "message": "Email sending is configured as placeholder. Add SMTP credentials to .env file.",
        "to": email_data.to_email,
        "subject": email_data.subject
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)