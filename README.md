# KitaVisa — AI Visa Application Assistant

## Pitching Video (10 Minutes Demo)

Watch the full product demo here:  
https://drive.google.com/file/d/1jVROzCGdipBpFYIn_zDrVrjc_N0SlCsQ/view?usp=share_link
---

## Project Documentation

All official documentation is included in this repository:

- Product Requirement Document (PRD) — `docs/ID162_UMHackathon2026 Product Requirement Documentation.docx.pdf`
- System Analysis Document (SAD) — `docs/ID 162_UMHakcathon2026 System Analysis Documentation.docx.pdf`
- Testing Analysis Document (TAD) — `docs/ID162_UMHakcathon2026 Testing Analysis Documentation (Preliminary).pdf`
- Pitch Deck — `docs/ID162_Pitch Deck.pdf`

---

## Project Overview

KitaVisa is an AI-powered visa assistant that helps users understand and prepare their visa applications through a guided conversational experience.

Instead of manually searching across fragmented sources, users interact with an AI system that:

- Identifies visa type from natural language input
- Explains required documents clearly
- Detects missing requirements (gap analysis)
- Guides users step-by-step through preparation

---

## Key Features

- Visa intent classification (Student, Work, Dependent, Social Visit)
- Conversational AI assistant for visa guidance
- Document requirement gap detection
- Step-by-step visa preparation workflow
- Real-time chat-based interaction system

---

## System Architecture

- Frontend: React (Vite)
- Backend: Node.js + Express
- AI Engine: GLM (Z.AI)
- Architecture: Client-server with AI orchestration layer

---

## Setup Instructions

### 1. Install dependencies
```
npm install
```

### 2. Run backend
```
npm run dev
```
### 3. Run frontend
```
npm run dev
```
## Environment Variables

Create a .env file in /backend:
```
GLM_API_KEY=your_key_here
AI_BASE_URL=https://api.z-ai.com
```
