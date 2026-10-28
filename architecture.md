# AgriTech Architecture

## Goals

AgriTech helps farmers make everyday decisions with a simple, mobile-first workspace for farms, crops, local conditions, soil, and field alerts. The first deliverable is a Vite + React frontend. The system is intended to grow into a MERN application; integrations must be clearly labeled until backed by real services.

## System overview

```text
Farmer / Admin browser
        │ HTTPS, JSON
        ▼
React + Vite single-page application
        │ /api/v1 requests
        ▼
Express API ── authentication & validation middleware
        │                     │
        ▼                     ▼
MongoDB              Weather / advisory providers
```

The browser owns presentation and accessible interactions. The API owns authorization, validation, business rules, and persistence. External provider credentials stay on the server. The current frontend uses sample data and does not yet claim live integrations or secure login.

## Frontend

- React with Vite and JavaScript; no standalone static HTML application.
- Feature-oriented UI: dashboard, farms, crops, insights, alerts, resources, experts, and administration.
- Shared navigation, status cards, forms, and responsive layout primitives.
- Keep provider and API access behind service modules so sample data can later be replaced without rewriting views.
- Store only non-sensitive presentation preferences in the browser. Treat server responses as untrusted input.
- Design for touch, keyboard access, clear language, low-bandwidth use, and future localization.

## Backend (planned)

- Node.js and Express REST API, versioned under `/api/v1`.
- Route → authentication/authorization and validation middleware → controller → service → model.
- Central error handler, request logging with sensitive values redacted, health endpoint, and configuration through environment variables.
- Validate all identifiers, query parameters, and request bodies at the API boundary. Apply ownership checks to every farmer-owned record.

### Initial endpoints

| Area | Example endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Farms | `GET/POST /farms`, `GET/PATCH/DELETE /farms/:farmId` |
| Crops | `GET/POST /farms/:farmId/crops`, `GET/PATCH/DELETE /crops/:cropId` |
| Insights | `GET /farms/:farmId/weather`, `GET /farms/:farmId/soil`, `GET /farms/:farmId/alerts` |
| Resources & orders | `GET /resources`, `POST /orders`, `GET /orders/:orderId` |
| Community & experts | `GET/POST /discussions`, `GET/POST /consultations` |
| Admin | `/admin/users`, `/admin/resources`, `/admin/reports` (admin only) |

## Data model (planned)

Use MongoDB collections with timestamps, indexes, and explicit ownership references.

- **User**: name, normalized email, password hash, role (`farmer` or `admin`), preferred locale, status.
- **Farm**: owner user ID, name, location coordinates and address, area and unit, soil profile, irrigation details.
- **Crop**: farm ID, crop/variety, plot, planting and expected harvest dates, growth stage, notes.
- **Activity**: farm/crop IDs, type, date, notes, optional attachment metadata.
- **WeatherSnapshot**: farm ID, provider, observation/forecast time, normalized conditions, expiry; cache provider responses rather than treating forecasts as permanent truth.
- **Alert**: farm ID, type, severity, source, message, created/expiry times, read state.
- **Resource / Order**: approved catalog item, buyer and item references, quantities, status, and an auditable status history.
- **Discussion / Consultation**: author, content or booking details, moderation state, timestamps.

Index user email uniquely; index farm owner, farm/crop references, and time-based feeds. Use schema validation and delete/retention rules that preserve ownership and audit requirements.

## Authentication and authorization

- Hash passwords with bcrypt (or a maintained equivalent) and never return hashes.
- Short-lived signed access tokens; use refresh tokens with rotation and revocation. In a browser, prefer secure, HttpOnly, SameSite cookies and CSRF protection for cookie-authenticated writes.
- The API enforces farmer ownership and admin role checks on every protected route. Hiding a UI control is not authorization.
- Rate-limit authentication, validate email and password input, use HTTPS in deployment, and keep signing secrets outside source control.

## Weather, soil, and pest information

- Weather forecasts require a configured provider, farm coordinates, attribution, caching, and clear forecast timestamps.
- Soil health is a recorded observation or sensor/provider result with units, collection time, and source; recommendations must not imply a lab diagnosis.
- Pest alerts should include region/crop, source, issue date, severity, and expiry. Keep user reports distinct from verified advisories.
- Never fabricate “real-time” readings. Display sample or unavailable states until a real data source is configured.

## Configuration and deployment

- Frontend environment: only public values prefixed with `VITE_`; never put secrets in frontend variables.
- Backend variables (planned): `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN`, and provider keys.
- Local frontend: `npm run dev`; production bundle: `npm run build` and serve the generated `dist/` through a static host or reverse proxy.
- Deploy API and database separately, restrict database network access, enable backups, and use TLS. Add health checks and structured, redacted logs before public deployment.

## Delivery sequence

1. Vite + React foundation and accessible responsive dashboard.
2. Farm and crop views with sample data and honest empty/loading states.
3. Express API, MongoDB models, validation, and error handling.
4. Authentication, farmer ownership, and admin authorization.
5. Weather and advisory provider integrations with attribution and caching.
6. Orders, expert consultation, community moderation, and reporting.
7. Verification of API workflows, accessibility, responsive layouts, and deployment configuration.

## Current boundary

Only the React/Vite frontend is implemented at this stage. MongoDB, Express APIs, JWT authentication, live weather/soil feeds, notifications, and persistent records remain planned work. Do not use this application to make urgent safety or crop-treatment decisions without checking trusted local agricultural guidance.
