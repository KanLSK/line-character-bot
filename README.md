# Line Character Bot

A Line bot for high school students to chat with AI-powered story characters using Next.js 14, MongoDB Atlas, OpenAI GPT-4, and the Line Messaging API.

## Features

- 🤖 AI-powered character conversations
- 🎭 Multiple character role-play switching
- 💾 Conversation history storage
- 📱 Rich LINE bot interface
- 🔐 Admin dashboard for character management

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
   - The project will check for required environment variables at startup and throw an error if any are missing.

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

- **Test MongoDB connection:**
  ```sh
  npx ts-node scripts/test-db.ts
  ```
- **Test Characters API endpoint:**
  ```sh
  npx ts-node scripts/test-api.ts
  ```
- **Simulate Line webhook event:**
  ```sh
  npx ts-node scripts/test-webhook.ts
  ```

## 🗂️ Project Structure

See the top of this README or the project context for a detailed folder and file breakdown.

## 🛡️ Security & Best Practices
- All secrets and credentials are managed via environment variables.
- Admin endpoints require HTTP Basic Auth using `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Webhook requests are verified for authenticity.
- All API and DB operations use strict TypeScript typing and robust error handling.

## 📝 Development Notes
- All utility and API functions are commented for clarity.
- Use the provided test scripts to verify your setup and endpoints.
- For local Line webhook testing, use a tool like [ngrok](https://ngrok.com/) to expose your local server.

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