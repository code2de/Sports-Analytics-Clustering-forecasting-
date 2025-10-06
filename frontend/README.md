# Sports Analytics Dashboard (React)

A React (Vite) frontend UI for a Sports Analytics Dashboard originally implemented in R/Shiny. This UI supports CSV upload, parameter controls, tabbed results, interactive Plotly charts, loading states, and is ready to integrate with an R backend (Plumber).

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Optional: set environment variables in a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=true
```

- `VITE_USE_MOCKS=true` will simulate API results so you can test UI without a backend.
- By default, dev server proxies `/api` to `http://localhost:8000` (see `vite.config.js`).

## Project Structure

- `src/App.jsx` — main layout with sidebar + tabs, wiring of state and actions.
- `src/components/` — reusable UI components:
  - `FileUpload.jsx` — CSV upload with validation and preview callback.
  - `NumericInput.jsx`, `SelectDropdown.jsx` — filters.
  - `TabView.jsx` — tabs for Dataset, Cleaning, EDA, Clustering, Forecasting, Evaluation.
  - `plots/*` — Plotly-based charts.
  - `LoadingSpinner.jsx` — loading indicator.
- `src/hooks/useApi.js` — API integration hooks with mock mode.
- `src/utils/exportUtils.js` — export charts as images and tables as CSV.
- `src/config.js` — base URL and mock toggle.
- `src/styles.css` — clean, responsive dashboard styles.

## Backend Integration (R Plumber)

Expected endpoints (adjust as needed):

- `POST /api/preprocess` — body: `{ rows: [...] }`, returns `{ summary: string }`.
- `POST /api/cluster` — body: `{ k, goalsCol, assistsCol, playerCol }`, returns `{ points: [{ Goals, Assists, cluster }...], summary }`.
- `POST /api/forecast` — body: `{ player, playerCol }`, returns `{ series: [{ name, x:[], y:[], mode, line }, ...] }`.

Update `VITE_API_BASE_URL` if your API is hosted elsewhere. The dev proxy in `vite.config.js` forwards `/api` to `http://localhost:8000`.

## Notes

- EDA requires the dataset to have goals and assists columns. The app tries to infer column names (case-insensitive among: Goals/Assists/G/A). Adjust as needed.
- Player dropdown is populated after upload if a Player/Name column is found.
- All charts are interactive (zoom, pan, hover) and can be exported.
- Mobile responsive layout switches to a top sidebar.

## Build

```bash
npm run build
npm run preview
```
