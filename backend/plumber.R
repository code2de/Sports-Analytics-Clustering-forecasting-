## Clean Plumber API for React frontend
## - CORS enabled
## - Stable endpoints under /api
## - Health check

suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(dplyr)
  library(forecast)
})

# In-memory dataset cache (lives for the R session)
DATASET <- NULL

# ---------- Helpers ----------
ensure_col <- function(df, name) {
  if (is.null(name) || !nzchar(name) || !(name %in% names(df))) {
    stop(sprintf("Missing or invalid column: %s", name))
  }
  df[[name]]
}

safe_json <- function(x) {
  # Convert to JSON then back to list/data.frame to avoid factors/row.names issues
  fromJSON(toJSON(x, auto_unbox = TRUE, na = "null"), simplifyVector = TRUE)
}

# ---------- Build API ----------
pr <- pr()

## CORS for local dev with Vite/React
## Use pr_set_cors if available (plumber >= 1.2.0), else fallback to a filter
if (requireNamespace("plumber", quietly = TRUE) &&
    utils::packageVersion("plumber") >= "1.2.0" &&
    exists("pr_set_cors", where = asNamespace("plumber"), inherits = FALSE)) {
  pr <- plumber::pr_set_cors(
    pr,
    allow_origin = "*",
    allow_methods = c("GET", "POST", "OPTIONS"),
    allow_headers = c("Content-Type", "Authorization"),
    max_age = 86400
  )
} else {
  # Fallback CORS filter + OPTIONS handling
  pr$filter("cors", function(req, res) {
    res$setHeader("Access-Control-Allow-Origin", "*")
    res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if (identical(req$REQUEST_METHOD, "OPTIONS")) {
      res$status <- 200
      return(list())
    }
    forward()
  })
}

# Health check
pr$handle("GET", "/health", function() {
  list(status = "ok", time = as.character(Sys.time()))
})

# POST /api/preprocess
pr$handle("POST", "/api/preprocess", function(req, res) {
  body <- tryCatch({
    jsonlite::fromJSON(req$postBody, simplifyVector = FALSE)
  }, error = function(e) NULL)

  if (is.null(body) || is.null(body$rows)) {
    res$status <- 400
    return(list(error = "Invalid JSON body. Expected { rows: [...] }"))
  }

  rows <- body$rows
  if (is.null(rows) || !length(rows)) {
    res$status <- 400
    return(list(error = "No rows provided"))
  }

  df <- jsonlite::fromJSON(jsonlite::toJSON(rows, auto_unbox = TRUE), simplifyVector = TRUE)
  if (!is.data.frame(df)) df <- as.data.frame(df, stringsAsFactors = FALSE)

  # Basic cleaning
  names(df) <- trimws(names(df))
  if (nrow(df) > 0) df[df == ""] <- NA

  # Coerce likely numeric columns if present
  for (nm in intersect(names(df), c("Goals", "Assists", "OtherStat"))) {
    suppressWarnings(df[[nm]] <- as.numeric(df[[nm]]))
  }

  # Cache for this R session
  DATASET <<- df

  na_counts <- sapply(df, function(col) sum(is.na(col)))
  summary_txt <- paste0(
    "Rows: ", nrow(df), "\n",
    "Columns: ", paste(names(df), collapse = ", "), "\n",
    "Missing values per column:\n",
    paste0("  - ", names(na_counts), ": ", na_counts, collapse = "\n")
  )
  list(summary = summary_txt)
})

# POST /api/cluster
pr$handle("POST", "/api/cluster", function(req, res) {
  if (is.null(DATASET)) {
    res$status <- 400
    return(list(error = "No dataset uploaded. Call /api/preprocess first."))
  }

  body <- tryCatch(jsonlite::fromJSON(req$postBody), error = function(e) NULL)
  if (is.null(body)) {
    res$status <- 400
    return(list(error = "Invalid JSON body."))
  }

  k <- suppressWarnings(as.integer(body$k))
  goalsCol <- body$goalsCol
  assistsCol <- body$assistsCol

  if (is.na(k) || k < 2 || k > 10) {
    res$status <- 400
    return(list(error = "Invalid k (2-10)."))
  }

  df <- DATASET
  x <- suppressWarnings(as.numeric(ensure_col(df, goalsCol)))
  y <- suppressWarnings(as.numeric(ensure_col(df, assistsCol)))
  valid <- is.finite(x) & is.finite(y)
  if (!any(valid)) {
    res$status <- 400
    return(list(error = "No valid numeric rows for clustering."))
  }

  mat <- cbind(x[valid], y[valid])
  set.seed(123)
  km <- stats::kmeans(mat, centers = k, nstart = 25)

  result_points <- setNames(
    as.data.frame(list(
      mat[, 1],
      mat[, 2],
      km$cluster
    ), stringsAsFactors = FALSE),
    c(goalsCol, assistsCol, "cluster")
  )

  summary_txt <- paste0(
    "KMeans with k=", k, " complete.\n",
    "Sizes: ", paste(km$size, collapse = ", "), "\n",
    "Tot.withinSS: ", round(km$tot.withinss, 2)
  )

  list(
    points = safe_json(result_points),
    summary = summary_txt
  )
})

# POST /api/forecast
pr$handle("POST", "/api/forecast", function(req, res) {
  if (is.null(DATASET)) {
    res$status <- 400
    return(list(error = "No dataset uploaded. Call /api/preprocess first."))
  }

  body <- tryCatch(jsonlite::fromJSON(req$postBody), error = function(e) NULL)
  if (is.null(body)) {
    res$status <- 400
    return(list(error = "Invalid JSON body."))
  }

  player <- body$player
  playerCol <- body$playerCol
  df <- DATASET

  if (is.null(player) || is.null(playerCol) || !(playerCol %in% names(df))) {
    res$status <- 400
    return(list(error = "Player or playerCol invalid."))
  }

  target_col <- if ("Goals" %in% names(df)) "Goals" else {
    numeric_cols <- names(df)[sapply(df, is.numeric)]
    if (!length(numeric_cols)) {
      res$status <- 400
      return(list(error = "No numeric columns to forecast."))
    }
    numeric_cols[1]
  }

  sub <- df[df[[playerCol]] == player, , drop = FALSE]
  if (nrow(sub) == 0) {
    res$status <- 400
    return(list(error = "No rows for the requested player."))
  }

  if ("Season" %in% names(sub)) {
    ord_num <- suppressWarnings(as.numeric(as.character(sub[["Season"]])))
    if (any(is.finite(ord_num))) {
      sub <- sub[order(ord_num), , drop = FALSE]
    } else {
      sub <- sub[order(as.character(sub[["Season"]])), , drop = FALSE]
    }
  }

  vec <- as.numeric(sub[[target_col]])
  vec[!is.finite(vec)] <- NA
  vec <- na.omit(vec)
  if (length(vec) < 5) {
    res$status <- 400
    return(list(error = "Insufficient numeric data to forecast (need >= 5)."))
  }

  ts_data <- ts(vec, frequency = 1)
  fit <- forecast::auto.arima(ts_data)
  h <- min(12, max(3, floor(length(vec) / 2)))
  fc <- forecast::forecast(fit, h = h)

  x_hist <- seq_along(vec)
  y_hist <- as.numeric(vec)
  x_fc <- (length(vec) + 1):(length(vec) + length(fc$mean))
  y_fc <- as.numeric(fc$mean)

  series <- list(
    list(name = "History", x = x_hist, y = y_hist, mode = "lines", line = list(color = "#6b7280")),
    list(name = "Forecast", x = x_fc, y = y_fc, mode = "lines", line = list(color = "#16a34a"))
  )
  list(series = series)
})

# ---------- Run server ----------
host <- Sys.getenv("HOST", unset = "0.0.0.0")
port <- suppressWarnings(as.integer(Sys.getenv("PORT", unset = "8000")))
if (is.na(port) || port <= 0) port <- 8000

pr$run(host = host, port = port)
