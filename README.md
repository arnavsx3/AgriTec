# AgriTech

**Empowering farmers through digital technology.** AgriTech is a responsive farm management workspace that brings crop planning, local weather, soil health, pest monitoring, and practical farming guidance into one clear dashboard.

## What it includes

- At-a-glance farm health, field activity, and seasonal progress
- Farm and crop tracking with practical growth-stage details
- Express API with registration, login, refresh/logout, and owner-scoped farm/crop CRUD
- Weather outlook and timely field alerts
- Soil health indicators and recommendations
- Resource planning, expert help, and community guidance
- A clean, responsive interface designed for everyday farm use

## Technology

- React and Vite (JavaScript)
- CSS, with a component-based interface
- API and data layer: Node.js, Express, MongoDB, JWT, bcrypt, and Zod validation

The dashboard starts with illustrative sample data. The API persists accounts, farms, and crops in MongoDB. Weather, soil sensors, alerts, orders, community posts, and expert consultations still need their provider or feature integrations, as described in [architecture.md](./architecture.md).

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The API requires a MongoDB instance (local or Atlas). In another terminal, copy `.env.example` to `.env`, set the database URI, two different random JWT secrets, and `VITE_API_URL`, then start both parts:

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and random secrets
npm run dev:all
```

The API listens on `http://localhost:4000`. Sign in from the profile button to connect farm and crop records; the API-backed farm and crop views require MongoDB to be running. Check `GET /api/v1/health` for API and database status. For only the frontend, `npm run dev` is enough. To create a production frontend build:

```bash
npm run build
```

## Project structure

```text
src/       React application and styles
server/    Express API, auth middleware, models, and routes
public/    Static public assets
```

## Project status

This is an individual university project. The interface is under active development; integrations are documented separately and should not be treated as live services until implemented.
