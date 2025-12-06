# SiteLink AI - Copilot Instructions

## Project Overview
SiteLink AI is a construction management dashboard built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**. It leverages OpenAI's **GPT-4o** model for AI-assisted tasks like drafting RFIs and reviewing submittals.

## Architecture & State Management
- **Single Page Application (SPA):** The app uses a custom view-based navigation system managed in `App.tsx` (`currentView` state), rather than a library like React Router.
- **Centralized State:** `App.tsx` serves as the single source of truth for application state (Projects, RFIs, Submittals, Logs, etc.). Data is passed down to child components via props.
- **Persistence:** Data is persisted to `localStorage` under keys like `sitelink_projects`. `App.tsx` handles hydration and migration of legacy data.
- **Data Model:** All core interfaces (`Project`, `RFI`, `Submittal`, etc.) are defined in `types.ts`. Always reference this file when modifying data structures.

## AI Integration Pattern
- **Service Layer:** All AI interactions are encapsulated in `services/openaiService.ts`.
- **Model:** We use `gpt-4o` via the `openai` SDK.
- **Structured Output:** AI prompts are designed to return structured JSON using OpenAI's `response_format` with JSON Schema.
- **Environment:** The API key is loaded from `.env.local` as `OPENAI_API_KEY` and exposed via `vite.config.ts` as `process.env.API_KEY`.

## Component Guidelines
- **Functional Components:** Use React functional components with hooks.
- **Styling:** Use **Tailwind CSS** utility classes for all styling. Avoid inline styles or CSS files.
- **Icons:** Use `lucide-react` for iconography.
- **Props:** Define explicit interfaces for component props (e.g., `interface DashboardProps { ... }`).

## Critical Workflows
- **Development:** Run `npm run dev` to start the Vite development server on port 3000.
- **Build:** Run `npm run build` for production builds.
- **Environment Setup:** Ensure `OPENAI_API_KEY` is set in `.env.local` for AI features to work.

## Common Patterns
- **Filtering:** Search and filter logic is often implemented directly within components (e.g., `Dashboard.tsx`) based on props.
- **Dates:** Use ISO strings (`YYYY-MM-DD`) for date storage and comparison.
