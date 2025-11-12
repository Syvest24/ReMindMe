# ReMindMe 🎯

A powerful AI-powered relationship manager that helps you maintain meaningful connections by remembering important contacts, occasions, and generating personalized messages.

## ✨ Features

### Core Functionality
- **👤 Contact Management**
  - Add, edit, and delete contacts with custom fields
  - Import contacts via CSV
  - Search and filter contacts
  - Track relationship types and notes

- **⏰ Smart Reminders**
  - Create reminders for birthdays, anniversaries, and custom occasions
  - Set advance notification days
  - Recurring annual reminders
  - Calendar and list views

- **🤖 AI Message Generation**
  - Powered by Google Gemini AI via Emergent LLM Key
  - 4 tone options: Friendly, Professional, Warm, Concise
  - Personalized based on contact details and relationship
  - Editable AI-generated messages

- **📊 Analytics & Insights**
  - Dashboard with relationship statistics
  - Identify contacts needing attention (stale contacts)
  - Upcoming events overview
  - Relationship health monitoring

- **🔐 Secure Authentication**
  - Email/password authentication with JWT tokens
  - Password hashing with bcrypt
  - Protected API endpoints
  - (Google OAuth placeholder - add credentials)

## 🚀 Getting Started

### For Local Development

**Prerequisites:**
- Python 3.9+
- Node.js 16+
- MongoDB (configured and running)
- Yarn package manager

**Installation:**
The application is already set up and running! Both backend and frontend services are managed by supervisor.

### For Production Deployment

**Deploy to Vercel (Recommended):**

ReMindMe is ready for instant deployment to Vercel! All configuration files have been created.

📚 **Quick Start:** See [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) for a 3-minute deployment guide.

📋 **Detailed Guide:** See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for comprehensive instructions.

✅ **Checklist:** Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for step-by-step verification.

**What's needed for deployment:**
- Vercel account (free)
- MongoDB Atlas connection string
- JWT secret key
- Your GitHub repository

**Files ready for deployment:**
- ✅ `/api/index.py` - Serverless backend
- ✅ `/api/requirements.txt` - Dependencies
- ✅ `/vercel.json` - Configuration
- ✅ Complete documentation

### Default Configuration

**Backend API**: `http://localhost:8001`
**Frontend**: `http://localhost:3000`
**Database**: MongoDB (local)

### Service Management

```bash
# Restart all services
sudo supervisorctl restart all

# Restart backend only
sudo supervisorctl restart backend

# Restart frontend only
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.out.log
```

## 📖 Usage Guide

### 1. Create an Account
- Navigate to the app
- Click "Sign Up" tab
- Enter your name, email, and password
- Login with your credentials

### 2. Add Contacts
**Manual Entry:**
- Click "Add Contact" button
- Fill in contact details (name, email, phone, birthday, relationship, notes)
- Submit the form

**CSV Import:**
- Click "Import CSV" button
- Select your CSV file (see `sample_contacts.csv` for format)
- Contacts will be imported automatically

### 3. Set Reminders
- Go to Reminders page
- Click "Add Reminder"
- Select a contact
- Choose occasion type (birthday, anniversary, follow-up, custom)
- Set the date and advance notification days
- Toggle recurring option for annual reminders

### 4. Generate AI Messages
- Go to any contact detail page or click "Send Message" from dashboard
- Select occasion type and tone
- Click "Generate Message"
- Edit the AI-generated message if needed
- Copy to clipboard or send via email (with SMTP configured)

### 5. Monitor Relationships
- Check Dashboard for quick overview
- View Analytics page for contacts needing attention
- Filter by time period (1, 3, 6, 12 months)
- Click "Reach Out" to generate reconnection messages

## 🔧 Configuration

### Environment Variables

**Backend** (`/app/backend/.env`):
```env
# Database
MONGO_URL=mongodb://localhost:27017/remindme

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200

# AI Integration
EMERGENT_LLM_KEY=sk-emergent-bCb63Be0e14FaE71aE

# Email (Optional - currently placeholder)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OAuth (Optional - currently placeholder)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### CSV Import Format

Your CSV should have these columns (see `sample_contacts.csv`):
```csv
name,email,phone,birthday,relationship,notes
John Doe,john@example.com,+1-555-0101,1990-05-15,Friend,Met at college
```

## 🎨 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with PyMongo
- **JWT** - Secure token-based authentication
- **Gemini AI** - Via emergentintegrations library
- **Python-JOSE** - JWT encoding/decoding
- **Passlib** - Password hashing with bcrypt

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Calendar** - Calendar component
- **React Toastify** - Toast notifications

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/{id}` - Get contact details
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact
- `POST /api/contacts/import/csv` - Import CSV

### Reminders
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/upcoming` - Get upcoming reminders
- `DELETE /api/reminders/{id}` - Delete reminder

### Messages
- `POST /api/messages/generate` - Generate AI message
- `POST /api/email/send` - Send email (placeholder)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/stale-contacts` - Contacts needing attention

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API endpoints
- CORS configuration
- Environment variable separation
- MongoDB injection protection

## 🎯 Future Enhancements

### Planned Features
- ✅ Google OAuth integration (placeholder ready)
- ✅ SMTP email sending (placeholder ready)
- 📱 Mobile responsive design (in progress)
- 🔔 Push notifications
- 📧 Email reminders
- 📱 SMS integration
- 📈 Advanced analytics
- 🌐 LinkedIn integration
- 🎨 Theme customization
- 🔄 Contact sync with Google Contacts

## 🤝 AI Integration Details

This app uses **Google Gemini 2.0 Flash** via the Emergent LLM Key for message generation. The AI:
- Personalizes messages based on contact details
- Adapts tone (friendly, professional, warm, concise)
- Uses relationship context and notes
- Handles multiple occasion types
- Falls back to templates if AI fails

## 💡 Tips for Best Experience

1. **Keep Contact Details Updated** - More information = better AI messages
2. **Add Notes** - AI uses notes for personalization
3. **Set Reminders in Advance** - 3-7 days before occasions
4. **Review AI Messages** - Always edit before sending
5. **Check Analytics Weekly** - Stay on top of stale relationships
6. **Import Regularly** - Keep contacts in sync

## 🌐 Deployment

### Deploy to Vercel (Production)

ReMindMe is production-ready with full Vercel deployment support:

**Quick Deploy:**
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

**Documentation:**
- 📚 [Complete Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- ⚡ [Quick Start (3 min)](./VERCEL_QUICKSTART.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 📊 [Implementation Summary](./DEPLOYMENT_SUMMARY.md)

**What's included:**
- ✅ Serverless FastAPI backend
- ✅ Optimized React frontend
- ✅ MongoDB Atlas integration
- ✅ Connection pooling
- ✅ CORS configuration
- ✅ Environment variable setup
- ✅ Automatic scaling

**Live in minutes!** Follow the guides to deploy your own instance.

## 🐛 Troubleshooting

### Backend not starting?
```bash
tail -f /var/log/supervisor/backend.err.log
cd /app/backend && pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Frontend not loading?
```bash
tail -f /var/log/supervisor/frontend.out.log
cd /app/frontend && yarn install
sudo supervisorctl restart frontend
```

### MongoDB connection issues?
```bash
sudo systemctl status mongodb
sudo systemctl restart mongodb
```

### AI not generating messages?
- Check EMERGENT_LLM_KEY in `/app/backend/.env`
- View backend logs for errors
- Ensure emergentintegrations is installed

## 📝 Notes

- **Email Sending**: Currently configured as placeholder. Add SMTP credentials to enable.
- **OAuth**: Google OAuth is set up as placeholder. Add client credentials to enable.
- **Emergent LLM Key**: Pre-configured universal key works with OpenAI, Anthropic, and Gemini.
- **Database**: Uses MongoDB with UUIDs (not ObjectID) for easy JSON serialization.

## 🎉 Success Metrics

- Create and manage unlimited contacts
- Set unlimited reminders
- Generate AI messages for any occasion
- Track relationship health
- Never miss important dates
- Stay meaningfully connected

## 📞 Support

For issues or questions about the platform:
- Check application logs in `/var/log/supervisor/`
- Review environment variables in `.env` files
- Ensure all services are running with `supervisorctl status`

---

**Built with ❤️ using FastAPI, React, MongoDB, and Gemini AI**
