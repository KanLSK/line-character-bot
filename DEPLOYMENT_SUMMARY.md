# 🚀 Quick Deployment Guide

## TL;DR - Deploy Your Line Bot in 3 Steps

### 1. **Prepare Your Code**
```bash
npm run deploy-prepare
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. **Deploy to Vercel (Recommended)**
- Go to [vercel.com](https://vercel.com)
- Connect GitHub → Import repository
- Add environment variables:
  ```
  LINE_CHANNEL_ACCESS_TOKEN=your_token
  LINE_CHANNEL_SECRET=your_secret
  MONGODB_URI=your_mongodb_uri
  GEMINI_API_KEY=your_gemini_key
  GEMINI_MODEL=gemini-pro
  ```
- Deploy

### 3. **Configure Line Webhook**
- Set webhook URL to: `https://your-app.vercel.app/api/webhook/line`
- Enable webhook in Line Developer Console
- Test your bot!

## 🎯 Alternative Platforms

| Platform | URL | Pros | Cons |
|----------|-----|------|------|
| **Vercel** | vercel.com | ✅ Free, Fast, Easy | ❌ 10s timeout |
| **Railway** | railway.app | ✅ Simple, Good free tier | ❌ Limited bandwidth |
| **Render** | render.com | ✅ Free tier, Reliable | ❌ Slower cold starts |

## 🔧 Environment Variables Required

```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
```

## 📱 Line Bot Setup

1. **Create Line Channel:**
   - [Line Developers Console](https://developers.line.biz/)
   - Create Messaging API channel
   - Get Channel Access Token & Secret

2. **Configure Webhook:**
   - Set webhook URL to your deployed endpoint
   - Enable webhook
   - Enable signature verification

3. **Test Bot:**
   - Add bot as friend (welcome message will appear!)
   - Send test messages
   - Switch characters: `/sherlock`, `/hermione`

## 🧪 Post-Deployment Testing

```bash
# Seed characters
curl "https://your-app.vercel.app/api/test-gemini?createTestCharacter=true"

# Test advanced features
curl "https://your-app.vercel.app/api/test-advanced?action=test-all&userId=test-user&character=velorien&message=เหงาจัง"
```

## 🔍 Troubleshooting

### Common Issues:
- **Build fails**: Run `npm run type-check` locally first
- **Webhook errors**: Verify URL and signature verification
- **Database errors**: Check MONGODB_URI and network access
- **API errors**: Verify API keys and quotas

### Debug Commands:
```bash
npm run validate          # Check setup
npm run type-check        # TypeScript errors
npm run test-gemini       # Test Gemini
npm run test-advanced     # Test features
```

## 📊 What You Get

✅ **5 AI Characters**: Velorien, Sherlock, Hermione, Yoda, Luna  
✅ **Advanced Responses**: Template-based with AI enhancement  
✅ **Context Management**: Relationship tracking & conversation history  
✅ **Response Validation**: Quality scoring & improvement  
✅ **Multi-language**: Thai & English support  
✅ **Production Ready**: Security, logging, error handling  

## 🎉 Success!

Your Line Character Bot is now live and ready for high school students to chat with AI-powered story characters!

**Webhook URL**: `https://your-app.vercel.app/api/webhook/line`

For detailed instructions, see `DEPLOYMENT.md` 