# Sports Analytics Backend (R Plumber)

This is the R (Plumber) backend that serves the API used by the React dashboard in `../frontend/`.

- File: `backend/plumber.R`
- Default URL: `http://localhost:8000`
- API base path used by the frontend: `/api`

## Prerequisites

- R (≥ 4.0 recommended)
- Packages:
  - plumber
  - jsonlite
  - dplyr
  - forecast

Install once in R:

```r
install.packages(c("plumber", "jsonlite", "dplyr", "forecast"))
```

## Run the API

From R console:

```r
setwd("c:/Users/itska/OneDrive/Desktop/Hackathon/sports_analytics/backend")
source("plumber.R")
# Server will start at http://localhost:8000


setwd("c:/Users/itska/OneDrive/Desktop/Hackathon/sports_analytics/backend")
library(plumber)
pr <- plumb("plumber.R")
pr$run(host = "0.0.0.0", port = 8000)
```

Or from PowerShell:

```powershell
Rscript -e "setwd('c:/Users/itska/OneDrive/Desktop/Hackathon/sports_analytics/backend'); source('plumber.R')"
```

If the port is in use, change the port in `plumber.R` at the `pr_run(..., port = 8000)` line and update your frontend `.env` accordingly.

## Endpoints

All endpoints are JSON and live under `/api`.

- `POST /api/preprocess`
  - Body: `{ rows: [ { ...row fields... } ] }`
  - Response: `{ summary: string }`
  - Behavior: Caches the uploaded dataset in memory for the current R session and returns a cleaning summary.

- `POST /api/cluster`
  - Body: `{ k: number (2-10), goalsCol: string, assistsCol: string, playerCol: string }`
  - Response: `{ points: [{ <goalsCol>: number, <assistsCol>: number, cluster: number }...], summary: string }`
  - Behavior: Runs KMeans on the numeric Goals/Assists columns and returns per-point clusters for plotting.

- `POST /api/forecast`
  - Body: `{ player: string, playerCol: string }`
  - Response: `{ series: [{ name, x:[], y:[], mode, line }, ...] }`
  - Behavior: Builds a simple time-series model (ARIMA) from the player’s numeric series (prefers `Goals`) and returns history + forecast series for plotting.

## Expected Data

- The frontend infers columns case-insensitively:
  - Player column: `Player`/`Name`
  - Numeric columns: `Goals`, `Assists` (and optionally `OtherStat`)
  - Time-like column (optional): `Season` for ordering in forecasting

If your CSV has different headers, either rename them in the frontend inference logic or adapt the R code accordingly.

## Frontend Configuration

- Dev proxy in `frontend/vite.config.js` forwards `/api` to `http://localhost:8000`.
- Alternatively, set `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCKS=false
```

Restart `npm run dev` after changing env.

## Quick Tests (curl)

```bash
# Preprocess
curl -X POST http://localhost:8000/api/preprocess \
  -H "Content-Type: application/json" \
  -d '{"rows":[{"Player":"A","Season":1,"Goals":5,"Assists":3}]}'

# Cluster
curl -X POST http://localhost:8000/api/cluster \
  -H "Content-Type: application/json" \
  -d '{"k":3,"goalsCol":"Goals","assistsCol":"Assists","playerCol":"Player"}'

# Forecast
curl -X POST http://localhost:8000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"player":"A","playerCol":"Player"}'
```

## Troubleshooting

- "package not found": run the `install.packages(...)` line above.
- 400 error "No dataset uploaded": call `/api/preprocess` first (the backend caches the dataset from that call).
- Clustering returns no points: check that `goalsCol`/`assistsCol` exist and contain numeric values.
- Forecast error: ensure there are at least ~5 numeric points for the selected player. If you have a `Season` column, it will be used to order observations.
- CORS issues: if you access the API directly from the browser without the Vite proxy, enable CORS in Plumber via `pr_set_cors(...)`.

## Project Structure

```
sports_analytics/
├─ backend/
│  ├─ plumber.R
│  └─ README.md  <- this file
└─ frontend/
   ├─ src/
   └─ ...
```
