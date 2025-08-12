#!/bin/bash

echo "🚀 Line Character Bot - Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found. Please create it with your environment variables."
    echo "📝 Required variables:"
    echo "   - LINE_CHANNEL_ACCESS_TOKEN"
    echo "   - LINE_CHANNEL_SECRET"
    echo "   - MONGODB_URI"
    echo "   - GEMINI_API_KEY"
    echo "   - GEMINI_MODEL"
    exit 1
else
    echo "✅ .env.local found"
fi

# Run validation
echo "🔍 Running validation..."
npm run validate

if [ $? -eq 0 ]; then
    echo "✅ Validation passed"
else
    echo "❌ Validation failed. Please fix the issues before deploying."
    exit 1
fi

# Run type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ Type check passed"
else
    echo "❌ Type check failed. Please fix the TypeScript errors before deploying."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
else
    echo "✅ Git repository found"
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "   Please commit your changes before deploying:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo "   git push origin main"
else
    echo "✅ All changes are committed"
fi

echo ""
echo "🎯 Deployment Options:"
echo "======================"
echo ""
echo "1. 🚀 Vercel (Recommended):"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub account"
echo "   - Import your repository"
echo "   - Add environment variables"
echo "   - Deploy"
echo "   - Webhook URL: https://your-app.vercel.app/api/webhook/line"
echo ""
echo "2. 🚂 Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub account"
echo "   - Create new project from repo"
echo "   - Add environment variables"
echo "   - Deploy"
echo "   - Webhook URL: https://your-app.railway.app/api/webhook/line"
echo ""
echo "3. 🌊 Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub account"
echo "   - Create Web Service"
echo "   - Add environment variables"
echo "   - Deploy"
echo "   - Webhook URL: https://your-app.onrender.com/api/webhook/line"
echo ""
echo "📋 Post-Deployment Checklist:"
echo "============================="
echo "1. ✅ Deploy to your chosen platform"
echo "2. ✅ Add environment variables"
echo "3. ✅ Update Line webhook URL"
echo "4. ✅ Seed characters: curl 'https://your-app.com/api/test-gemini?createTestCharacter=true'"
echo "5. ✅ Test bot functionality"
echo "6. ✅ Monitor logs and performance"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "npm run validate          # Validate setup"
echo "npm run type-check        # Check TypeScript"
echo "npm run test-gemini       # Test Gemini integration"
echo "npm run test-advanced     # Test advanced features"
echo ""
echo "📚 Documentation:"
echo "================="
echo "README.md                 # Main documentation"
echo "DEPLOYMENT.md             # Detailed deployment guide"
echo ""
echo "🎉 Your Line Character Bot is ready for deployment!" 