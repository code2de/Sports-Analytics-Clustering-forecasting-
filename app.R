library(shiny)
library(ggplot2)
library(dplyr)
library(forecast)

ui <- fluidPage(
  titlePanel("Sports Analytics: Clustering and Forecasting Player Performance"),
  
  sidebarLayout(
    sidebarPanel(
      fileInput("file", "Upload Player Stats CSV", accept = ".csv"),
      numericInput("clusters", "Number of Clusters:", 3, min = 2, max = 10),
      selectInput("player", "Select Player for Forecasting:", choices = NULL),
      actionButton("run", "Run Analysis")
    ),
    
    mainPanel(
      tabsetPanel(
        tabPanel("Dataset Preview", tableOutput("preview")),
        tabPanel("Data Cleaning", verbatimTextOutput("cleaning")),
        tabPanel("EDA", plotOutput("edaPlot")),
        tabPanel("Clustering", plotOutput("clusterPlot")),
        tabPanel("Forecasting", plotOutput("forecastPlot")),
        tabPanel("Evaluation", verbatimTextOutput("evaluation"))
      )
    )
  )
)

server <- function(input, output, session) {
  
  # Step 2: Data Acquisition
  dataset <- reactive({
    req(input$file)
    df <- read.csv(input$file$datapath)
    
    # Step 3: Data Cleaning and Preprocessing
    colnames(df) <- c("Player", "Season", "Goals", "Assists", "OtherStat")
    df$Season <- as.factor(df$Season)
    df <- na.omit(df)   # remove missing values
    return(df)
  })
  
  # Step 2 Preview Dataset
  output$preview <- renderTable({
    head(dataset())
  })
  
  # Step 3 Data Cleaning report
  output$cleaning <- renderPrint({
    df <- dataset()
    cat("Data Cleaning and Preprocessing Summary:\n")
    cat("Removed missing values (NA).\n")
    cat("Converted 'Season' into categorical factor.\n")
    summary(df)
  })
  
  # Step 4: EDA
  output$edaPlot <- renderPlot({
    df <- dataset()
    ggplot(df, aes(x = Goals, y = Assists, size = OtherStat)) +
      geom_point(alpha = 0.6, color = "darkblue") +
      theme_minimal() +
      labs(title = "Exploratory Data Analysis: Goals vs Assists",
           x = "Goals", y = "Assists")
  })
  
  # Update player dropdown for forecasting
  observe({
    updateSelectInput(session, "player", choices = unique(dataset()$Player))
  })
  
  # Step 5: Model Building (Clustering)
  output$clusterPlot <- renderPlot({
    req(input$run)
    df <- dataset()
    
    df_num <- df %>% select(Goals, Assists, OtherStat)
    set.seed(123)
    km <- kmeans(scale(df_num), centers = input$clusters, nstart = 25)
    df$Cluster <- as.factor(km$cluster)
    
    ggplot(df, aes(x = Goals, y = Assists, color = Cluster, size = OtherStat)) +
      geom_point(alpha = 0.7) +
      theme_minimal() +
      labs(title = "Step 5: Player Clustering", x = "Goals", y = "Assists")
  })
  
  # Step 5: Model Building (Forecasting Goals)
  output$forecastPlot <- renderPlot({
    req(input$run)
    df <- dataset()
    player_data <- df %>% filter(Player == input$player) %>% arrange(Season)
    
    ts_data <- ts(player_data$Goals, frequency = 1)
    fit <- auto.arima(ts_data)
    forecasted <- forecast(fit, h = 3)
    
    autoplot(forecasted) +
      labs(title = paste("Step 5: Goals Forecast for", input$player),
           y = "Goals", x = "Season")
  })
  
  # Step 6: Evaluation and Interpretation
  output$evaluation <- renderPrint({
    req(input$run)
    df <- dataset()
    df_num <- df %>% select(Goals, Assists, OtherStat)
    km <- kmeans(scale(df_num), centers = input$clusters, nstart = 25)
    
    cat("Cluster Sizes:\n")
    print(km$size)
    cat("\nCluster Centers (Scaled):\n")
    print(km$centers)
    cat("\nInterpretation:\n")
    cat("Players are grouped into performance clusters.\n")
    cat("ARIMA model provides forecast of goals for chosen player.\n")
    cat("These results can be exported to Power BI for Step 7: Presentation.\n")
  })
}

shinyApp(ui, server)

