# Load additional libraries for visualization
library(gridExtra)
library(viridis)
library(scales)

# 16.1 Create a multi-panel figure showing all key results
cat("\n========================================\n")
cat("CREATING COMPREHENSIVE VISUALIZATIONS\n")
cat("========================================\n\n")

# Panel 1: Habitat suitability map
p1 <- ggplot() +
  geom_raster(data = pred_df, aes(x = x, y = y, fill = suitability)) +
  scale_fill_viridis_c(name = "Suitability", option = "plasma") +
  geom_sf(data = counties, fill = NA, color = "black", size = 0.3) +
  geom_point(data = occ_data, aes(x = lon, y = lat), 
             color = "white", size = 0.3, alpha = 0.5) +
  theme_minimal() +
  labs(title = "A. Habitat Suitability", 
       x = "", y = "") +
  theme(legend.position = "bottom",
        plot.title = element_text(face = "bold")) +
  coord_sf(xlim = c(33.5, 42), ylim = c(-5, 5))

# Panel 2: Variable importance
if(exists("var_imp") && nrow(var_imp) > 0) {
  var_imp_plot <- var_imp %>%
    mutate(Variable = case_when(
      Variable == "elevation" ~ "Elevation",
      Variable == "bio1" ~ "Temperature",
      Variable == "bio12" ~ "Precipitation",
      Variable == "bio4" ~ "Temp Seasonality",
      Variable == "bio15" ~ "Precip Seasonality",
      TRUE ~ Variable
    ))
  
  p2 <- ggplot(var_imp_plot, aes(x = reorder(Variable, Coefficient), y = Coefficient)) +
    geom_bar(stat = "identity", fill = "steelblue") +
    coord_flip() +
    theme_minimal() +
    labs(title = "B. Variable Importance",
         x = "", y = "Coefficient (absolute)") +
    theme(plot.title = element_text(face = "bold"))
} else {
  p2 <- ggplot() + 
    annotate("text", x = 0.5, y = 0.5, label = "No variable importance data") +
    theme_void()
}

# Panel 3: Response curves for top 2 variables
if(exists("var_imp") && nrow(var_imp) > 0) {
  top_vars <- head(var_imp$Variable, 2)
  
  response_plots <- list()
  for(i in 1:length(top_vars)) {
    var_name <- top_vars[i]
    var_range <- seq(min(train[[var_name]]), max(train[[var_name]]), length.out = 100)
    
    # Get mean of other variables
    other_vars <- colMeans(train[, !names(train) %in% c(var_name, "presence")])
    
    # Create new data
    newdata <- data.frame(matrix(rep(other_vars, each = 100), nrow = 100))
    names(newdata) <- names(other_vars)
    newdata[[var_name]] <- var_range
    
    # Predict
    pred <- predict(sdm_model, newdata, type = "cloglog")
    
    # Create plot data
    plot_data <- data.frame(x = var_range, y = pred)
    
    # Create plot
    var_label <- case_when(
      var_name == "elevation" ~ "Elevation (m)",
      var_name == "bio1" ~ "Temperature (°C)",
      var_name == "bio12" ~ "Precipitation (mm)",
      var_name == "bio4" ~ "Temp Seasonality",
      var_name == "bio15" ~ "Precip Seasonality",
      TRUE ~ var_name
    )
    
    p <- ggplot(plot_data, aes(x = x, y = y)) +
      geom_line(color = "darkgreen", size = 1) +
      theme_minimal() +
      labs(title = paste("C.", i, "Response:", var_label),
           x = var_label, y = "Suitability") +
      theme(plot.title = element_text(face = "bold", size = 10))
    
    response_plots[[i]] <- p
  }
  
  # Combine response plots
  if(length(response_plots) == 2) {
    p3 <- grid.arrange(response_plots[[1]], response_plots[[2]], ncol = 2)
  } else if(length(response_plots) == 1) {
    p3 <- response_plots[[1]]
  } else {
    p3 <- ggplot() + theme_void()
  }
} else {
  p3 <- ggplot() + theme_void()
}

# Panel 4: Species occurrence by habitat type
# Classify points by habitat type based on environmental conditions
env_df$habitat <- case_when(
  env_df$elevation < 500 ~ "Lowland",
  env_df$elevation < 1500 ~ "Midland",
  TRUE ~ "Highland"
)

habitat_summary <- env_df %>%
  group_by(habitat, presence) %>%
  summarise(count = n(), .groups = 'drop') %>%
  group_by(habitat) %>%
  mutate(proportion = count / sum(count))

p4 <- ggplot(habitat_summary, aes(x = habitat, y = proportion, fill = factor(presence))) +
  geom_bar(stat = "identity", position = "fill") +
  scale_fill_manual(name = "Type", 
                    values = c("0" = "gray70", "1" = "darkgreen"),
                    labels = c("Background", "Occurrence")) +
  theme_minimal() +
  labs(title = "D. Occurrence by Elevation Zone",
       x = "", y = "Proportion") +
  theme(plot.title = element_text(face = "bold"),
        legend.position = "bottom") +
  scale_y_continuous(labels = percent)

# Arrange all plots
if(exists("p3") && class(p3)[1] == "ggplot") {
  # If p3 is a ggplot object
  final_figure <- grid.arrange(p1, p2, p3, p4, 
                               ncol = 2, nrow = 2,
                               heights = c(1, 1))
} else {
  # If p3 is a gtable from grid.arrange
  final_figure <- grid.arrange(p1, p2, p4, 
                               ncol = 2, nrow = 2,
                               heights = c(1, 1))
}

# Save the figure
ggsave("complete_analysis_figure.png", final_figure, width = 14, height = 12, dpi = 300)
cat("Complete figure saved to complete_analysis_figure.png\n")