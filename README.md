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

## Current scope

Phase 1–5 are UI-only prototypes. Phase 5 adds a dedicated Infyro Farm brand logo asset and small-screen/focus/reduced-motion polish. Phase 3 adds dashboard seasonal insights and detail views for workspace records. Phase 4 adds editable workspace records and a calendar event composer. API/auth integration is intentionally deferred; the chart is illustrative, and editing/export actions remain UI placeholders.
