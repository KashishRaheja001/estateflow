# EstateFlow AI Voice Agent - Submission Document

## 1. Project Links and Deliverables
- **Live Working URL / Demo Link**: [Insert Vercel URL here]
- **Source Code Repository**: https://github.com/KashishRaheja001/estateflow
- **Video Demo**: [Insert link to video recording]

## 2. Tools and Technologies Used
- **Frontend Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS, PostCSS
- **Database**: Supabase (PostgreSQL) for storing leads, properties, and call execution records
- **Language**: TypeScript
- **Deployment**: Vercel

## 3. AI Model Used
- **Large Language Model (LLM)**: OpenAI GPT-4o / Claude 3.5 Sonnet (configured via Bolna)
- The agent utilizes these models for real-time natural language understanding and dynamic conversation branching, ensuring intelligent lead qualification based on the user's responses.

## 4. Voice or Calling Platform Used
- **Voice Platform**: Bolna API
- Bolna handles the underlying telephony, text-to-speech (TTS), speech-to-text (STT), and low-latency streaming. We integrated Bolna's execution API (`/batches` and `/executions`) to trigger AI phone calls directly from the web dashboard.
- We also integrated **Bolna Webhooks** to receive real-time updates (transcripts, summaries, call status, extracted JSON data) when the call finishes.

## 5. How the Conversation Flow Was Created
- **Prompt Engineering**: The conversation flow was established by defining a comprehensive system prompt and instruction set within the Bolna platform.
- **Goal-Oriented Design**: The agent is instructed to act as a Real Estate Assistant with the goal of qualifying a lead. It asks specific questions (e.g., property budget, desired location, timeline) and responds empathetically.
- **Data Extraction**: Using Bolna's extraction capabilities, the agent dynamically identifies and parses key variables from the natural conversation (e.g., extracted budget, extracted interest level) which is then pushed to our webhook.

## 6. Challenges Faced
- **Webhook Deduplication**: Initially, Bolna would fire multiple webhook events, and calls initiated from the Bolna dashboard (without strict phone number bindings) caused our database to create duplicate "Unknown Caller" leads. This was solved by adding an upsert pattern and strict phone-number matching logic to map calls back to the canonical lead.
- **Asynchronous Transcript Availability**: The webhook `completed` event payload occasionally arrived before the full transcript was generated on Bolna's end. We solved this by using the `execution_id` from the webhook to make a separate `GET /executions/{id}` REST API call back to Bolna, ensuring we always pull the complete transcript and summary.
- **Foreign Key Constraints**: Deleting a lead in the Supabase dashboard crashed the app because call records were tied to the lead ID. We resolved this by implementing cascading deletes via our server actions (`leadActions.ts`).

## 7. What We Would Improve in the Next Version
- **Live Call Transcripts**: Currently, transcripts are fetched after the call completes. In the next iteration, we would implement WebSockets to stream the transcript to the web dashboard in real-time while the call is happening.
- **Advanced Appointment Scheduling**: We would integrate Google Calendar / Cal.com APIs directly into the AI's tool-calling capabilities so it can physically book calendar slots during the conversation.
- **Twilio SIP Integration**: For better cost management and custom caller ID routing, we would attach our own Twilio SIP trunks rather than relying entirely on the default platform numbers.
- **Advanced Analytics**: Add graphs measuring call duration vs. success rate, and AI sentiment analysis mapping.
