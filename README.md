# 💾 QuizGen AI (v2.0)

**QuizGen AI** is an "Old School" inspired, AI-powered quiz generator that turns any topic into a 10-question challenge instantly. Powered by the **Groq API** and wrapped in a nostalgic **Windows 95 aesthetic**.

## 🚀 Features

-   **AI Protocol**: Leverages `llama-3.3-70b-versatile` via Groq for lightning-fast question generation.
-   **Retro UI**: Authentically styled after classic Windows 95 dialog boxes with a teal desktop background.
-   **Mission Difficulty**: Choose between **Easy**, **Medium**, or **Hard** modes to challenge your knowledge.
-   **Time Trial**: Optional **Timed Mode** (20s per question) for maximum urgency.
-   **Mission Report**: A detailed review screen at the end showing your answers vs. the correct ones.
-   **Retro Audio**: 8-bit sound effects generated via Web Audio API.

## 🛠️ Technology Stack

-   **Frontend**: Vanilla HTML5, CSS3 (Retro styling), and JavaScript.
-   **AI Engine**: [Groq API](https://groq.com/) (OpenAI-compatible).
-   **Serverless Proxy**: Vercel Serverless Functions (Node.js) to securely handle API keys.
-   **Styling**: Custom CSS (No frameworks) for pixel-perfect retro aesthetics.

## 📦 Getting Started

### Prerequisites
-   A **Groq API Key** (Get it at [console.groq.com](https://console.groq.com/)).
-   [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`).

### Local Development
1. Clone the repository.
2. Create a `.env.local` file in the root:
   ```bash
   GROQ_API_KEY=your_gsk_key_here
   ```
3. Run the development server:
   ```bash
   vercel dev
   ```
4. Open `http://localhost:3000` in your browser.

## 🚢 Deployment

1. Set your `GROQ_API_KEY` in your Vercel Project Settings (Environment Variables).
2. Run `vercel` or push your changes to GitHub for automatic deployment.

## 📄 Mission Wishlist
Check out [improvements_wishlist.md](./.gemini/antigravity/brain/b51959df-b4fe-4c7d-88f1-0838d8ed62e5/improvements_wishlist.md) for planned future upgrades!

---
*Created by Royston Soans*
