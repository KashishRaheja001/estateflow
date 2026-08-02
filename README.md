# 🏡 EstateFlow - AI Real Estate Calling Agent

EstateFlow is a modern, AI-powered real estate CRM and voice-agent dashboard. It allows real estate agencies to manage leads, track properties, and initiate **outbound AI voice calls** to qualify leads autonomously using Bolna AI.

## ✨ Features

- **🤖 AI Voice Calling:** One-click automated calling to leads using Bolna AI.
- **📊 Real-time Lead Management:** Track leads, their statuses, and associated properties.
- **🏢 Property Management:** Add and manage property inventory (projects, builders, locations).
- **🪝 Automated Webhooks:** Receives post-call summaries and transcripts from Bolna AI automatically.
- **⚡ Modern Tech Stack:** Built with Next.js 15 (App Router), React 19, Tailwind CSS, and Shadcn UI.
- **🗄️ Supabase Database:** Fully integrated with Supabase PostgreSQL for fast, reliable data storage.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn UI
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **AI Voice Agent:** Bolna AI
- **Deployment:** Vercel

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/KashishRaheja001/estateflow.git
cd estateflow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key

BOLNA_API_KEY=your_bolna_api_key
NEXT_PUBLIC_BOLNA_AGENT_ID=your_bolna_agent_id
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema
The database requires three tables: `properties`, `leads`, and `calls`. You can find the required SQL schema in `src/lib/database_schema.sql`.

## 🤖 Bolna AI Webhook Setup
To receive call summaries and transcripts:
1. Go to your Bolna AI Dashboard -> Extractions.
2. Set the Webhook URL to: `https://your-deployment-url.com/api/webhook`
3. The app will automatically capture the transcript and update the lead status to "Contacted".

---
*Built with ❤️ for the future of Real Estate AI.*
