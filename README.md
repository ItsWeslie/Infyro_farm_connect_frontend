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
- **Calendar:** live month and agenda views of planting and expected-harvest milestones returned by the backend.
- **Expenses:** live farm-scoped ledger with create, category/planting association, search, filters, and soft voiding.
- **Harvest records:** live planting-scoped yield log with date, quantity, unit, notes, search, filters, and soft voiding.
- **Notifications:** live paginated inbox with backend unread count and individual mark-as-read actions.
- **Settings:** authenticated account details and current-session / all-session sign-out actions. Profile and preference editing are not exposed by the backend.

## Design and interactions

- React functional components and local state with a shared authenticated API client. All operational workspace modules, including Overview, use backend APIs for farm records. The Overview income/profit view is intentionally omitted until the backend exposes sales/revenue records.
- Lucide icons via `lucide-react`.
- Responsive desktop, tablet, and mobile layouts.
- Search, filters, table/card view switching, create/edit dialogs with controlled fields, record-detail modals, toasts, calendar navigation, responsive account/session controls, and a persisted light/dark theme shared between the landing page and dashboard.
- Farms, Fields, Crop management, Activities, Expenses, Harvest records, Calendar, Notifications, and Overview use backend APIs. Overview progress is estimated from planting and maturity dates; the backend does not return a measured progress percentage. Income/profit reporting is omitted until sales/revenue endpoints are available. Settings exposes only backend-supported account and session actions; persistent profile and workspace preferences are not implemented because the API does not provide those endpoints.
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

The API client includes route mappings for farms, fields, crop types, crop plantings, crop activities, expenses, harvest records, summaries, calendar events, and notifications. Farms/Fields, Crop management/Activities, Expenses, Harvest records, Calendar, and Notifications are wired to live data. Settings uses the authenticated session information and logout endpoints; there is no backend endpoint for profile or workspace-preference updates.

## Current scope

Farms and Fields use the backend CRUD endpoints. Farm creation sends `farmName`; field creation sends `fieldName` and `totalArea`. Field area is numeric and the backend does not define a unit in the DTO, so the UI displays the raw value and expects a consistent unit per farm. Field editing changes the name only because the current update DTO does not support area changes.

Crop management is scoped to the currently selected farm. Crop types are created/updated/deleted at `/ifc/v1/crop-types/{farmId}`. Plantings are loaded from `/ifc/v1/crop-plantings`, filtered to the selected farm's fields, and created under `/ifc/v1/crop-plantings/fields/{fieldId}`. A planting sends `cropTypeId`, `cropArea`, `plantedOn`, optional `expectedHarvestOn`, and optional `maturityTimeInDays`; the backend checks available field area and computes the expected harvest date when omitted. The UI only offers backend-supported planting status transitions and permits deletion only for planned plantings.

Activities are loaded for the selected planting from `/ifc/v1/crop-activities/planting/{plantingId}`. Activity entries send the backend's day number, crop stage, daily activity, optional nutrition/water notes, optional pest/disease notes, optional general notes, and status. Status changes and deletion follow the backend's allowed transitions and planned-only delete rule.

Expenses are loaded per farm from `/ifc/v1/farms/{farmId}/expenses`. Creating an expense sends `cropPlantingId` (optional), `amount`, `expenseDate`, `category`, and `description`. Dates cannot be in the future; amount supports up to two decimal places. The backend does not expose an update endpoint: the UI uses the DELETE route to void an entry, retaining it for audit history, and users create a replacement to correct a record.

Harvest records are loaded for the selected planting from `/ifc/v1/crop-plantings/{plantingId}/harvest-records`. Creating a record sends `harvestDate`, `quantity`, `unit`, and optional `notes`. The backend permits new records only for Active or Harvesting plantings, and harvest dates must be on or after planting date and not in the future. The DELETE route voids a record rather than physically deleting it; the UI retains voided entries and excludes them from active yield totals. Quantities are grouped by unit and are never added across unlike units.

Calendar requests `/ifc/v1/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD` for the visible month. The backend currently derives events from crop planting dates and expected harvest dates, with farm, field, and planting-status context. This is a read-only feed: custom calendar events and activity scheduling are not currently supported by the API.

Notifications are loaded from `/api/notifications?unreadOnly=false&page={page}&size=20`; unread count comes from `/api/notifications/unread-count`, and a notification is marked read with `PATCH /api/notifications/{id}/read`. The API has no bulk mark-read endpoint, so the UI applies individual requests to the notifications loaded in the inbox. The header preview uses the same backend list and unread count.

Settings displays the account identity returned by the authenticated session and supports the current-session logout and all-session logout endpoints. The backend does not expose profile-update or persisted user-preference endpoints, so the screen is read-only apart from session security actions.

Phase 1 establishes authentication and the shared API client; Phase 2 connects Farms and Fields; Phase 3 connects Crop Types, Plantings, and Activities; Phase 4 connects Expenses and Harvest Records; Phase 5 connects Calendar, Notifications, and the supported account/session settings; Phase 6 replaces the Overview dashboard's sample records and metrics with live farm data. Sales, revenue, and profit reporting remain out of scope until the backend provides those records.


### Phase 6 — Live Overview

The Overview page loads data for the selected farm using the existing authenticated API client. It combines the farm summary, fields, crop plantings, current-month expense and harvest summaries, expense records, planting activity logs, and the next 30 days of calendar milestones. Farm totals and category totals are displayed only when supplied by the API; unavailable secondary sections show empty or partial-data states instead of sample values. Crop progress is a UI estimate derived from planted date and maturity duration (or expected harvest date), and should not be interpreted as a sensor reading or backend progress field. The top-level demo weather chip has been removed because no weather endpoint is currently available. Income and profit are intentionally not charted because the backend does not expose sales/revenue records.


### Dashboard theme

The landing page and authenticated workspace share the `ifc-landing-theme` preference (`light` or `dark`) and the `data-ifc-theme` document attribute. The dashboard top-bar theme switch persists the preference, and the landing page theme control updates the same shared state. Dark mode uses the landing page's forest-green palette across navigation, workspace panels, forms, tables, calendars, notifications, and settings.


### Shared UX components and conventions

- Reusable UI primitives live in `src/components/ui/`; the global toast lifecycle is managed by `src/hooks/useToast.js`.
- Use the shared toast viewport for operation feedback. Call `notify(message, "success" | "error" | "warning" | "info")`; errors use assertive announcements and remain visible longer.
- Use shared skeleton primitives for initial page and section loading. Keep already-rendered data visible during background revalidation and use action-level loading states for mutations.
- Avoid page-level manual refresh controls. Retain contextual Retry actions only for recoverable loading failures.
- Keep page modules in separate files and extract reusable UI into focused component files rather than growing a single application component.


### In-app destructive-action confirmation

Destructive workspace actions use the shared confirmation dialog from `src/context/ConfirmDialogContext.jsx` and `src/components/ui/ConfirmDialog.jsx`, rather than browser-native confirmation prompts. The dialog supports contextual titles and descriptions, explicit action labels, danger/warning treatments, Escape-to-cancel, backdrop-to-cancel, and light/dark theme styling. Farm, field, crop type, planting, activity deletion, expense/harvest voiding, and sign-out-everywhere actions all use this shared confirmation flow.
