# Line Character Bot

A sophisticated Line chatbot that allows users to chat with AI-powered story characters using Google Gemini AI. Features advanced response templates, context management, and personality-consistent interactions.

## 🚀 Features

- **5 Diverse Characters**: Velorien, Sherlock, Hermione, Yoda, Luna
- **Advanced Response System**: Template-based responses with AI enhancement
- **Context Management**: Relationship tracking and conversation history
- **Response Validation**: Quality scoring and improvement suggestions
- **Multi-language Support**: Thai and English responses
- **Personality Consistency**: Character-specific language and behavior patterns

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **AI**: Google Gemini API
- **Database**: MongoDB with Mongoose
- **Messaging**: Line Messaging API
- **Language**: TypeScript
- **Deployment**: Vercel/Railway/Render ready

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Line Developer account
- Google AI Studio account

## 🔧 Environment Variables

Create a `.env.local` file:

```env
# Line Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# Database
MONGODB_URI=your_mongodb_connection_string

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
```

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Validate setup:**
   ```bash
   npm run validate
   ```

4. **Seed characters:**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Test the bot:**
   ```bash
   npm run test-gemini
   npm run test-advanced
   ```

### Production Deployment

#### Option 1: Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update Line Webhook:**
   - Set webhook URL to: `https://your-app.vercel.app/api/webhook/line`
   - Enable webhook in Line Developer Console

#### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

#### Option 3: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Add environment variables
5. Deploy

## 📱 Line Bot Setup

1. **Create Line Channel:**
   - Go to [Line Developers Console](https://developers.line.biz/)
   - Create new Messaging API channel
   - Get Channel Access Token and Channel Secret

2. **Configure Webhook:**
   - Set webhook URL to your deployed endpoint
   - Enable webhook
   - Add webhook signature verification

3. **Test the Bot:**
   - Add bot as friend (you'll get a welcome message!)
   - Send test messages
   - Switch characters with `/character_name`

## 🎭 Characters

### Velorien
- **Language**: Thai (male patterns)
- **Personality**: Gentle, empathetic, wise
- **Style**: Soft, caring responses with emojis

### Sherlock
- **Language**: English
- **Personality**: Analytical, logical, observant
- **Style**: Formal, deductive reasoning

### Hermione
- **Language**: Mixed (Thai/English)
- **Personality**: Knowledgeable, encouraging, studious
- **Style**: Book references, practical advice

### Yoda
- **Language**: Thai (unique speech pattern)
- **Personality**: Wise, philosophical, patient
- **Style**: Reverse sentence structure, wisdom

### Luna
- **Language**: Thai
- **Personality**: Dreamy, mystical, eccentric
- **Style**: Magical creature references, wonder

## 🧪 Testing

### Test Advanced Features
```bash
# Test all advanced features
curl "http://localhost:3000/api/test-advanced?action=test-all&userId=test-user&character=velorien&message=เหงาจัง"

# Test response templates
curl "http://localhost:3000/api/test-advanced?action=test-templates&character=velorien&message=เครียดมาก"

# Test context management
curl "http://localhost:3000/api/test-advanced?action=test-context&userId=test-user&character=velorien&message=สวัสดี"
```

### Test Gemini Integration
```bash
# Test basic Gemini connection
curl "http://localhost:3000/api/test-gemini"

# Create test character
curl "http://localhost:3000/api/test-gemini?createTestCharacter=true"
```

## 📊 Advanced Features

### Response Templates
- 5+ response patterns per situation
- Context-aware template selection
- Emotion and mood detection
- Time-based responses

### Context Management
- User relationship tracking (New → Familiar → Close)
- Conversation mood analysis
- Topic extraction and tracking
- Personalized prompts

### Response Validation
- Quality scoring (0-100)
- Personality consistency checking
- Repetition detection
- Improvement suggestions

### Character Switching
- Use `/character_name` to switch characters
- Example: `/sherlock`, `/hermione`, `/yoda`
- Maintains conversation context

## 🔍 Troubleshooting

### Common Issues

1. **"Character not found"**
   - Run `npm run seed` to populate characters
   - Check character names in database

2. **Line API errors**
   - Verify Channel Access Token
   - Check webhook URL configuration
   - Ensure signature verification is enabled

3. **Gemini API errors**
   - Verify GEMINI_API_KEY
   - Check API quota and limits
   - Review safety filter settings

4. **Database connection issues**
   - Verify MONGODB_URI
   - Check network connectivity
   - Ensure database is accessible

### Debug Commands

```bash
# Check setup
npm run validate

# Type checking
npm run type-check

# Test specific features
npm run test-advanced
npm run test-gemini
```

## 📈 Performance

- **Response Time**: < 2 seconds average
- **Uptime**: 99.9% (with proper hosting)
- **Scalability**: Handles multiple concurrent users
- **Memory Usage**: Optimized for serverless deployment

## 🔒 Security

- Line signature verification
- Environment variable protection
- Input sanitization
- Rate limiting (via hosting provider)
- HTTPS enforcement

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📞 Support

For issues and questions:
- Check troubleshooting section
- Review Line Developer documentation
- Check Google AI Studio documentation