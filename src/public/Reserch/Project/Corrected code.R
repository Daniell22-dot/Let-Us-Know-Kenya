# First, let's load the shapefile correctly now that .shx is fixed
library(sf)
library(ggplot2)
library(dplyr)

# Load the counties shapefile
counties <- st_read("edited-counties.shp")

# Check what columns we actually have
cat("Column names in counties data:\n")
print(names(counties))

# View the first few rows
cat("\nFirst few rows of attribute data:\n")
print(head(counties))

# Check the structure
cat("\nStructure of counties data:\n")
str(counties)

# See what identifier columns exist
id_columns <- grep("id|ID|Id|OBJECT|object|FID|fid", names(counties), value = TRUE)
cat("\nPossible ID columns found:", paste(id_columns, collapse = ", "), "\n")

# If no ID column found, let's create one
if(length(id_columns) == 0) {
  cat("\nNo ID column found. Creating FID column...\n")
  counties$FID <- 1:nrow(counties)
}


# Simple map using county names as fill (for visualization)
ggplot() +
  geom_sf(data = counties, aes(fill = COUNTIES), alpha = 0.7) +
  theme_minimal() +
  labs(title = "Kenya Counties",
       x = "Longitude", y = "Latitude") +
  theme(legend.position = "none") +  # Hide legend since 47 counties
  coord_sf()

# Save
ggsave("kenya_counties_basic.png", width = 10, height = 8)

# Major cities in Kenya
cities <- data.frame(
  city = c("Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi"),
  lat = c(-1.2864, -4.0435, -0.0917, -0.3031, 0.5143, -1.0331, -3.2192),
  lon = c(36.8172, 39.6682, 34.7678, 36.0663, 35.2698, 37.0693, 40.1169)
)

# Convert to sf
cities_sf <- st_as_sf(cities, coords = c("lon", "lat"), crs = st_crs(counties))

# Create urban buffers (15km radius for major cities)
urban_buffers <- st_buffer(cities_sf, dist = 15000)  # 15km in meters

# Major protected areas
parks <- data.frame(
  park = c("Tsavo National Park", "Kakamega Forest", "Aberdare National Park",
           "Mount Kenya", "Maasai Mara", "Amboseli", "Lake Nakuru", "Meru National Park"),
  lat = c(-3.0, 0.3, -0.5, 0.15, -1.5, -2.65, -0.37, 0.1),
  lon = c(38.5, 34.85, 36.7, 37.3, 35.0, 37.25, 36.08, 38.2)
)

parks_sf <- st_as_sf(parks, coords = c("lon", "lat"), crs = st_crs(counties))
park_buffers <- st_buffer(parks_sf, dist = 30000)  # 30km radius

# Quick map to check
ggplot() +
  geom_sf(data = counties, fill = "lightgray", color = "white") +
  geom_sf(data = urban_buffers, fill = "red", alpha = 0.3) +
  geom_sf(data = park_buffers, fill = "darkgreen", alpha = 0.3) +
  geom_sf(data = cities_sf, color = "red", size = 2) +
  theme_minimal() +
  labs(title = "Kenya: Urban Centers and Protected Areas") +
  coord_sf()

# Install rgbif if not installed
if(!require(rgbif)) install.packages("rgbif")
library(rgbif)

# Common Kenyan butterfly species (validated names)
butterfly_species <- c(
  "Papilio demodocus",      # Citrus Swallowtail
  "Danaus chrysippus",      # African Monarch
  "Junonia oenone",         # Dark Blue Pansy
  "Charaxes brutus",        # White-barred Charaxes
  "Belenois aurota",        # Brown-veined White
  "Acraea acrita",          # Fiery Acraea
  "Hypolimnas misippus",    # Diadem
  "Eurema hecabe",          # Common Grass Yellow
  "Catopsilia florella",    # African Migrant
  "Vanessa cardui"          # Painted Lady
)

# Function to download GBIF data
download_gbif_data <- function(species_name) {
  cat("Downloading", species_name, "...")
  
  tryCatch({
    occ <- occ_search(
      scientificName = species_name,
      country = "KE",
      hasCoordinate = TRUE,
      hasGeospatialIssue = FALSE,
      limit = 1000,
      year = "2000,2024"
    )
    
    if(!is.null(occ$data) && nrow(occ$data) > 0) {
      df <- occ$data
      df$species <- species_name
      cat(" found", nrow(df), "records\n")
      return(df)
    } else {
      cat(" no records found\n")
      return(NULL)
    }
  }, error = function(e) {
    cat(" error:", e$message, "\n")
    return(NULL)
  })
}

# Download data for all species
all_data <- list()
for(sp in butterfly_species) {
  result <- download_gbif_data(sp)
  if(!is.null(result)) {
    all_data[[sp]] <- result
  }
  Sys.sleep(1)  # Be nice to GBIF
}

# Combine all data
if(length(all_data) > 0) {
  butterfly_raw <- bind_rows(all_data)
  cat("\nTotal records downloaded:", nrow(butterfly_raw), "\n")
} else {
  cat("\nNo GBIF data available. Creating sample data...\n")
  
  # Create sample data
  set.seed(123)
  n_points <- 300
  
  # Random points within Kenya
  bbox <- st_bbox(counties)
  butterfly_raw <- data.frame(
    species = sample(butterfly_species, n_points, replace = TRUE),
    decimalLongitude = runif(n_points, bbox$xmin, bbox$xmax),
    decimalLatitude = runif(n_points, bbox$ymin, bbox$ymax),
    year = sample(2015:2024, n_points, replace = TRUE),
    month = sample(1:12, n_points, replace = TRUE)
  )
}

# Convert to sf
butterfly_points <- st_as_sf(
  butterfly_raw, 
  coords = c("decimalLongitude", "decimalLatitude"),
  crs = st_crs(counties)
)

# Keep only points within Kenya
butterfly_kenya <- st_intersection(butterfly_points, st_union(counties))

cat("\nFinal dataset:", nrow(butterfly_kenya), "observations within Kenya\n")

# Check which points are in urban areas
in_urban <- st_intersects(butterfly_kenya, urban_buffers, sparse = FALSE)
butterfly_kenya$in_urban <- apply(in_urban, 1, any)

# Check which points are in protected areas
in_park <- st_intersects(butterfly_kenya, park_buffers, sparse = FALSE)
butterfly_kenya$in_park <- apply(in_park, 1, any)

# Classify area type
butterfly_kenya$area_type <- "Other"
butterfly_kenya$area_type[butterfly_kenya$in_urban] <- "Urban"
butterfly_kenya$area_type[butterfly_kenya$in_park] <- "Protected"
# If both, prioritize protected
butterfly_kenya$area_type[butterfly_kenya$in_park] <- "Protected"

# Summary
cat("\nClassification Results:\n")
print(table(butterfly_kenya$area_type))

# Main map with all elements
p_main <- ggplot() +
  # Base counties
  geom_sf(data = counties, fill = "lightgray", color = "white", size = 0.2) +
  
  # Protected areas
  geom_sf(data = park_buffers, fill = "darkgreen", alpha = 0.2, color = NA) +
  
  # Urban areas
  geom_sf(data = urban_buffers, fill = "red", alpha = 0.2, color = NA) +
  
  # Butterfly observations
  geom_sf(data = butterfly_kenya, aes(color = area_type), size = 2, alpha = 0.7) +
  
  # Cities
  geom_sf(data = cities_sf, size = 3, shape = 23, fill = "yellow", color = "black") +
  geom_sf_text(data = cities_sf, aes(label = city), nudge_y = 0.2, size = 3) +
  
  # Colors
  scale_color_manual(values = c("Urban" = "red", 
                                "Protected" = "darkgreen", 
                                "Other" = "gray50")) +
  
  # Theme and labels
  theme_minimal() +
  labs(title = "Butterfly Observations in Kenya",
       subtitle = paste(nrow(butterfly_kenya), "observations |", 
                        length(unique(butterfly_kenya$species)), "species"),
       x = "Longitude", y = "Latitude",
       color = "Area Type") +
  
  theme(legend.position = "bottom",
        plot.title = element_text(hjust = 0.5, face = "bold"),
        plot.subtitle = element_text(hjust = 0.5)) +
  
  # Add scale bar and north arrow
  annotation_scale(location = "bl", width_hint = 0.3) +
  annotation_north_arrow(location = "tl", which_north = "true",
                         style = north_arrow_fancy_orienteering()) +
  
  # Set map limits
  coord_sf(xlim = c(33.5, 42), ylim = c(-5, 5))

print(p_main)
ggsave("kenya_butterfly_analysis.png", p_main, width = 14, height = 10, dpi = 300)

# Extract data for analysis
analysis_df <- butterfly_kenya %>%
  mutate(
    lon = st_coordinates(.)[,1],
    lat = st_coordinates(.)[,2]
  ) %>%
  st_drop_geometry()

# 1. Species richness by area type
richness <- analysis_df %>%
  group_by(area_type) %>%
  summarise(
    n_species = n_distinct(species),
    n_obs = n(),
    .groups = 'drop'
  )

print("\nSpecies Richness by Area Type:")
print(richness)

# 2. Species composition table
species_table <- table(analysis_df$area_type, analysis_df$species)
print("\nSpecies Composition:")
print(species_table)

# 3. Chi-square test if enough data
if(nrow(species_table) > 1 && ncol(species_table) > 1) {
  chi_result <- chisq.test(species_table)
  print("\nChi-square Test:")
  print(chi_result)
}

# 4. Visualization
p_composition <- ggplot(analysis_df, aes(x = area_type, fill = species)) +
  geom_bar(position = "fill") +
  scale_fill_viridis_d() +
  theme_minimal() +
  labs(title = "Species Composition by Area Type",
       x = "", y = "Proportion",
       fill = "Species") +
  theme(legend.position = "bottom",
        legend.text = element_text(size = 8))

print(p_composition)
ggsave("species_composition.png", p_composition, width = 10, height = 8)

# 5. Observations by county
county_obs <- st_join(counties, butterfly_kenya) %>%
  group_by(COUNTIES, FID) %>%
  summarise(
    n_obs = n(),
    n_species = n_distinct(species),
    .groups = 'drop'
  )

# Map of observations by county
p_county <- ggplot() +
  geom_sf(data = county_obs, aes(fill = n_obs)) +
  scale_fill_viridis_c(name = "Number of\nObservations", option = "plasma") +
  geom_sf(data = cities_sf, size = 2, shape = 23, fill = "white") +
  theme_minimal() +
  labs(title = "Butterfly Observations by County",
       x = "Longitude", y = "Latitude") +
  coord_sf()

print(p_county)
ggsave("observations_by_county.png", p_county, width = 12, height = 10)

# Save all data
saveRDS(butterfly_kenya, "kenya_butterflies_final.rds")
st_write(butterfly_kenya, "kenya_butterflies_final.shp", delete_layer = TRUE)
write.csv(analysis_df, "kenya_butterflies_data.csv", row.names = FALSE)

# Create summary report
sink("kenya_analysis_summary.txt")
cat("KENYA BUTTERFLY ANALYSIS SUMMARY\n")
cat("================================\n\n")
cat("Analysis date:", Sys.time(), "\n\n")

cat("DATA SUMMARY\n")
cat("------------\n")
cat("Total observations:", nrow(butterfly_kenya), "\n")
cat("Species:", length(unique(butterfly_kenya$species)), "\n")
cat("Counties:", nrow(counties), "\n\n")

cat("AREA TYPE CLASSIFICATION\n")
cat("-----------------------\n")
print(table(butterfly_kenya$area_type))

cat("\nSPECIES RICHNESS BY AREA\n")
print(richness)

cat("\nTOP 10 COUNTIES BY OBSERVATIONS\n")
county_obs_sorted <- county_obs[order(-county_obs$n_obs), ]
print(head(county_obs_sorted[, c("COUNTIES", "n_obs", "n_species")], 10))

sink()

cat("\nAnalysis complete! Files saved:\n")
cat("- kenya_butterfly_analysis.png\n")
cat("- species_composition.png\n")
cat("- observations_by_county.png\n")
cat("- kenya_butterflies_final.shp\n")
cat("- kenya_butterflies_data.csv\n")
cat("- kenya_analysis_summary.txt\n")

# First, let's clean up the data for export
# Remove problematic columns and simplify for shapefile

# Check current column names
cat("Current column names:\n")
print(names(butterfly_kenya))

# Select and rename columns for shapefile export (keep only essential columns)
butterfly_clean <- butterfly_kenya %>%
  dplyr::select(
    species,
    area_type,
    in_urban,
    in_park,
    year,
    month,
    # Keep coordinates
    geometry
  ) %>%
  # Rename to short names (shapefiles have 10 char limit)
  rename(
    sp = species,
    area = area_type,
    urban = in_urban,
    park = in_park
  )

# Now try saving again with clean names
st_write(butterfly_clean, "butterfly_points.shp", delete_layer = TRUE)

# Also save as CSV (no column name restrictions)
butterfly_df <- butterfly_kenya %>%
  mutate(
    lon = st_coordinates(.)[,1],
    lat = st_coordinates(.)[,2]
  ) %>%
  st_drop_geometry()

write.csv(butterfly_df, "butterfly_data_full.csv", row.names = FALSE)

cat("\nData saved successfully!\n")

# Create comprehensive summary
cat("\n========================================\n")
cat("FINAL ANALYSIS SUMMARY\n")
cat("========================================\n\n")

# 1. Overall statistics
cat("OVERALL STATISTICS:\n")
cat("-------------------\n")
cat("Total observations:", nrow(butterfly_kenya), "\n")
cat("Total species:", length(unique(butterfly_kenya$species)), "\n")
cat("Year range:", min(butterfly_kenya$year), "-", max(butterfly_kenya$year), "\n\n")

# 2. Observations by species
cat("OBSERVATIONS BY SPECIES:\n")
cat("------------------------\n")
species_counts <- table(butterfly_kenya$species)
print(sort(species_counts, decreasing = TRUE))
cat("\n")

# 3. Area type classification
cat("OBSERVATIONS BY AREA TYPE:\n")
cat("--------------------------\n")
area_counts <- table(butterfly_kenya$area_type)
print(area_counts)
cat("\n")

# 4. Species richness by area type
cat("SPECIES RICHNESS BY AREA TYPE:\n")
cat("------------------------------\n")
richness_by_area <- butterfly_kenya %>%
  st_drop_geometry() %>%
  group_by(area_type) %>%
  summarise(
    Species = n_distinct(species),
    Observations = n(),
    .groups = 'drop'
  )
print(richness_by_area)
cat("\n")

# 5. Species composition by area
cat("SPECIES COMPOSITION BY AREA:\n")
cat("----------------------------\n")
species_area <- table(butterfly_kenya$area_type, butterfly_kenya$species)
print(species_area)

# 1. Bar plot of observations by species and area
p_bar <- ggplot(butterfly_kenya, aes(x = species, fill = area_type)) +
  geom_bar(position = "dodge") +
  theme_minimal() +
  labs(title = "Butterfly Observations by Species and Area Type",
       x = "Species", y = "Count",
       fill = "Area Type") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        legend.position = "bottom") +
  scale_fill_manual(values = c("Urban" = "red", 
                               "Protected" = "darkgreen", 
                               "Other" = "gray50"))

print(p_bar)
ggsave("species_by_area_bar.png", p_bar, width = 12, height = 6)

# 2. Proportion plot
p_prop <- ggplot(butterfly_kenya, aes(x = area_type, fill = species)) +
  geom_bar(position = "fill") +
  theme_minimal() +
  labs(title = "Species Proportions by Area Type",
       x = "Area Type", y = "Proportion",
       fill = "Species") +
  theme(legend.position = "bottom",
        legend.text = element_text(size = 8)) +
  scale_fill_viridis_d()

print(p_prop)
ggsave("species_proportions.png", p_prop, width = 10, height = 8)

# 3. Temporal trends
butterfly_kenya$year_month <- paste(butterfly_kenya$year, 
                                    sprintf("%02d", butterfly_kenya$month), 
                                    sep = "-")

p_temporal <- ggplot(butterfly_kenya, aes(x = year_month, fill = area_type)) +
  geom_bar(position = "dodge") +
  theme_minimal() +
  labs(title = "Observations Over Time",
       x = "Year-Month", y = "Count",
       fill = "Area Type") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1, size = 6),
        legend.position = "bottom") +
  scale_fill_manual(values = c("Urban" = "red", 
                               "Protected" = "darkgreen", 
                               "Other" = "gray50"))

print(p_temporal)
ggsave("temporal_trends.png", p_temporal, width = 14, height = 6)

# Prepare data for statistical tests
test_df <- butterfly_kenya %>%
  st_drop_geometry() %>%
  mutate(
    urban_binary = ifelse(area_type == "Urban", 1, 0),
    protected_binary = ifelse(area_type == "Protected", 1, 0)
  )

# 1. Chi-square test for species distribution across area types
species_area_table <- table(test_df$area_type, test_df$species)
if(all(dim(species_area_table) > 1)) {
  chi_test <- chisq.test(species_area_table)
  
  cat("\n========================================\n")
  cat("STATISTICAL TESTS\n")
  cat("========================================\n\n")
  cat("Chi-square test for species distribution across area types:\n")
  print(chi_test)
  
  # Check if significant
  if(chi_test$p.value < 0.05) {
    cat("\nCONCLUSION: Species composition differs significantly between area types (p < 0.05)\n")
  } else {
    cat("\nCONCLUSION: No significant difference in species composition between area types\n")
  }
}

# 2. Fisher's exact test if sample sizes are small
# (Only run if some expected counts are <5)
if(any(chisq.test(species_area_table)$expected < 5)) {
  cat("\n\nFisher's exact test (more accurate for small samples):\n")
  fisher_test <- fisher.test(species_area_table, simulate.p.value = TRUE)
  print(fisher_test)
}

# Create comprehensive HTML report
library(rmarkdown)

# Create markdown content
report_content <- '
---
title: "Kenya Butterfly Urban Adaptation Study"
author: "Daniel Manyasa"
date: "`r Sys.Date()`"
output: html_document
---

```{r setup, include=FALSE}
knitr::opts_chunk$set(echo = FALSE, warning = FALSE, message = FALSE)
library(ggplot2)
library(sf)
library(dplyr)

library(dplyr)
library(ggplot2)
library(sf)

