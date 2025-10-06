# Sports Analytics: Clustering and Forecasting Player Performance  

An interactive **Shiny web application** in **R** for analyzing football player statistics through **clustering** and **forecasting**.  
Deployed live on **shinyapps.io** 👉 [Sports Analytics App](https://code2de.shinyapps.io/sports_analytics/)  

---

## Project Overview
This project was developed as part of a **Data Mining & Analytics (DMA) Mini-Project**.  
The workflow follows the **DMA project steps**:  

1. **Define the Problem**: Identify key performance indicators (Goals, Assists, Minutes) to evaluate players.  
2. **Data Acquisition**: English Premier League 2021–22 player stats (`2021_22_playerstats_epl.csv`).  
3. **Data Cleaning & Preprocessing**: Handle missing values, rename columns, and prepare structured data.  
4. **Exploratory Data Analysis (EDA)**: Preview dataset and identify trends.  
5. **Model Building**:  
   - *Clustering*: K-Means clustering groups players by performance.  
   - *Forecasting*: ARIMA models predict future goals for a selected player.  
6. **Evaluation & Interpretation**: Interpret clusters and forecasts through interactive visualizations.  
7. **Presentation**: Web-based interactive app with deployment on shinyapps.io.  

---

## Features
- **CSV Upload Support** – analyze your own player dataset.  
- **Dataset Preview** – view raw player data before analysis.  
- **Player Clustering** – visualize groups of players by Goals, Assists, and Minutes.  
- **Performance Forecasting** – ARIMA-based time series prediction of future player goals.  
- **Interactive UI** – built with Shiny, ggplot2, dplyr, and forecast.  

---

## Dataset
Sample dataset used: **2021–22 EPL Player Stats**  
- Columns:  
  - `Player`  
  - `Season`  
  - `Goals`  
  - `Assists`  
  - `Minutes`  

You can replace this dataset with any structured player stats CSV.  

---

Tech Stack & Libraries
This project demonstrates proficiency in bridging two distinct ecosystems:

Domain	Key Technologies	Core Libraries / Frameworks
Frontend (Presentation)	React, JavaScript (ES6+), Modern CSS	Recharts/Nivo (Interactive Charts), Frontend Routing
Backend (Analytics)	R Language	Shiny (API/App Host), forecast (ARIMA), cluster (K-Means), ggplot2 (R-side visualization logic)
Data Flow	RESTful API / Shiny's Reactive Framework	JSON Data exchange

Export to Sheets
📁 Project Contents
frontend/: Source code for the interactive React dashboard components.

R_analysis/: R scripts containing all statistical models (Clustering, Forecasting) and data processing logic.

data/: Sample dataset (2021_22_playerstats_epl.csv) and template for user CSV uploads.

🌐 Live Demo & Deployment
Successfully deployed and running as a unified application.

Live App: [Sports Analytics App on shinyapps.io] (Replace with actual link: https://code2de.shinyapps.io/sports_analytics/)

Demo Screenshots: (Include a link to a folder of high-res images/GIF)

👤 Author
Developed by Karunya

🔗 GitHub: @code2de
