# TrendGo

TrendGo is a personalized social event discovery platform that helps users discover experiences worth attending based on their interests, location, and social activity.

## Features

- Personalized event recommendations
- Interest-based onboarding
- Event discovery by category, location, and time
- Save and mark events as interested
- Friend connections and event invitations
- Social activity around events
- Personalized match scores
- AI-powered event discovery and recommendations
- Responsive modern UI

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express.js
- MongoDB
- REST APIs
- AI APIs

## Backend Setup

The backend foundation lives in `server/` and runs as a separate Express service from the Vite frontend. It provides a MongoDB connection, CORS configuration, centralized errors, request validation, request IDs, `GET /api/health`, and JWT authentication using HTTP-only cookies.

### Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

### Environment

Copy `.env.example` to `.env` and set the values for your environment:

```powershell
Copy-Item .env.example .env
```

The backend reads `MONGODB_URI`, `PORT`, `CLIENT_ORIGIN`, and `NODE_ENV` from `.env`. Do not commit `.env` or place credentials in frontend `VITE_*` variables.

### Run the services

Install dependencies, then run the frontend and backend together:

```powershell
npm install
npm run dev:all
```

The frontend runs at `http://localhost:8080` and the API runs at `http://localhost:5000`.

To run them separately:

```powershell
npm run dev
npm run server:dev
```

Verify the backend with:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

User profile, events, recommendations, friendships, notifications, and other application API endpoints are not implemented yet.

## Vision

TrendGo goes beyond traditional event listings by combining personalized recommendations with social discovery, helping people find experiences that match their interests and people they want to experience them with.