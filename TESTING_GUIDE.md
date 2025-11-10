# ReMindMe Testing Guide

This guide helps you test all features of the ReMindMe application.

## Quick Test Checklist

### ✅ Authentication Testing
1. **Sign Up**
   - Navigate to the app
   - Click "Sign Up" tab
   - Enter: Name, Email, Password
   - Should redirect to dashboard after signup

2. **Login**
   - Click "Login" tab  
   - Enter your email and password
   - Should redirect to dashboard

3. **Logout**
   - Click logout button in navbar
   - Should redirect to login page

### ✅ Contact Management Testing

#### Manual Contact Creation
1. Go to Contacts page
2. Click "Add Contact" button
3. Fill in the form:
   - Name: "John Doe" (required)
   - Email: "john@example.com"
   - Phone: "+1-555-0101"
   - Birthday: Select a date
   - Relationship: "Friend"
   - Notes: "Met at conference"
4. Click "Add Contact"
5. Contact should appear in the list

#### CSV Import
1. Download the sample file: `/app/sample_contacts.csv`
2. Click "Import CSV" button
3. Select the sample CSV file
4. All 5 contacts should be imported
5. Check contacts list to verify

#### Search & Filter
1. Go to Contacts page
2. Type in search box: "John"
3. Should filter and show only John Doe
4. Clear search to see all contacts

#### Edit Contact
1. Click on any contact card
2. Click edit icon (pencil)
3. Modify any field
4. Click "Save Changes"
5. Changes should persist

#### Delete Contact
1. Click on any contact card
2. Click delete icon (trash)
3. Confirm deletion
4. Contact should be removed

### ✅ Reminder System Testing

#### Create Reminder
1. Go to Reminders page
2. Click "Add Reminder" button
3. Fill in the form:
   - Contact: Select from dropdown
   - Occasion Type: "Birthday"
   - Date: Select future date
   - Remind me: 3 days before
   - Recurring: Checked
4. Click "Create Reminder"
5. Should see reminder in list

#### View Calendar
1. Go to Reminders page
2. Click "Calendar View" tab
3. Days with occasions should have dots
4. Click dates to see details

#### Delete Reminder
1. In list view, find a reminder
2. Click trash icon
3. Confirm deletion
4. Reminder should be removed

### ✅ AI Message Generation Testing

#### Generate Birthday Message
1. Go to any contact detail page OR click "Send Message" from dashboard
2. Select:
   - Occasion Type: "Birthday"
   - Tone: "Friendly"
3. Click "Generate Message"
4. Wait ~2-3 seconds
5. Should see personalized AI-generated message
6. Message should mention contact's name and be contextual

#### Try Different Tones
Test each tone to see different styles:
- **Friendly**: Casual, warm, personal
- **Professional**: Formal, business-appropriate
- **Warm**: Heartfelt, emotional
- **Concise**: Brief, to-the-point

#### Edit & Copy Message
1. After generating message, edit the text
2. Click "Copy to Clipboard"
3. Paste elsewhere to verify
4. Click "Send via Email" (will copy since SMTP is placeholder)

### ✅ Analytics Testing

#### View Dashboard Stats
1. Go to Dashboard
2. Check 4 stat cards:
   - Total Contacts
   - Active Reminders
   - Upcoming This Week
   - Need Attention
3. Numbers should reflect your data

#### Stale Contacts
1. Go to Analytics page
2. Use time period dropdown: Select "3 months"
3. Should see contacts not contacted recently
4. Click "Reach Out" to generate reconnection message

#### Quick Actions
1. From Dashboard, test quick action cards:
   - Add Contact → Should open contacts page
   - Set Reminder → Should open reminders page
   - View Insights → Should open analytics

### ✅ Integration Testing

#### End-to-End Flow
1. **Create Contact** → Add "Sarah Johnson" with birthday
2. **Set Reminder** → Create birthday reminder for Sarah
3. **Check Dashboard** → Should see upcoming reminder
4. **Generate Message** → Click "Send Message" for Sarah
5. **View Analytics** → Check relationship health
6. **Complete Cycle** → Mark as contacted (future feature)

### ✅ API Testing (Backend)

Test the backend directly using curl:

```bash
# 1. Health Check
curl http://localhost:8001/api/health

# 2. Signup
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123","name":"API User"}'

# Save the token from response, then use in next calls:
TOKEN="your-token-here"

# 3. Get Current User
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/auth/me

# 4. Create Contact
curl -X POST http://localhost:8001/api/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Contact","email":"contact@test.com"}'

# 5. List Contacts
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/contacts

# 6. Generate AI Message (replace CONTACT_ID)
curl -X POST http://localhost:8001/api/messages/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contact_id":"CONTACT_ID","occasion_type":"birthday","tone":"friendly"}'

# 7. Dashboard Stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/analytics/dashboard
```

## Expected Behaviors

### ✅ Success Cases
- All API calls return 200 status
- Toast notifications appear for actions
- Data persists after refresh
- Navigation works smoothly
- AI messages are unique and contextual
- Calendar updates with reminders
- Stats update in real-time

### ⚠️ Known Placeholders
- **Google OAuth**: Button is disabled (needs credentials)
- **Email Sending**: Shows info toast, copies message instead
- **SMTP**: Not configured, uses placeholder

## Performance Expectations

- **Signup/Login**: < 1 second
- **Contact Creation**: < 500ms
- **AI Message Generation**: 2-5 seconds (depends on AI)
- **Dashboard Load**: < 1 second
- **CSV Import**: < 2 seconds for 100 contacts

## Troubleshooting Test Issues

### Backend Issues
```bash
# Check backend logs
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend

# Test health endpoint
curl http://localhost:8001/api/health
```

### Frontend Issues
```bash
# Check frontend logs
tail -f /var/log/supervisor/frontend.out.log

# Restart frontend
sudo supervisorctl restart frontend

# Check if frontend is accessible
curl http://localhost:3000
```

### AI Not Working
1. Check if EMERGENT_LLM_KEY is set in `/app/backend/.env`
2. Verify emergentintegrations is installed: `pip list | grep emergent`
3. Check backend logs for AI errors
4. Should fallback to templates if AI fails

### Database Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb
```

## Test Data

### Sample Contacts (from CSV)
- John Doe - Friend (Birthday: May 15)
- Jane Smith - Colleague (Birthday: Aug 22)
- Bob Johnson - Family (Birthday: Mar 10)
- Alice Williams - Client (Birthday: Nov 30)
- Charlie Brown - Friend (Birthday: Jul 4)

### Test Scenarios
1. **Birthday in 1 week**: Set reminder for upcoming birthday
2. **Stale contact**: Create contact, don't set last_contacted
3. **Multiple reminders**: Create 5+ reminders for different occasions
4. **Search**: Test with partial names, emails, relationships

## Success Criteria

After testing, you should be able to:
- ✅ Create and manage unlimited contacts
- ✅ Import contacts from CSV
- ✅ Set and view reminders in calendar
- ✅ Generate AI-powered personalized messages
- ✅ Track relationship health via analytics
- ✅ Navigate seamlessly between all pages
- ✅ See real-time updates on dashboard
- ✅ Use search and filters effectively

## Report Issues

When reporting issues, include:
1. What you were trying to do
2. What actually happened
3. Error messages (if any)
4. Browser console logs
5. Backend logs from `/var/log/supervisor/`

---

**Happy Testing! 🎉**
