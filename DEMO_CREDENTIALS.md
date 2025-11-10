# 🎯 ReMindMe Demo Account

## 🔑 Login Credentials

**Email:** `demo@remindme.com`  
**Password:** `demo123`

---

## 📊 What's Inside This Account

### 👥 5 Pre-loaded Contacts

1. **Sarah Johnson** - Friend
   - Birthday: December 15, 1990
   - Email: sarah.johnson@email.com
   - Notes: College roommate, loves hiking and photography

2. **Michael Chen** - Colleague
   - Birthday: March 22, 1985
   - Email: michael.chen@company.com
   - Notes: Project manager, great mentor, coffee enthusiast

3. **Mom** - Family
   - Birthday: June 10, 1965
   - Email: mom@family.com
   - Notes: Best mom ever! Loves gardening and baking

4. **Jessica Martinez** - Client
   - Birthday: September 5, 1992
   - Email: jessica@startup.io
   - Notes: CEO of tech startup, met at conference

5. **Tom Wilson** - Friend
   - Birthday: November 28, 1988
   - Email: tom.wilson@email.com
   - Notes: Childhood friend, lawyer, plays guitar

### ⏰ 4 Active Reminders

- ✅ Sarah's Birthday - December 15, 2025 (7 days before)
- ✅ Michael's Birthday - March 22, 2025 (3 days before)
- ✅ Mom's Birthday - June 10, 2025 (5 days before)
- ✅ Follow-up with Sarah - January 20, 2025 (1 day before)

### 🤖 AI Messages

- 1 AI-generated birthday message for Sarah (already created)

---

## 🚀 How to Login

1. Open your browser and go to: `http://localhost:3000`
2. Make sure you're on the **"Login"** tab
3. Enter:
   - Email: `demo@remindme.com`
   - Password: `demo123`
4. Click **"Login"**
5. You'll be redirected to the dashboard!

---

## 🎨 What You Can Test

### Dashboard
- View 5 total contacts
- See 4 active reminders
- Check upcoming events
- View stale contacts count

### Contacts Page
- Browse all 5 contacts
- Search for specific contacts
- Click any contact to view details
- Edit or delete contacts
- Add new contacts
- Import more contacts from CSV

### Contact Detail Pages
- View full contact information
- Edit contact details
- Delete contacts
- Generate AI messages directly
- Set reminders for the contact

### Reminders Page
- **List View**: See all 4 reminders with details
- **Calendar View**: See occasions marked on calendar
- Add new reminders
- Delete existing reminders
- Toggle between list and calendar views

### Message Composer
- Select any contact
- Choose occasion type (birthday, anniversary, follow-up, custom)
- Pick tone (friendly, professional, warm, concise)
- Click "Generate Message" to see AI magic! 🤖
- Edit the generated message
- Copy to clipboard
- Send via email (placeholder)

### Analytics Page
- View contacts needing attention
- Filter by time period (1, 3, 6, 12 months)
- Click "Reach Out" to generate reconnection messages
- Monitor relationship health

---

## 💡 Quick Test Ideas

1. **Test AI with Different Tones:**
   - Go to Sarah's contact
   - Click "Generate Message"
   - Try: Friendly, Professional, Warm, Concise
   - See how AI adapts!

2. **Add Your Own Contact:**
   - Click "Add Contact"
   - Fill in details
   - Set a reminder
   - Generate a message

3. **Import Contacts:**
   - Use the sample file: `/app/sample_contacts.csv`
   - Click "Import CSV"
   - Watch 5 more contacts appear!

4. **Check Calendar:**
   - Go to Reminders → Calendar View
   - See dots on dates with occasions
   - Click dates to explore

5. **Test Search:**
   - Go to Contacts
   - Search for "Sarah"
   - Try "Friend" to filter by relationship

---

## 🔐 Security Note

This is a demo account pre-populated with sample data for testing purposes. In production:
- Use strong passwords
- Don't share credentials
- Enable 2FA when available
- Use environment-specific secrets

---

## 🆘 Need Help?

- **Can't login?** Check that services are running: `sudo supervisorctl status`
- **No data showing?** Refresh the page
- **AI not working?** Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- **Frontend issues?** Check: `tail -f /var/log/supervisor/frontend.out.log`

---

**Enjoy exploring ReMindMe! 🎉**
