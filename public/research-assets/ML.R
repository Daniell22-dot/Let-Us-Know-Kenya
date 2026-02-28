# Step 1: Restart R session (Session -> Restart R in RStudio)
# Then run this entire script from top to bottom

# Step 2: Load only terra and other needed packages (avoid raster)
cat("\n========================================\n")
cat("LOADING PACKAGES\n")
cat("========================================\n\n")

# Unload any conflicting packages
try(detach("package:raster", unload = TRUE), silent = TRUE)
try(detach("package:sp", unload = TRUE), silent = TRUE)

# Load only needed packages
library(terra)      # For all spatial raster operations
library(sf)         # For vector data
library(dplyr)      # For data manipulation
library(ggplot2)    # For plotting
library(maxnet)     # For SDM
library(pROC)       # For AUC

# Set terra options to avoid conflicts
terraOptions(progress = 10, memfrac = 0.5)

# Step 3: Load your existing data
cat("\n========================================\n")
cat("LOADING EXISTING DATA\n")
cat("========================================\n\n")

# Load counties if not in environment
if(!exists("counties")) {
  counties <- st_read("edited-counties.shp")
}

# Load butterfly data
if(!exists("butterfly_kenya")) {
  butterfly_kenya <- readRDS("kenya_butterflies_final.rds")
}

# Step 4: Create elevation data as SpatRaster
cat("\n========================================\n")
cat("CREATING ELEVATION DATA\n")
cat("========================================\n\n")

# Create a simple elevation raster for Kenya
# First create a template raster
elev_template <- rast(ext(counties), resolution = 0.00833333)  # ~1km resolution
crs(elev_template) <- crs(counties)

# Fill with random elevation values (for demonstration)
# In reality, you'd use actual elevation data
set.seed(123)
elev_values <- runif(ncell(elev_template), 0, 3000)  # 0-3000m elevation
elev_terra <- setValues(elev_template, elev_values)

# Smooth to create realistic topography
elev_terra <- focal(elev_terra, w = 9, fun = "mean", na.policy = "omit")
names(elev_terra) <- "elevation"

cat("Elevation raster created\n")

# Step 5: Create climate data as SpatRaster
cat("\n========================================\n")
cat("CREATING CLIMATE DATA\n")
cat("========================================\n\n")

# Create climate variables based on elevation and latitude
# Get latitude values
lat_grid <- init(elev_terra, "y")

# Temperature: decreases with elevation (lapse rate) and with latitude
temp_c <- 28 - 0.0065 * elev_terra - 0.4 * abs(lat_grid)
bio1 <- temp_c * 10  # Scale to match WorldClim format
names(bio1) <- "bio1"

# Precipitation: higher at higher elevations
precip_mm <- 600 + 0.3 * elev_terra
precip_mm <- clamp(precip_mm, lower = 200, upper = 2000)
bio12 <- precip_mm
names(bio12) <- "bio12"

# Temperature seasonality
bio4 <- 150 + 0.05 * elev_terra + 20 * abs(lat_grid/5)
names(bio4) <- "bio4"

# Precipitation seasonality
bio15 <- 40 + 0.02 * elev_terra + 10 * abs(lat_grid/5)
names(bio15) <- "bio15"

# Combine into one SpatRaster
climate_terra <- c(bio1, bio12, bio4, bio15)
names(climate_terra) <- c("bio1", "bio12", "bio4", "bio15")

cat("Climate rasters created with", nlyr(climate_terra), "layers\n")

# Step 6: Combine all predictors
cat("\n========================================\n")
cat("COMBINING PREDICTORS\n")
cat("========================================\n\n")

predictors_terra <- c(elev_terra, climate_terra)
cat("Final predictor stack has", nlyr(predictors_terra), "layers\n")
cat("Layer names:", names(predictors_terra), "\n")

# Step 7: Prepare occurrence data
cat("\n========================================\n")
cat("PREPARING OCCURRENCE DATA\n")
cat("========================================\n\n")

# Select focal species
species_counts <- table(butterfly_kenya$species)
focal_species <- names(sort(species_counts, decreasing = TRUE))[1]
cat("Modeling distribution for:", focal_species, 
    "(", species_counts[focal_species], "observations )\n")

# Get occurrence coordinates
occ_sf <- butterfly_kenya[butterfly_kenya$species == focal_species, ]
occ_coords <- st_coordinates(occ_sf)
occ_data <- data.frame(
  lon = occ_coords[,1],
  lat = occ_coords[,2],
  presence = 1
)

cat("Occurrence points:", nrow(occ_data), "\n")

# Step 8: Create background points
cat("\n========================================\n")
cat("CREATING BACKGROUND POINTS\n")
cat("========================================\n\n")

set.seed(123)
bg_sf <- st_sample(counties, size = 5000)
bg_coords <- st_coordinates(bg_sf)
bg_data <- data.frame(
  lon = bg_coords[,1],
  lat = bg_coords[,2],
  presence = 0
)

cat("Background points:", nrow(bg_data), "\n")

# Step 9: Combine and extract environmental values
cat("\n========================================\n")
cat("EXTRACTING ENVIRONMENTAL VALUES\n")
cat("========================================\n\n")

all_points <- rbind(occ_data, bg_data)

# Convert to SpatVector for extraction
points_vect <- vect(all_points[, c("lon", "lat")], geom = c("lon", "lat"), crs = crs(predictors_terra))

# Extract values
env_values <- terra::extract(predictors_terra, points_vect)

# Combine with presence data
env_df <- cbind(all_points, env_values[, -1])  # Remove first column (ID)

# Remove NAs
env_df <- na.omit(env_df)
cat("Retained", nrow(env_df), "points after removing NAs\n")
cat("  Presence:", sum(env_df$presence == 1), "\n")
cat("  Background:", sum(env_df$presence == 0), "\n")

# Step 10: Run MaxEnt model
cat("\n========================================\n")
cat("RUNNING MAXENT MODEL\n")
cat("========================================\n\n")

# Prepare data for maxnet
train_data <- env_df[, !names(env_df) %in% c("lon", "lat", "ID")]

# Split into training and testing
set.seed(456)
train_idx <- sample(1:nrow(train_data), size = 0.8 * nrow(train_data))
train <- train_data[train_idx, ]
test <- train_data[-train_idx, ]

# Run model
sdm_model <- maxnet(
  p = train$presence,
  data = train[, !names(train) %in% "presence"],
  f = maxnet.formula(train$presence, train[, !names(train) %in% "presence"])
)

# Evaluate
test_pred <- predict(sdm_model, test[, !names(test) %in% "presence"], type = "cloglog")
roc_obj <- roc(test$presence, test_pred)
cat("AUC:", round(auc(roc_obj), 3), "\n")

# Variable importance
cat("\nVariable importance:\n")
coefs <- coef(sdm_model)
var_imp <- data.frame(
  Variable = names(coefs)[-1],
  Coefficient = abs(coefs[-1])
) %>%
  arrange(desc(Coefficient))
print(var_imp)

# Step 11: Create prediction map
cat("\n========================================\n")
cat("CREATING PREDICTION MAP\n")
cat("========================================\n\n")

# Predict over entire Kenya
pred_rast <- terra::predict(predictors_terra, sdm_model, type = "cloglog")
names(pred_rast) <- "suitability"

# Convert to dataframe for ggplot
pred_df <- as.data.frame(pred_rast, xy = TRUE)

# Cities for reference
cities <- data.frame(
  city = c("Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"),
  lat = c(-1.2864, -4.0435, -0.0917, -0.3031, 0.5143),
  lon = c(36.8172, 39.6682, 34.7678, 36.0663, 35.2698)
)

# Plot
p_sdm <- ggplot() +
  geom_raster(data = pred_df, aes(x = x, y = y, fill = suitability)) +
  scale_fill_viridis_c(name = "Habitat\nSuitability", option = "plasma") +
  geom_sf(data = counties, fill = NA, color = "black", size = 0.3) +
  geom_point(data = occ_data, aes(x = lon, y = lat), 
             color = "white", size = 0.5, alpha = 0.5) +
  geom_point(data = cities, aes(x = lon, y = lat), 
             color = "red", size = 2, shape = 18) +
  geom_text(data = cities, aes(x = lon, y = lat, label = city), 
            nudge_y = 0.3, size = 3, color = "black") +
  theme_minimal() +
  labs(title = paste("Habitat Suitability:", focal_species),
       subtitle = paste("MaxEnt Model | AUC =", round(auc(roc_obj), 3),
                        "| n =", nrow(occ_data), "observations"),
       x = "Longitude", y = "Latitude") +
  coord_sf(xlim = c(33.5, 42), ylim = c(-5, 5))

print(p_sdm)
ggsave("species_distribution_model.png", p_sdm, width = 12, height = 10)

# Step 12: Save results
cat("\n========================================\n")
cat("SAVING RESULTS\n")
cat("========================================\n\n")

saveRDS(sdm_model, "sdm_model.rds")
saveRDS(predictors_terra, "predictors_terra.rds")
writeRaster(pred_rast, "habitat_suitability.tif", overwrite = TRUE)

cat("Model saved to sdm_model.rds\n")
cat("Predictors saved to predictors_terra.rds\n")
cat("Suitability map saved to habitat_suitability.tif\n")
cat("Map saved to species_distribution_model.png\n")