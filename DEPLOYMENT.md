# 🚀 Deployment Guide

This guide will help you deploy your Line Character Bot to production without using ngrok.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ All environment variables configured
- ✅ MongoDB database set up
- ✅ Line Developer account with Messaging API channel
- ✅ Google AI Studio account with API key
- ✅ GitHub repository with your code

## 🎯 Recommended: Vercel Deployment

### Step 1: Prepare Your Code

1. **Ensure all changes are committed:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Verify your environment variables:**
   ```bash
   npm run validate
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import your project:**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable:
     ```
     LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
     LINE_CHANNEL_SECRET=your_line_channel_secret
     MONGODB_URI=your_mongodb_connection_string
     GEMINI_API_KEY=your_gemini_api_key
     GEMINI_MODEL=gemini-pro
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be available at: `https://your-app-name.vercel.app`

### Step 3: Configure Line Webhook

1. **Get your webhook URL:**
   ```
   https://your-app-name.vercel.app/api/webhook/line
   ```

2. **Update Line Developer Console:**
   - Go to [Line Developers Console](https://developers.line.biz/)
   - Select your Messaging API channel
   - Go to "Messaging API" tab
   - Set "Webhook URL" to your Vercel URL
   - Enable "Use webhook"
   - Save changes

3. **Test the webhook:**
   - Send a message to your bot
   - Check Vercel logs for any errors

## 🚂 Alternative: Railway Deployment

### Step 1: Deploy to Railway

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Sign up/Login with GitHub

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure environment:**
   - Railway will auto-detect Next.js
   - Add environment variables in the "Variables" tab

4. **Deploy:**
   - Railway will automatically deploy
   - Get your domain from the "Settings" tab

### Step 2: Update Line Webhook

- Set webhook URL to: `https://your-app.railway.app/api/webhook/line`

## 🌊 Alternative: Render Deployment

### Step 1: Deploy to Render

1. **Go to Render:**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create Web Service:**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure service:**
   - **Name**: `line-character-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables:**
   - Add all required environment variables

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment

### Step 2: Update Line Webhook

- Set webhook URL to: `https://your-app.onrender.com/api/webhook/line`

## 🔧 Post-Deployment Setup

### Step 1: Seed Characters

After deployment, seed your characters:

```bash
# Using Vercel CLI
vercel env pull .env.local
npm run seed

# Or using the API endpoint
curl "https://your-app.vercel.app/api/test-gemini?createTestCharacter=true"
```

### Step 2: Test Your Bot

1. **Add bot as friend:**
   - Scan QR code from Line Developer Console
   - Add bot to your Line friends

2. **Test basic functionality:**
   - Send "สวัสดี" (Hello)
   - Test character switching: `/sherlock`
   - Test different emotions: "เหงา", "เครียด"

3. **Test advanced features:**
   ```bash
   curl "https://your-app.vercel.app/api/test-advanced?action=test-all&userId=test-user&character=velorien&message=เหงาจัง"
   ```

### Step 3: Monitor Performance

1. **Check Vercel Analytics:**
   - Monitor response times
   - Check error rates
   - Review usage statistics

2. **Monitor Logs:**
   - Check Vercel function logs
   - Monitor MongoDB connection
   - Watch for API errors

## 🔍 Troubleshooting

### Common Deployment Issues

1. **Build Failures:**
   ```bash
   # Check build locally first
   npm run build
   npm run type-check
   ```

2. **Environment Variables:**
   - Ensure all variables are set in hosting platform
   - Check variable names match exactly
   - Verify no extra spaces or quotes

3. **Line Webhook Issues:**
   - Verify webhook URL is correct
   - Check signature verification is enabled
   - Test with Line webhook tester

4. **Database Connection:**
   - Verify MONGODB_URI is accessible from hosting platform
   - Check IP whitelist if using MongoDB Atlas
   - Test connection with simple query

### Debug Commands

```bash
# Test locally before deploying
npm run validate
npm run type-check
npm run test-gemini
npm run test-advanced

# Check production logs
# Vercel: vercel logs
# Railway: railway logs
# Render: Check dashboard logs
```

## 📊 Performance Optimization

### Vercel Optimizations

1. **Enable Edge Functions:**
   - Add `export const runtime = 'edge'` to API routes
   - Reduces cold start times

2. **Optimize Bundle Size:**
   - Use dynamic imports for heavy modules
   - Minimize dependencies

3. **Caching Strategy:**
   - Implement proper caching headers
   - Use Vercel's edge caching

### Database Optimizations

1. **Connection Pooling:**
   - Use connection pooling for MongoDB
   - Implement proper connection management

2. **Indexing:**
   - Add indexes for frequently queried fields
   - Monitor query performance

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit secrets to Git
   - Use hosting platform's secret management
   - Rotate keys regularly

2. **API Security:**
   - Verify Line signatures
   - Implement rate limiting
   - Sanitize all inputs

3. **Database Security:**
   - Use strong passwords
   - Enable IP whitelisting
   - Regular backups

## 📈 Scaling Considerations

1. **Serverless Limits:**
   - Vercel: 10s timeout, 50MB payload
   - Railway: 30s timeout, 512MB RAM
   - Render: 30s timeout, 512MB RAM

2. **Database Scaling:**
   - Consider MongoDB Atlas for scaling
   - Implement connection pooling
   - Monitor query performance

3. **API Limits:**
   - Line API: 1000 messages/second
   - Gemini API: Check quota limits
   - Implement proper error handling

## 🎉 Success Checklist

- ✅ Bot responds to messages
- ✅ Character switching works
- ✅ Advanced features functioning
- ✅ No errors in logs
- ✅ Response times under 2 seconds
- ✅ Webhook verification working
- ✅ Environment variables secure
- ✅ Database connection stable

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review hosting platform documentation
3. Check Line Developer documentation
4. Verify Google AI Studio settings
5. Monitor application logs

Your Line Character Bot is now ready for production! 🚀 