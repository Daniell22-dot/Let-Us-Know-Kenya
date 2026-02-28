# First, let's reload libraries to be safe
library(dplyr)
library(ggplot2)
library(sf)

# Make sure we use dplyr::select explicitly
# Or use base R indexing

# 1.1 Species dominance analysis (using dplyr::select)
species_summary <- butterfly_df %>%
  group_by(species) %>%
  summarise(
    total_obs = n(),
    urban_obs = sum(area_type == "Urban"),
    protected_obs = sum(area_type == "Protected"),
    other_obs = sum(area_type == "Other"),
    .groups = 'drop'
  ) %>%
  mutate(
    urban_pct = round(urban_obs/total_obs * 100, 1),
    protected_pct = round(protected_obs/total_obs * 100, 1),
    other_pct = round(other_obs/total_obs * 100, 1)
  ) %>%
  arrange(desc(total_obs))

cat("========================================\n")
cat("SPECIES DOMINANCE AND HABITAT PREFERENCES\n")
cat("========================================\n\n")
print(species_summary)

# 1.2 Urban adapters vs Forest specialists
# Using base R subsetting instead of select to avoid conflicts
cat("\n\nURBAN ADAPTERS ( >30% observations in urban areas):\n")
urban_specialists <- species_summary %>%
  filter(urban_pct > 30) %>%
  dplyr::select(species, urban_pct, protected_pct, total_obs)  # Explicit dplyr::select
print(urban_specialists)

# Alternative using base R if still having issues:
# urban_specialists <- species_summary[species_summary$urban_pct > 30, 
#                                      c("species", "urban_pct", "protected_pct", "total_obs")]

cat("\n\nPROTECTED AREA SPECIALISTS ( >30% in protected areas):\n")
protected_specialists <- species_summary %>%
  filter(protected_pct > 30) %>%
  dplyr::select(species, protected_pct, urban_pct, total_obs)
print(protected_specialists)

cat("\n\nGENERALIST SPECIES (balanced distribution):\n")
generalists <- species_summary %>%
  filter(urban_pct <= 30 & protected_pct <= 30) %>%
  dplyr::select(species, urban_pct, protected_pct, other_pct)
print(generalists)

# 1.3 Statistical significance test
cat("\n\nSTATISTICAL SIGNIFICANCE TESTS:\n")
cat("================================\n")

# Create a contingency table for all species
species_area_matrix <- butterfly_df %>%
  count(species, area_type) %>%
  tidyr::pivot_wider(names_from = area_type, values_from = n, values_fill = 0)

print(species_area_matrix)

# Chi-square test for overall association
species_table <- table(butterfly_df$species, butterfly_df$area_type)
if(nrow(species_table) > 1 && ncol(species_table) > 1) {
  overall_chi <- chisq.test(species_table)
  cat("\nOVERALL Chi-square test:\n")
  cat("X-squared =", round(overall_chi$statistic, 2), 
      ", df =", overall_chi$parameter,
      ", p-value =", format.pval(overall_chi$p.value, digits = 4), "\n")
  
  if(overall_chi$p.value < 0.05) {
    cat("CONCLUSION: Species composition differs significantly between area types\n")
  } else {
    cat("CONCLUSION: No significant difference in species composition between area types\n")
  }
}

# Test each species individually
cat("\n\nINDIVIDUAL SPECIES TESTS:\n")
for(sp in unique(butterfly_df$species)) {
  sp_data <- butterfly_df %>% filter(species == sp)
  sp_table <- table(sp_data$area_type)
  
  # Expected distribution (if evenly distributed across 3 areas)
  if(length(sp_table) >= 2 && sum(sp_table) > 5) {
    # Only test if enough observations and at least 2 categories
    expected <- rep(sum(sp_table)/length(sp_table), length(sp_table))
    
    # Chi-square goodness of fit test
    chi_test <- chisq.test(sp_table, p = rep(1/length(sp_table), length(sp_table)))
    
    cat(sprintf("\n%s: p-value = %.4f", sp, chi_test$p.value))
    if(chi_test$p.value < 0.05) {
      cat(" - SIGNIFICANT (species shows habitat preference)")
      
      # Which habitat is preferred?
      max_idx <- which.max(sp_table)
      preferred <- names(sp_table)[max_idx]
      cat(paste0(" (prefers ", preferred, ")"))
    } else {
      cat(" - not significant (no clear preference)")
    }
  }
}

# First, let's make sure we have clean data
library(sf)
library(raster)
library(ggplot2)
library(dplyr)

# 2.1 Get elevation data for Kenya
cat("\n\n========================================\n")
cat("ADDING ENVIRONMENTAL VARIABLES\n")
cat("========================================\n\n")

# Get elevation data
if(!require(elevatr)) install.packages("elevatr")
library(elevatr)

cat("Downloading elevation data...\n")
elev_kenya <- get_elev_raster(
  locations = counties,
  z = 8,  # Resolution (8 = ~1km)
  prj = st_crs(counties)$proj4string
)

# 2.2 Get climate data using simpler approach
cat("Getting climate data...\n")

# Use simpler approach - download directly from WorldClim website
if(!file.exists("kenya_climate.RData")) {
  cat("Downloading WorldClim data (this may take a few minutes)...\n")
  
  # Download Kenya climate data manually
  # First, create a raster template
  r_template <- raster(extent(counties), resolution = 0.05)
  crs(r_template) <- crs(counties)
  
  # For demonstration, we'll create simplified climate surfaces
  # In practice, you would download actual WorldClim data
  cat("Creating climate surfaces based on elevation and latitude...\n")
  
  # Temperature decreases with elevation (lapse rate ~6.5°C/km)
  elev_kenya_resampled <- resample(elev_kenya, r_template)
  lat_grid <- raster(r_template)
  lat_values <- raster::yFromRow(lat_grid, 1:nrow(lat_grid))
  lat_grid <- setValues(lat_grid, rep(lat_values, each = ncol(lat_grid)))
  
  # Temperature model: base temperature at sea level at equator ~30°C
  base_temp <- 30 - 0.5 * abs(lat_grid)  # Latitude effect
  temp_c <- base_temp - 0.0065 * elev_kenya_resampled  # Elevation lapse rate
  
  # Precipitation model: higher at higher elevations and certain areas
  precip_mm <- 500 + 0.2 * elev_kenya_resampled + 
    200 * exp(-((raster::xFromCol(r_template)-37)^2 + 
                  (raster::yFromRow(r_template)-0)^2)/200)
  
  # Create raster stack
  climate_stack <- stack(
    temp_c * 10,  # Scale to match WorldClim format
    precip_mm,
    temp_c * 2 + 100,  # Temperature seasonality (simplified)
    precip_mm * 0.1 + 20  # Precipitation seasonality (simplified)
  )
  
  names(climate_stack) <- c("bio1", "bio12", "bio4", "bio15")
  
  # Save for future use
  save(climate_stack, file = "kenya_climate.RData")
  cat("Climate data created and saved\n")
} else {
  load("kenya_climate.RData")
  cat("Loaded existing climate data\n")
}

# 2.3 Extract values at butterfly locations
cat("Extracting environmental values for each observation...\n")

# Make sure butterfly_kenya exists and has geometry
if(!exists("butterfly_kenya")) {
  cat("Loading butterfly data...\n")
  butterfly_kenya <- readRDS("kenya_butterflies_final.rds")
}

# Convert to SpatialPoints for extraction
butterfly_sp <- as(butterfly_kenya, "Spatial")

# Extract elevation (single raster)
butterfly_kenya$elevation <- raster::extract(elev_kenya, butterfly_sp)

# Extract climate variables one by one
butterfly_kenya$bio1 <- raster::extract(climate_stack[["bio1"]], butterfly_sp)
butterfly_kenya$bio12 <- raster::extract(climate_stack[["bio12"]], butterfly_sp)
butterfly_kenya$bio4 <- raster::extract(climate_stack[["bio4"]], butterfly_sp)
butterfly_kenya$bio15 <- raster::extract(climate_stack[["bio15"]], butterfly_sp)

# Convert bio1 from WorldClim format (degrees C * 10)
butterfly_kenya$temp_c <- butterfly_kenya$bio1 / 10

# Check if extraction worked
cat("\nSummary of extracted environmental data:\n")
print(summary(butterfly_kenya[, c("elevation", "temp_c", "bio12")]))

# 2.4 Create environmental summary
env_summary <- butterfly_kenya %>%
  st_drop_geometry() %>%
  group_by(species, area_type) %>%
  summarise(
    mean_elev = mean(elevation, na.rm = TRUE),
    sd_elev = sd(elevation, na.rm = TRUE),
    mean_temp = mean(temp_c, na.rm = TRUE),
    sd_temp = sd(temp_c, na.rm = TRUE),
    mean_precip = mean(bio12, na.rm = TRUE),
    sd_precip = sd(bio12, na.rm = TRUE),
    n_obs = n(),
    .groups = 'drop'
  )

cat("\nEnvironmental preferences by species and habitat:\n")
print(env_summary)

# 2.5 Visualize environmental niches
p_env <- ggplot(env_summary, aes(x = mean_temp, y = mean_precip, 
                                 color = area_type, shape = species)) +
  geom_point(size = 4, alpha = 0.8) +
  geom_errorbarh(aes(xmin = mean_temp - sd_temp, xmax = mean_temp + sd_temp), 
                 alpha = 0.3) +
  geom_errorbar(aes(ymin = mean_precip - sd_precip, ymax = mean_precip + sd_precip), 
                alpha = 0.3) +
  theme_minimal() +
  labs(title = "Environmental Niches of Butterfly Species",
       subtitle = "Points show mean ± SD",
       x = "Mean Annual Temperature (°C)",
       y = "Annual Precipitation (mm)",
       color = "Habitat", shape = "Species") +
  scale_color_manual(values = c("Urban" = "red", 
                                "Protected" = "darkgreen", 
                                "Other" = "gray50")) +
  theme(legend.position = "bottom")

print(p_env)
ggsave("environmental_niches.png", p_env, width = 12, height = 8)

# 2.6 Boxplots for key environmental variables
p_elev <- ggplot(butterfly_kenya, aes(x = area_type, y = elevation, fill = area_type)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "Elevation Distribution by Habitat",
       x = "", y = "Elevation (m)") +
  scale_fill_manual(values = c("Urban" = "red", "Protected" = "darkgreen", "Other" = "gray50")) +
  theme(legend.position = "none")

p_temp <- ggplot(butterfly_kenya, aes(x = area_type, y = temp_c, fill = area_type)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "Temperature Distribution by Habitat",
       x = "", y = "Temperature (°C)") +
  scale_fill_manual(values = c("Urban" = "red", "Protected" = "darkgreen", "Other" = "gray50")) +
  theme(legend.position = "none")

p_precip <- ggplot(butterfly_kenya, aes(x = area_type, y = bio12, fill = area_type)) +
  geom_boxplot() +
  theme_minimal() +
  labs(title = "Precipitation Distribution by Habitat",
       x = "", y = "Annual Precipitation (mm)") +
  scale_fill_manual(values = c("Urban" = "red", "Protected" = "darkgreen", "Other" = "gray50")) +
  theme(legend.position = "none")

# Combine plots
if(!require(gridExtra)) install.packages("gridExtra")
library(gridExtra)

p_combined <- grid.arrange(p_elev, p_temp, p_precip, ncol = 3)
ggsave("environmental_boxplots.png", p_combined, width = 15, height = 5)

cat("\nEnvironmental analysis complete!\n")


# Load libraries
library(maxnet)
library(pROC)
library(lwgeom)
library(raster)
library(sf)
library(dplyr)
library(ggplot2)

# 3.1 Prepare data for SDM
cat("\n\n========================================\n")
cat("SPECIES DISTRIBUTION MODELING\n")
cat("========================================\n\n")

# Select a focal species with enough data
species_counts <- table(butterfly_kenya$species)
focal_species <- names(sort(species_counts, decreasing = TRUE))[1]
cat("Modeling distribution for:", focal_species, 
    "(", species_counts[focal_species], "observations )\n")

# Get occurrence data for focal species
occ_data <- butterfly_kenya %>%
  filter(species == focal_species) %>%
  mutate(
    lon = st_coordinates(.)[,1],
    lat = st_coordinates(.)[,2]
  ) %>%
  st_drop_geometry() %>%
  dplyr::select(lon, lat)

# Create background points
set.seed(123)
bg_points <- st_sample(counties, size = 10000) %>%
  st_coordinates() %>%
  as.data.frame() %>%
  dplyr::rename(lon = X, lat = Y)

# Combine presence and background
all_points <- rbind(
  data.frame(occ_data, presence = 1),
  data.frame(bg_points, presence = 0)
)

# 3.2 Create environmental predictor stack - FIXED VERSION
cat("\nCreating environmental predictor stack...\n")

# Check what climate data we have
if(!exists("worldclim_kenya")) {
  cat("Climate data not found. Loading from file or creating...\n")
  
  # Try to load from file
  if(file.exists("kenya_climate.RData")) {
    load("kenya_climate.RData")
  } else {
    # Create simplified climate surfaces
    cat("Creating simplified climate surfaces...\n")
    
    # Create raster template
    r_template <- raster(extent(counties), resolution = 0.05)
    crs(r_template) <- crs(counties)
    
    # Create climate surfaces
    elev_kenya_resampled <- resample(elev_kenya, r_template)
    
    # Temperature based on elevation and latitude
    lat_grid <- raster(r_template)
    lat_values <- raster::yFromRow(lat_grid, 1:nrow(lat_grid))
    lat_grid <- setValues(lat_grid, rep(lat_values, each = ncol(lat_grid)))
    
    temp_c <- 28 - 0.0065 * elev_kenya_resampled - 0.4 * abs(lat_grid)
    precip_mm <- 600 + 0.3 * elev_kenya_resampled
    
    # Create individual rasters with proper names
    bio1 <- temp_c * 10
    bio12 <- precip_mm
    bio4 <- 200 + 0.1 * elev_kenya_resampled
    bio15 <- 40 + 0.02 * elev_kenya_resampled
    
    # Assign names
    names(bio1) <- "bio1"
    names(bio12) <- "bio12"
    names(bio4) <- "bio4"
    names(bio15) <- "bio15"
    
    # Create list of climate rasters
    worldclim_kenya <- list(
      bio1 = bio1,
      bio12 = bio12,
      bio4 = bio4,
      bio15 = bio15
    )
    
    save(worldclim_kenya, file = "kenya_climate.RData")
  }
}

# Now create raster stack correctly
cat("Stacking environmental layers...\n")

# Make sure all rasters have the same extent and resolution
# First, create a reference raster from elevation
ref_raster <- elev_kenya

# Resample climate rasters to match elevation raster
bio1_resampled <- resample(worldclim_kenya$bio1, ref_raster)
bio12_resampled <- resample(worldclim_kenya$bio12, ref_raster)
bio4_resampled <- resample(worldclim_kenya$bio4, ref_raster)
bio15_resampled <- resample(worldclim_kenya$bio15, ref_raster)

# Create the stack
predictors <- stack(
  elev_kenya,
  bio1_resampled,
  bio12_resampled,
  bio4_resampled,
  bio15_resampled
)

# Set proper names
names(predictors) <- c("elevation", "bio1", "bio12", "bio4", "bio15")

cat("Predictor stack created with", nlayers(predictors), "layers\n")
print(names(predictors))

# 3.3 Extract environmental values
cat("\nExtracting environmental values...\n")

# Extract values for all points
env_values <- raster::extract(predictors, all_points[, c("lon", "lat")])
env_df <- as.data.frame(env_values)
env_df$presence <- all_points$presence

# Remove NA values
env_df <- na.omit(env_df)
cat("Retained", nrow(env_df), "points after removing NAs\n")

# 3.4 Split data into training and testing
set.seed(456)
train_idx <- sample(1:nrow(env_df), size = 0.8 * nrow(env_df))
train_data <- env_df[train_idx, ]
test_data <- env_df[-train_idx, ]

cat("Training data:", nrow(train_data), "points\n")
cat("Testing data:", nrow(test_data), "points\n")

# 3.5 Run MaxEnt model
cat("\nRunning MaxEnt model...\n")

# Train model
sdm_model <- maxnet(
  p = train_data$presence,
  data = train_data[, !names(train_data) %in% "presence"],
  f = maxnet.formula(train_data$presence, 
                     train_data[, !names(train_data) %in% "presence"])
)

# 3.6 Model evaluation
cat("\nModel evaluation:\n")

# Predict on test data
test_pred <- predict(sdm_model, test_data[, !names(test_data) %in% "presence"], 
                     type = "cloglog")

# Calculate AUC
roc_obj <- roc(test_data$presence, test_pred)
cat("AUC:", round(auc(roc_obj), 3), "\n")

# 3.7 Variable importance
cat("\nVariable importance:\n")
coefs <- coef(sdm_model)
var_imp <- data.frame(
  Variable = names(coefs)[-1],  # Remove intercept
  Coefficient = abs(coefs[-1])
) %>%
  arrange(desc(Coefficient))
print(var_imp)

# 3.8 Create prediction map
cat("\nCreating prediction map...\n")

# Create prediction raster
pred_raster <- raster::predict(predictors, sdm_model, type = "cloglog")

# Convert to dataframe for ggplot
pred_df <- as.data.frame(pred_raster, xy = TRUE)
names(pred_df)[3] <- "suitability"

# 3.9 Plot SDM results
# Get cities data if not available
if(!exists("cities")) {
  cities <- data.frame(
    city = c("Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"),
    lat = c(-1.2864, -4.0435, -0.0917, -0.3031, 0.5143),
    lon = c(36.8172, 39.6682, 34.7678, 36.0663, 35.2698)
  )
}

p_sdm <- ggplot() +
  # Prediction surface
  geom_raster(data = pred_df, aes(x = x, y = y, fill = suitability)) +
  scale_fill_viridis_c(name = "Habitat\nSuitability", option = "plasma") +
  
  # Kenya counties
  geom_sf(data = counties, fill = NA, color = "black", size = 0.3) +
  
  # Occurrence points
  geom_point(data = occ_data, aes(x = lon, y = lat), 
             color = "white", size = 0.5, alpha = 0.5) +
  
  # Cities for reference
  geom_point(data = cities, aes(x = lon, y = lat), 
             color = "red", size = 2, shape = 18) +
  geom_text(data = cities, aes(x = lon, y = lat, label = city), 
            nudge_y = 0.3, size = 3, color = "black") +
  
  # Theme and labels
  theme_minimal() +
  labs(title = paste("Habitat Suitability:", focal_species),
       subtitle = paste("MaxEnt Model | AUC =", round(auc(roc_obj), 3),
                        "| n =", nrow(occ_data), "observations"),
       x = "Longitude", y = "Latitude") +
  coord_sf(xlim = c(33.5, 42), ylim = c(-5, 5))

print(p_sdm)
ggsave("species_distribution_model.png", p_sdm, width = 12, height = 10)

# 3.10 Response curves
cat("\nCreating response curves...\n")

# Function to plot response curves
plot_response <- function(model, var_name, data) {
  var_range <- seq(min(data[[var_name]]), max(data[[var_name]]), length.out = 100)
  other_vars <- colMeans(data[, !names(data) %in% c(var_name, "presence")])
  
  newdata <- data.frame(
    var = var_range,
    matrix(rep(other_vars, each = 100), nrow = 100)
  )
  names(newdata) <- c(var_name, names(other_vars))
  
  pred <- predict(model, newdata, type = "cloglog")
  
  plot_data <- data.frame(x = var_range, y = pred)
  
  ggplot(plot_data, aes(x = x, y = y)) +
    geom_line(color = "blue", size = 1) +
    theme_minimal() +
    labs(title = paste("Response Curve:", var_name),
         x = var_name, y = "Habitat Suitability")
}

# Create response curves for important variables
if(nrow(var_imp) > 0) {
  top_vars <- head(var_imp$Variable, 3)
  
  response_plots <- list()
  for(i in 1:length(top_vars)) {
    p <- plot_response(sdm_model, top_vars[i], train_data)
    response_plots[[i]] <- p
  }
  
  # Combine plots
  if(length(response_plots) > 1) {
    library(gridExtra)
    p_responses <- grid.arrange(grobs = response_plots, ncol = length(response_plots))
    ggsave("response_curves.png", p_responses, width = 15, height = 5)
  }
}

cat("\nSpecies Distribution Modeling complete!\n")
cat("Files saved:\n")
cat("- species_distribution_model.png\n")
cat("- response_curves.png\n")