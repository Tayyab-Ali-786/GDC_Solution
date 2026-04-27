# Founder Brain 🧠⚡
**The AI Coordination Intelligence Layer for Early-Stage Startups**

Built for the "Build with AI" Hackathon 2026.

## 🚨 The Problem: The "Coordination Gap"
In early-stage startups, founders move incredibly fast. The technical founder is pushing code, and the business founder is selling to clients. Often, they drift out of sync:
- Sales promises a feature Engineering isn't building.
- Engineering deploys an expensive architecture that breaks the financial runway.
- Marketing pivots to a Gen-Z audience while Product is building B2B enterprise tools.

This **Coordination Gap** causes friction, broken promises to investors, and wasted runway. 

## 💡 The Solution: Founder Brain
Founder Brain is an AI-powered intelligence layer that sits in the background of a startup's operations. It actively monitors the daily logs, decisions, and commitments made by founders. 

Using **Gemini 1.5 Flash**, it semantically analyzes these actions in real-time against recent history. If it detects a strategic drift or a conflicting commitment, it instantly alerts the team with a "Coordination Gap" warning and suggests a resolution.

## ⚙️ How It Works (Architecture)

1. **Activity Ingestion:** Founders log their daily decisions or commitments (simulating integrations with tools like Slack, Linear, or CRM).
2. **Context Retrieval:** The Next.js backend fetches the most recent historical logs from **Firebase Firestore** to build a context window.
3. **AI Analysis:** The new action + historical context is sent to the **Gemini API (`gemini-flash-latest`)** with a strict JSON-schema prompt. Gemini analyzes for semantic conflicts (e.g., promising a feature vs. delaying a feature).
4. **Real-Time Alerting:** If a conflict is detected, Gemini returns the drift summary and a suggested resolution. This is saved to Firestore.
5. **Live Dashboard:** The frontend uses Firebase `onSnapshot` listeners to instantly render the active conflicts on the dashboard without a page refresh, using a high-stakes, pulse-animated UI.

## 🛠️ Tech Stack
*   **Frontend:** Next.js (App Router), React, Tailwind CSS (Custom Premium Glassmorphic UI)
*   **Backend:** Next.js API Routes
*   **Database:** Firebase Firestore (Real-time NoSQL)
*   **AI / Intelligence:** Google Generative AI SDK (Gemini 1.5 Flash)

## 🎭 Demo Scenarios (Try These!)

To see the power of Founder Brain, try logging these sequences in the dashboard:

**Scenario 1: The Enterprise Overpromise**
1. *Sam (Technical):* "We've decided to delay the SOC2 compliance audit until Q4 to focus on core shipping."
2. *Paul (Business):* "Just got off a call with Bank of America. They are signing a $100k deal; I told them SOC2 will be certified by the end of next month."
> **Result:** AI catches the timeline conflict and warns about the BofA contract risk.

**Scenario 2: The Pricing Drift**
1. *Paul (Business):* "Drafted the new marketing email to all users announcing our price drop to $10/month. Sending tomorrow."
2. *Sam (Technical):* "Just updated the Stripe integration to charge $20/month for all new signups."
> **Result:** AI flags that marketing and billing are out of sync.

**Scenario 3: The Runway Disaster**
1. *Paul (Business):* "Updated the financial model to extend runway to 18 months. Strict hiring freeze across all departments."
2. *Sam (Technical):* "Just sent out a formal offer letter to a Senior DevOps Engineer for $180k/year."
> **Result:** AI flags a critical violation of the new financial constraints.

*(Use the "🗑️ Reset" button in the top right to clear data between demo scenarios).*

---

## 🚀 Getting Started (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/Tayyab-Ali-786/GDC_Solution.git
cd GDC_Solution/web
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the `/web` directory. You will need Firebase credentials and a Gemini API key.
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the results. 
