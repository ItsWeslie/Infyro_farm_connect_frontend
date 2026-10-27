# Infyro Farm Connect Frontend

A responsive React + Vite farm-management dashboard for tracking crops, fields, harvests, and farm activity. The interface uses an earth-inspired palette and lightweight CSS illustrations, with no icon or animation packages required.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Current features

- Responsive farm workspace and navigation
- Crop overview with progress, status, field, and expected harvest
- Search across crop names, varieties, and fields
- Add-crop modal with client-side state updates
- Activity feed, farm metrics, and field note card
- Reduced-motion support and mobile layouts

The current dashboard uses sample data so the UI can be previewed independently. Connect API calls to the Spring Boot backend at `http://localhost:8080` when wiring up live authentication and farm records. Do not commit `node_modules`, build output, or local environment files.
