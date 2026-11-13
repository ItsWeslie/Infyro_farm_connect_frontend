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
- **Farms:** live backend farm directory, land/field summaries, search, create, rename and delete.
- **Fields:** live backend field directory scoped to a selected farm, with create, rename, delete, total area and available area.
- **Crop management:** live farm-scoped crop library and field plantings, with create/edit/delete, area validation, planting dates, expected harvest dates, and lifecycle status transitions.
- **Activities:** live planting-specific activity journal with create/edit, crop-stage notes, nutrition/water and pest-control notes, and lifecycle status transitions.
- **Calendar:** interactive month grid and agenda view with sample events.
- **Expenses:** sample expense ledger, totals, category and status presentation.
- **Harvest records:** sample harvest history, yield and grade details.
- **Notifications:** notification list and mark-all-read interaction.
- **Settings:** local preferences for units, weather, reminders and weekly summary.

## Design and interactions

- React functional components and local state. The shared API client now supports backend authentication and route calls; workspace screens are still being migrated from sample data.
- Lucide icons via `lucide-react`.
- Responsive desktop, tablet, and mobile layouts.
- Search, filters, table/card view switching, create/edit dialogs with controlled fields, record-detail modals, calendar event composer, toasts, calendar navigation, and settings toggles.
- Crop management and Activities now use backend APIs. Overview still contains illustrative crop and summary fallback values; Calendar, Expenses, Harvest records, Notifications, and Settings remain prototype/sample workflows unless explicitly connected below.
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

The API client includes route mappings for farms, fields, crop types, crop plantings, crop activities, expenses, harvest records, summaries, calendar events, and notifications. Farms/Fields and Crop management/Activities are currently wired to live data; the remaining workspace modules are still being migrated.

## Current scope

Farms and Fields use the backend CRUD endpoints. Farm creation sends `farmName`; field creation sends `fieldName` and `totalArea`. Field area is numeric and the backend does not define a unit in the DTO, so the UI displays the raw value and expects a consistent unit per farm. Field editing changes the name only because the current update DTO does not support area changes.

Crop management is scoped to the currently selected farm. Crop types are created/updated/deleted at `/ifc/v1/crop-types/{farmId}`. Plantings are loaded from `/ifc/v1/crop-plantings`, filtered to the selected farm's fields, and created under `/ifc/v1/crop-plantings/fields/{fieldId}`. A planting sends `cropTypeId`, `cropArea`, `plantedOn`, optional `expectedHarvestOn`, and optional `maturityTimeInDays`; the backend checks available field area and computes the expected harvest date when omitted. The UI only offers backend-supported planting status transitions and permits deletion only for planned plantings.

Activities are loaded for the selected planting from `/ifc/v1/crop-activities/planting/{plantingId}`. Activity entries send the backend's day number, crop stage, daily activity, optional nutrition/water notes, optional pest/disease notes, optional general notes, and status. Status changes and deletion follow the backend's allowed transitions and planned-only delete rule.

Phase 1 establishes authentication and the shared API client; Phase 2 connects Farms and Fields; Phase 3 connects Crop Types, Plantings, and Activities. Overview still has illustrative sample crop rows and the income chart remains illustrative until a backend sales/revenue module exists. Calendar, Expenses, Harvest records, Notifications, and Settings remain future integration work.
