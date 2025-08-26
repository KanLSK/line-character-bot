# 🆕 New Features - Siriraj Medical Camp 2025 Chatbot

## 🎯 Overview

This update adds three major new functionalities to the Line chatbot:

1. **👨‍⚕️ Human Admin Mode** - Connect users to real human administrators
2. **🏥 Medical Information Mode** - Professional medical camp information
3. **🎭 Character Mode Toggle** - Switch between roleplay and professional modes

## 🚀 New Commands

### `/admin` - Talk to Human Admin
- **Function**: Terminates Gemini AI and connects user to human admin
- **Usage**: Type `/admin` followed by your message
- **Example**: `/admin I need help with registration`
- **Response**: System confirms request sent to admin and user waits for response

### `/medical` - Get Medical Camp Information
- **Function**: Provides professional medical camp information (no character personality)
- **Usage**: Type `/medical` followed by your query
- **Example**: `/medical cardiology camp dates`
- **Response**: Professional, factual information about Siriraj Medical Camp 2025

### `/back` - Return to Character Mode
- **Function**: Returns user to AI character mode
- **Usage**: Type `/back`
- **Response**: Confirms return to character mode

## 🏥 Medical Camp Information Database

### Available Information:
- **General Health Check** (March 15-20, 2025)
- **Cardiology Specialized** (March 22-25, 2025)
- **Diabetes Management Workshop** (March 28-30, 2025)
- **Pediatric Health Seminar** (April 5-7, 2025)

### Information Categories:
- 📅 Dates and schedules
- 📍 Locations and directions
- 📞 Contact information
- 📝 Registration procedures
- 🔍 Available services
- 💰 Costs and fees
- 📋 Requirements and preparation

## 👨‍⚕️ Admin Dashboard

### Access: `/dashboard`

### Features:
- **Real-time Request Monitoring** - See pending user requests
- **Priority-based Queue** - High/Medium/Low priority requests
- **Direct Response System** - Respond to users directly
- **Session Management** - End admin sessions
- **User History** - View conversation history

### Admin Actions:
1. **View Pending Requests** - See all users waiting for admin
2. **Select User** - Click on user to respond
3. **Send Response** - Type and send message to user
4. **End Session** - Return user to character mode
5. **Monitor Priority** - Color-coded priority levels

## 🔄 Mode Switching

### Character Mode → Human Admin Mode
1. User types `/admin [message]`
2. System terminates Gemini AI
3. User enters waiting queue
4. Admin receives notification
5. Admin responds via dashboard

### Human Admin Mode → Character Mode
1. Admin ends session via dashboard, OR
2. User types `/back`
3. System returns to AI character
4. Character personality restored

### Character Mode → Medical Info Mode
1. User types `/medical [query]`
2. System provides professional response
3. No character personality
4. Factual medical information only

## 📊 Database Schema

### MedicalCamp Model
```typescript
{
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  activities: string[];
  requirements: string[];
  registrationInfo: string;
  benefits: string[];
  category: 'general' | 'specialized' | 'workshop' | 'seminar';
  isActive: boolean;
}
```

### UserSession Model
```typescript
{
  userId: string;
  currentMode: 'character' | 'human_admin' | 'medical_info';
  currentCharacterId?: string;
  isWaitingForHuman: boolean;
  humanAdminId?: string;
  conversationHistory: Array<{
    timestamp: Date;
    sender: 'user' | 'bot' | 'human_admin';
    message: string;
    mode: string;
  }>;
}
```

## 🛠️ API Endpoints

### Session Management
- `GET /api/session?userId=<id>` - Get user session
- `POST /api/session` - Update user session

### Medical Information
- `GET /api/medical-camp` - Get medical camp data
- `POST /api/medical-camp` - Seed medical camp data

### Admin Dashboard
- `GET /api/admin/requests` - Get pending requests
- `POST /api/admin/respond` - Send admin response
- `POST /api/admin/end-session` - End admin session

## 🧪 Testing

### Test Medical Information
```bash
# Test medical camp info
curl "http://localhost:3000/api/medical-camp"

# Test specific query
curl "http://localhost:3000/api/medical-camp?query=cardiology"
```

### Test Admin Features
```bash
# Get pending requests
curl "http://localhost:3000/api/admin/requests"

# Send admin response
curl -X POST "http://localhost:3000/api/admin/respond" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","adminId":"admin-123","message":"Hello, how can I help?"}'
```

### Seed Data
```bash
# Seed medical camp data
npm run seed-medical

# Or via API
curl -X POST "http://localhost:3000/api/medical-camp" \
  -H "Content-Type: application/json" \
  -d '{"action":"seed"}'
```

## 🎨 UI Components

### Quick Reply Buttons
The Line bot now includes additional quick reply buttons:
- 👨‍⚕️ **Talk to Admin** - `/admin`
- 🏥 **Medical Info** - `/medical`
- 🎭 **Switch Character** - `/character`
- ❓ **Help** - `/help`

### Admin Dashboard Features
- **Real-time Updates** - Auto-refresh every 5 seconds
- **Priority Indicators** - Color-coded priority levels
- **User Selection** - Click to select user for response
- **Response Panel** - Text area for admin responses
- **Session Management** - End sessions with one click

## 🔧 Configuration

### Environment Variables
No additional environment variables required. Uses existing:
- `MONGODB_URI` - Database connection
- `LINE_CHANNEL_ACCESS_TOKEN` - Line bot access
- `GEMINI_API_KEY` - AI responses

### Database Setup
```bash
# Seed medical camp data
npm run seed-medical

# Seed characters (if not already done)
npm run seed
```

## 📱 User Experience

### For Users:
1. **Natural Interaction** - Use commands like `/admin` or `/medical`
2. **Quick Access** - Use quick reply buttons
3. **Seamless Switching** - Easy mode switching
4. **Professional Support** - Human admin when needed

### For Admins:
1. **Dashboard Access** - Visit `/dashboard`
2. **Real-time Monitoring** - See requests as they come
3. **Easy Response** - Click and type to respond
4. **Session Control** - Manage user sessions

## 🚀 Deployment

### Quick Start:
1. **Deploy to Vercel/Railway/Render**
2. **Seed medical data**: `npm run seed-medical`
3. **Access dashboard**: `https://your-app.vercel.app/dashboard`
4. **Test features**: Use Line bot commands

### Production Checklist:
- ✅ Database seeded with medical camp data
- ✅ Admin dashboard accessible
- ✅ Line webhook configured
- ✅ Environment variables set
- ✅ Test all three modes

## 🎯 Use Cases

### Medical Information Queries:
- "When is the cardiology camp?"
- "How do I register for diabetes workshop?"
- "What are the requirements for general health check?"
- "Where is the pediatric seminar located?"

### Admin Support:
- "I can't register online"
- "I have a medical emergency question"
- "I need help with my appointment"
- "I want to speak to a real person"

### Character Interactions:
- "Tell me about yourself"
- "Let's chat about something else"
- "Switch to Sherlock character"
- "I want to go back to character mode"

## 🔮 Future Enhancements

### Planned Features:
- **Multi-language Admin Support** - Thai/English admin responses
- **Advanced Analytics** - User interaction tracking
- **Automated Triage** - Smart routing to appropriate admin
- **Integration APIs** - Connect to hospital systems
- **Mobile Admin App** - Admin dashboard mobile version

### Potential Improvements:
- **Voice Support** - Voice-to-text for admin responses
- **File Sharing** - Share documents and forms
- **Appointment Booking** - Direct appointment scheduling
- **Payment Integration** - Online payment for paid camps
- **Notification System** - Push notifications for admins

---

## 📞 Support

For technical support or questions about the new features:
- **Documentation**: Check this file and README.md
- **Testing**: Use the test endpoints provided
- **Issues**: Check the existing troubleshooting guide
- **Admin Access**: Visit `/dashboard` for admin interface

The new features provide a comprehensive solution for medical camp information and human support, making the chatbot more versatile and professional while maintaining the engaging character interactions.
