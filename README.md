# AgriTech

**Empowering farmers through digital technology.** AgriTech is a responsive farm management workspace that brings crop planning, local weather, soil health, pest monitoring, and practical farming guidance into one clear dashboard.

## What it includes

- At-a-glance farm health, field activity, and seasonal progress
- Farm and crop tracking with practical growth-stage details
- Weather outlook and timely field alerts
- Soil health indicators and recommendations
- Resource planning, expert help, and community guidance
- A clean, responsive interface designed for everyday farm use

## Technology

- React and Vite (JavaScript)
- CSS, with a component-based interface
- Planned API and data layer: Node.js, Express, and MongoDB

The current frontend uses illustrative sample data. Live weather, soil sensors, accounts, and persisted farm records require the backend and service integrations described in [architecture.md](./architecture.md).

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build:

```bash
npm run build
```

## Project structure

```text
src/       React application and styles
public/    Static public assets
```

## Project status

This is an individual university project. The interface is under active development; integrations are documented separately and should not be treated as live services until implemented.
