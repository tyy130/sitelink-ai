<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pgK_2VX18Oh4j0BtO2_Btucd_JptllK2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (recommended).
   If you prefer to use OpenAI instead, set `OPENAI_API_KEY` in `.env.local` and leave `USE_GEMINI` unset or false.
   To explicitly switch providers you can set `USE_GEMINI` (true/false).
3. Run the app:
   `npm run dev`
