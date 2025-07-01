# Line Character Bot

A Line bot for high school students to chat with AI-powered story characters using Next.js 14, MongoDB Atlas, OpenAI GPT-4, and the Line Messaging API.

## Features

- 🤖 AI-powered character conversations
- 🎭 Multiple character role-play switching
- 💾 Conversation history storage
- 📱 Rich LINE bot interface
- 🔒 Admin dashboard for character management

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4
- **Messaging**: LINE Messaging API
- **Hosting**: Vercel

## 🚀 Project Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd line-character-bot
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in all required values:
     - `MONGODB_URI`, `MONGODB_DB_NAME`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

4. **Validate environment variables:**
   - Run:
     ```sh
     node scripts/validate-setup.cjs
     ```
   - The script will check for required environment variables and files.

## 🏃 Running the Project

- **Development:**
  ```sh
  npm run dev
  ```
- **Production Build:**
  ```sh
  npm run build && npm start
  ```

## 🧪 Testing

### Webhook Event Testing

- **Run all webhook event tests:**
  ```sh
  node scripts/test-webhook.mjs
  ```
- This will test:
  - Valid signature (text message event)
  - Invalid signature
  - Follow event
  - Unfollow event
  - Malformed request
- **Check the output** for ✅ on each scenario and review the response for error IDs and debug info.

### Health Check Endpoint
- Visit or curl:
  ```sh
  http://localhost:3000/api/webhook/line/health
  ```
  or the port shown in your terminal (e.g., 3001).
- Should return JSON with `env`, `database`, `lineApi` all `true` if healthy.

### Local Testing with ngrok
- To test with the real LINE platform:
  1. Start your app: `npm run dev`
  2. In another terminal:
     ```sh
     npx ngrok http 3000
     ```
  3. Set the ngrok HTTPS URL as your webhook URL in the LINE Developer Console:
     ```
     https://<ngrok-id>.ngrok.io/api/webhook/line
     ```

## 🛡️ Security & Best Practices
- All secrets and credentials are managed via environment variables.
- Admin endpoints require HTTP Basic Auth using `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Webhook requests are verified for authenticity.
- All API and DB operations use strict TypeScript typing and robust error handling.
- **Security Checklist:**
  - [ ] No sensitive data in logs or error messages
  - [ ] Signature verification enforced for all webhook requests
  - [ ] All user input validated and sanitized
  - [ ] Error responses do not leak stack traces or secrets
  - [ ] Rate limiting considered for production
  - [ ] Environment variables are not hardcoded

## 📝 Manual Test Checklist
- [ ] Valid signature, valid text message event (should echo back)
- [ ] Invalid signature (should return 400 with error ID)
- [ ] Follow event (should send welcome message)
- [ ] Unfollow event (should log the event)
- [ ] Malformed request (should return 500 with error ID)
- [ ] Health check endpoint returns all `true`

## 🛠️ Troubleshooting
- If environment variables are not loaded in scripts:
  - Ensure `.env.local` is in the project root and formatted correctly
  - Use `dotenv.config({ path: '.env.local' })` in scripts
  - Restart your terminal after changes
- If webhook tests fail, check:
  - The app is running (`npm run dev`)
  - The correct port and URL are used in the test script
  - The signature is generated with the correct secret

## 📂 Project Structure

See the top of this README or the project context for a detailed folder and file breakdown.

---

For more details, see the in-code comments and the project context above. Happy building!

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- OpenAI API account
- LINE Developers account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/line-character-bot.git
   cd line-character-bot