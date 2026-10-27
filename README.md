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

- **Overview:** dashboard hero, farm metrics, crop progress table, recent activity, field note.
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
- Search, filters, table/card view switching, dialogs, toasts, calendar navigation, and settings toggles.
- All content is illustrative sample data. Entries and preferences are not persisted to a server.
- Earth-inspired colors, accessible focus states, and reduced-motion support.

## Current scope

Phase 1 application shell and Phase 2 workspace screens are UI-only prototypes. API/auth integration is intentionally deferred. Some actions such as exports, detailed record actions, and profile subsections are UI placeholders for later refinement.
