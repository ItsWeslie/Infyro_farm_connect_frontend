# Infyro Farm Connect — Frontend

A responsive React + Vite farm-management UI prototype for Infyro Farm Connect. Built with a custom earth-inspired visual system and Lucide icons.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ (recommended for current Vite releases).

```bash
npm install
npm run dev
```

Build the production bundle:

```bash
npm run build
npm run preview
```

## UI screens

- **Overview:** dashboard hero, farm metrics, crop progress table, recent activity, field note, and an illustrative six-month income/expense comparison.
- **Farms:** farm directory, acreage and field summaries, search/filter, add-farm dialog.
- **Fields:** field directory, farm association, crop assignment, availability status.
- **Crop management:** crop directory, growth progress, status filters, add-crop dialog.
- **Activities:** activity log, completion status, search and filters.
- **Calendar:** interactive month grid and agenda view with sample events.
- **Expenses:** sample expense ledger, totals, category and status presentation.
- **Harvest records:** sample harvest history, yield and grade details.
- **Notifications:** notification list and mark-all-read interaction.
- **Settings:** local preferences for units, weather, reminders and weekly summary.

## Design and interactions

- React functional components and local state; no backend calls are made.
- Lucide icons via `lucide-react`.
- Responsive desktop, tablet, and mobile layouts.
- Search, filters, table/card view switching, create/edit dialogs with controlled fields, record-detail modals, calendar event composer, toasts, calendar navigation, and settings toggles.
- All content is illustrative sample data. Entries and preferences are not persisted to a server.
- Earth-inspired colors, accessible focus states, and reduced-motion support.

## Backend configuration

Set `VITE_API_BASE_URL` to the Spring Boot backend origin (for example, `http://localhost:8080`). The backend must allow the exact frontend origin through CORS and allow credentials.

### Authentication contract

- Login returns an `accessToken` in JSON. The frontend keeps this short-lived token in memory and sends it as `Authorization: Bearer <token>` on protected requests.
- The backend refresh token is an HttpOnly `refresh_token` cookie scoped to `/ifc/v1/auth`. The frontend never reads or stores it.
- The readable `XSRF-TOKEN` cookie is sent as `X-XSRF-TOKEN` for refresh and logout requests.
- On application startup, the frontend attempts refresh-cookie rotation and then validates the returned access token. If refresh fails, the user is signed out.
- A protected request that receives 401 triggers one shared refresh attempt and one retry. If that fails, the app emits `ifc_auth_expired` and clears the local session.
- Use HTTPS and secure cookies in production. For cross-site frontend/backend deployments, configure compatible SameSite/Secure cookie settings and the exact CORS origin.

The API client includes backend route mappings for farms, fields, crop types, crop plantings, crop activities, expenses, harvest records, summaries, calendar events, and notifications. This does not mean every workspace screen is fully wired to live data yet.

## Current scope

The workspace screens still contain prototype/sample data and several create/edit interactions remain local UI placeholders. Phase 1 establishes the shared authentication and API-client foundation; subsequent phases connect each feature's data loading and CRUD workflows. The dashboard income chart remains illustrative until a backend sales/revenue module exists.
