# First, let's be explicit about which package to use
# Reload libraries with explicit ordering
library(rinat)
library(dplyr)
library(ggplot2)
library(sf)
library(leaflet)

# Use dplyr::select explicitly to avoid conflicts
# Or just don't use select() for now - let's use simpler indexing

# Common Kenyan butterfly species (valid scientific names)
kenyan_butterflies <- c(
  "Papilio demodocus",        # Citrus Swallowtail
  "Junonia oenone",           # Dark Blue Pansy
  "Danaus chrysippus",        # African Monarch
  "Hypolimnas misippus",      # Diadem
  "Belenois aurota",          # Brown-veined White
  "Acraea acrita",            # Fiery Acraea
  "Charaxes brutus",          # White-barred Charaxes
  "Precis octavia",           # Gaudy Commodore
  "Eurema hecabe",            # Common Grass Yellow
  "Catopsilia florella",      # African Migrant
  "Vanessa cardui",           # Painted Lady
  "Junonia hierta",           # Yellow Pansy
  "Byblia ilithyia",          # Joker
  "Neptis saclava",           # Spotted Sailer
  "Amauris niavius"           # Friar
)

# Function to get data for Kenyan species (without using select)
get_kenyan_species <- function(species_name) {
  cat("Searching for:", species_name, "... ")
  
  tryCatch({
    data <- get_inat_obs(
      taxon_name = species_name,
      place_id = 69893,  # Kenya
      maxresults = 200,
      quality = "research"
    )
    
    if(!is.null(data) && nrow(data) > 0) {
      cat("found", nrow(data), "records\n")
      # Add species name as a new column
      data$species <- species_name
      return(data)
    } else {
      cat("no records\n")
      return(NULL)
    }
  }, error = function(e) {
    cat("error:", e$message, "\n")
    return(NULL)
  })
}

# Download data for Kenyan species
kenya_list <- list()

for(species in kenyan_butterflies) {
  result <- get_kenyan_species(species)
  if(!is.null(result)) {
    kenya_list[[species]] <- result
  }
  Sys.sleep(1)  # Be nice to API
}

# Combine all Kenyan data
if(length(kenya_list) > 0) {
  kenya_butterflies <- bind_rows(kenya_list)
  cat("\nTotal Kenyan butterfly records:", nrow(kenya_butterflies), "\n")
  cat("Species found:", length(unique(kenya_butterflies$species)), "\n")
  
  # Show what we got - using base R to avoid select() issues
  print(table(kenya_butterflies$species))
  
} else {
  cat("\nNo Kenyan butterfly data found with specific species.\n")
  cat("Let's try a broader approach...\n")
  
  # Alternative: Get all butterfly observations from Kenya using higher taxonomy
  cat("\nGetting all butterfly observations from Kenya...\n")
  
  all_kenya_butterflies <- tryCatch({
    get_inat_obs(
      taxon_name = "Papilionoidea",  # Butterfly superfamily
      place_id = 69893,
      maxresults = 1000,
      quality = "research"
    )
  }, error = function(e) NULL)
  
  if(!is.null(all_kenya_butterflies) && nrow(all_kenya_butterflies) > 0) {
    cat("Found", nrow(all_kenya_butterflies), "butterfly observations in Kenya\n")
    
    # Add a simplified species column (using base R)
    all_kenya_butterflies$species <- all_kenya_butterflies$scientific_name
    
    # Show top species
    species_counts <- table(all_kenya_butterflies$species)
    top_species <- sort(species_counts, decreasing = TRUE)[1:10]
    print(top_species)
    
    kenya_butterflies <- all_kenya_butterflies
  } else {
    cat("Still no data. Let's create a synthetic dataset for learning.\n")
    
    # Create synthetic Kenyan butterfly data for practice
    set.seed(123)
    n_samples <- 100
    
    kenya_butterflies <- data.frame(
      scientific_name = sample(kenyan_butterflies[1:8], n_samples, replace = TRUE),
      latitude = runif(n_samples, -4.5, 4.5),
      longitude = runif(n_samples, 34, 41),
      observed_on = sample(seq.Date(as.Date("2020-01-01"), 
                                    as.Date("2024-12-31"), by="day"), 
                           n_samples, replace = TRUE),
      user_login = paste0("observer_", sample(1:30, n_samples, replace = TRUE)),
      id = 1:n_samples,
      stringsAsFactors = FALSE
    )
    
    # Add species column
    kenya_butterflies$species <- kenya_butterflies$scientific_name
    kenya_butterflies$location_type <- "To be classified"
    
    cat("Created synthetic dataset with", nrow(kenya_butterflies), "observations\n")
  }
}

# Now classify by location type (using base R to avoid dplyr issues)
if(exists("kenya_butterflies") && nrow(kenya_butterflies) > 0) {
  
  # Define bounds
  nairobi_bounds <- list(
    lat = c(min = -1.5, max = -1.0),
    lon = c(min = 36.5, max = 37.2)
  )
  
  kakamega_bounds <- list(
    lat = c(min = 0.2, max = 0.4),
    lon = c(min = 34.8, max = 35.0)
  )
  
  tsavo_bounds <- list(
    lat = c(min = -3.5, max = -2.5),
    lon = c(min = 38.0, max = 39.0)
  )
  
  # Classify each row using a loop (simple but clear)
  kenya_butterflies$location_type <- "Other"
  
  for(i in 1:nrow(kenya_butterflies)) {
    lat <- kenya_butterflies$latitude[i]
    lon <- kenya_butterflies$longitude[i]
    
    if(!is.na(lat) && !is.na(lon)) {
      if(lat >= nairobi_bounds$lat[1] && lat <= nairobi_bounds$lat[2] &&
         lon >= nairobi_bounds$lon[1] && lon <= nairobi_bounds$lon[2]) {
        kenya_butterflies$location_type[i] <- "Urban (Nairobi)"
      } else if(lat >= kakamega_bounds$lat[1] && lat <= kakamega_bounds$lat[2] &&
                lon >= kakamega_bounds$lon[1] && lon <= kakamega_bounds$lon[2]) {
        kenya_butterflies$location_type[i] <- "Natural (Kakamega)"
      } else if(lat >= tsavo_bounds$lat[1] && lat <= tsavo_bounds$lat[2] &&
                lon >= tsavo_bounds$lon[1] && lon <= tsavo_bounds$lon[2]) {
        kenya_butterflies$location_type[i] <- "Natural (Tsavo)"
      }
    }
  }
  
  # Summary
  cat("\nClassification summary:\n")
  print(table(kenya_butterflies$location_type))
  
  # Filter to our areas of interest
  analysis_data <- kenya_butterflies[kenya_butterflies$location_type != "Other", ]
  
  cat("\nData for analysis:", nrow(analysis_data), "observations\n")
  if(nrow(analysis_data) > 0) {
    print(table(analysis_data$location_type, analysis_data$species))
  }
}

# Let's create a combined dataset with real and synthetic data
# This way we can practice the analysis while preserving the real observations

# First, let's look at our real Tsavo data
cat("REAL DATA FROM TSAVO:\n")
cat("====================\n")
real_tsavo <- analysis_data
print(real_tsavo[, c("species", "latitude", "longitude", "observed_on")])

# Now let's create additional synthetic data for Nairobi and Kakamega
# so we have something to compare with Tsavo

set.seed(456)  # Different seed for new synthetic data

# Create synthetic Nairobi data (urban)
nairobi_synthetic <- data.frame(
  species = sample(c("Papilio demodocus", "Danaus chrysippus", "Junonia oenone", 
                     "Eurema hecabe", "Catopsilia florella"), 15, replace = TRUE),
  latitude = runif(15, -1.4, -1.1),
  longitude = runif(15, 36.7, 37.0),
  observed_on = sample(seq.Date(as.Date("2022-01-01"), 
                                as.Date("2024-12-31"), by="day"), 15),
  user_login = paste0("nrb_observer_", 1:15),
  id = 1001:1015,
  location_type = "Urban (Nairobi)",
  stringsAsFactors = FALSE
)

# Create synthetic Kakamega data (natural forest)
kakamega_synthetic <- data.frame(
  species = sample(c("Charaxes brutus", "Acraea acrita", "Belenois aurota",
                     "Neptis saclava", "Amauris niavius"), 12, replace = TRUE),
  latitude = runif(12, 0.25, 0.35),
  longitude = runif(12, 34.85, 34.95),
  observed_on = sample(seq.Date(as.Date("2021-01-01"), 
                                as.Date("2024-12-31"), by="day"), 12),
  user_login = paste0("kakamega_observer_", 1:12),
  id = 2001:2012,
  location_type = "Natural (Kakamega)",
  stringsAsFactors = FALSE
)

# Add species column to match format
nairobi_synthetic$species <- nairobi_synthetic$species
kakamega_synthetic$species <- kakamega_synthetic$species

# Combine real and synthetic data
full_dataset <- rbind(
  real_tsavo[, c("species", "latitude", "longitude", "observed_on", 
                 "user_login", "id", "location_type")],
  nairobi_synthetic,
  kakamega_synthetic
)

cat("\n\nFULL DATASET SUMMARY:\n")
cat("====================\n")
print(table(full_dataset$location_type, full_dataset$species))

# 1. Basic map of all observations
plot(full_dataset$longitude, full_dataset$latitude, 
     col = c("red", "darkgreen", "orange")[as.factor(full_dataset$location_type)],
     pch = 19, cex = 1.5,
     xlab = "Longitude", ylab = "Latitude",
     main = "Butterfly Observations in Kenya",
     xlim = c(34, 40), ylim = c(-4, 1))
legend("topright", 
       legend = unique(full_dataset$location_type),
       col = c("red", "darkgreen", "orange"),
       pch = 19)

# Add country outline (approximate)
rect(33.5, -4.8, 42, 4.6, border = "blue", lwd = 2, lty = 2)
text(38, 4, "Kenya", col = "blue")

# 2. Species accumulation by location
par(mfrow = c(1, 3))

locations <- unique(full_dataset$location_type)
for(loc in locations) {
  loc_data <- full_dataset[full_dataset$location_type == loc, ]
  species_counts <- sort(table(loc_data$species), decreasing = TRUE)
  
  barplot(species_counts, 
          main = paste(loc),
          xlab = "Species", ylab = "Count",
          col = rainbow(length(species_counts)),
          las = 2, cex.names = 0.7)
}

par(mfrow = c(1, 1))

# 3. Calculate diversity metrics
library(vegan)

diversity_results <- data.frame(
  Location = locations,
  Richness = NA,
  Shannon = NA,
  Simpson = NA,
  Total_Obs = NA
)

for(i in 1:length(locations)) {
  loc_data <- full_dataset[full_dataset$location_type == locations[i], ]
  species_freq <- table(loc_data$species)
  
  diversity_results$Richness[i] <- length(species_freq)
  diversity_results$Total_Obs[i] <- nrow(loc_data)
  diversity_results$Shannon[i] <- diversity(species_freq, index = "shannon")
  diversity_results$Simpson[i] <- diversity(species_freq, index = "simpson")
}

cat("\nDIVERSITY METRICS:\n")
print(diversity_results)

# 4. Visualize diversity metrics
par(mfrow = c(2, 2))

# Richness
barplot(diversity_results$Richness, 
        names.arg = diversity_results$Location,
        main = "Species Richness",
        col = c("red", "darkgreen", "orange"),
        ylim = c(0, max(diversity_results$Richness) + 2))

# Shannon diversity
barplot(diversity_results$Shannon, 
        names.arg = diversity_results$Location,
        main = "Shannon Diversity",
        col = c("red", "darkgreen", "orange"),
        ylim = c(0, max(diversity_results$Shannon) + 0.5))

# Simpson diversity
barplot(diversity_results$Simpson, 
        names.arg = diversity_results$Location,
        main = "Simpson Diversity",
        col = c("red", "darkgreen", "orange"),
        ylim = c(0, 1))

# Observations
barplot(diversity_results$Total_Obs, 
        names.arg = diversity_results$Location,
        main = "Total Observations",
        col = c("red", "darkgreen", "orange"))

par(mfrow = c(1, 1))


# Since we have small sample sizes, let's do some simple statistical tests

# 1. Chi-square test for species composition across locations
species_location_table <- table(full_dataset$location_type, full_dataset$species)

cat("\nCONTINGENCY TABLE:\n")
print(species_location_table)

# Chi-square test (warning: small sample sizes)
if(sum(species_location_table) > 0) {
  chi_test <- chisq.test(species_location_table)
  cat("\nChi-square test for independence:\n")
  print(chi_test)
  
  # If expected frequencies are too low, Fisher's exact test is better
  # But it might be computationally intensive for large tables
  # Let's do pairwise Fisher tests for each species
}

# 2. Compare urban vs natural (combining Kakamega and Tsavo as "Natural")
full_dataset$habitat_type <- ifelse(
  full_dataset$location_type == "Urban (Nairobi)", 
  "Urban", 
  "Natural"
)

# 3. Simple boxplot comparison
par(mfrow = c(1, 2))

# Species richness by habitat (using base R)
habitat_richness <- aggregate(species ~ habitat_type, 
                              data = full_dataset, 
                              function(x) length(unique(x)))
barplot(habitat_richness$species, 
        names.arg = habitat_richness$habitat_type,
        main = "Species Richness by Habitat",
        col = c("red", "green"),
        ylab = "Number of Species")

# Add a simple test
if(length(unique(full_dataset$habitat_type)) == 2) {
  # We can't do a t-test on richness per observation, so let's look at
  # the proportion of unique species
  cat("\nHabitat comparison:\n")
  print(habitat_richness)
}

par(mfrow = c(1, 1))


# Add year and month columns
full_dataset$year <- as.numeric(format(as.Date(full_dataset$observed_on), "%Y"))
full_dataset$month <- as.numeric(format(as.Date(full_dataset$observed_on), "%m"))

# Observations over time
yearly_counts <- table(full_dataset$year, full_dataset$location_type)

cat("\nYEARLY OBSERVATIONS:\n")
print(yearly_counts)

# Plot temporal patterns
par(mfrow = c(2, 1))

# By year
if(nrow(yearly_counts) > 0) {
  barplot(t(yearly_counts), 
          beside = TRUE,
          main = "Observations by Year",
          xlab = "Year", ylab = "Count",
          col = c("red", "darkgreen", "orange"),
          legend = colnames(yearly_counts))
}

# By month
monthly_counts <- table(full_dataset$month, full_dataset$location_type)
if(nrow(monthly_counts) > 0) {
  barplot(t(monthly_counts), 
          beside = TRUE,
          main = "Observations by Month",
          xlab = "Month", ylab = "Count",
          col = c("red", "darkgreen", "orange"))
}

par(mfrow = c(1, 1))


# Save all results
write.csv(full_dataset, "kenya_butterfly_data.csv", row.names = FALSE)
write.csv(diversity_results, "kenya_diversity_metrics.csv", row.names = FALSE)

# Create a summary text file
sink("kenya_analysis_summary.txt")
cat("KENYA BUTTERFLY ANALYSIS SUMMARY\n")
cat("================================\n\n")
cat("Date of analysis:", Sys.time(), "\n\n")

cat("DATASET SUMMARY\n")
cat("---------------\n")
cat("Total observations:", nrow(full_dataset), "\n")
cat("Real observations from Tsavo:", nrow(real_tsavo), "\n")
cat("Synthetic observations added:", nrow(full_dataset) - nrow(real_tsavo), "\n\n")

cat("OBSERVATIONS BY LOCATION\n")
print(table(full_dataset$location_type))

cat("\n\nSPECIES BY LOCATION\n")
print(table(full_dataset$location_type, full_dataset$species))

cat("\n\nDIVERSITY METRICS\n")
print(diversity_results)

cat("\n\nHABITAT COMPARISON\n")
print(habitat_richness)

sink()

cat("\nAnalysis complete! Files saved:\n")
cat("- kenya_butterfly_data.csv\n")
cat("- kenya_diversity_metrics.csv\n")
cat("- kenya_analysis_summary.txt\n")

# Load your data if not already loaded
butterfly_df <- butterfly_kenya %>%
  mutate(
    lon = st_coordinates(.)[,1],
    lat = st_coordinates(.)[,2]
  ) %>%
  st_drop_geometry()

# 1.1 Species dominance analysis
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
cat("\n\nURBAN ADAPTERS ( >30% observations in urban areas):\n")
urban_specialists <- species_summary %>%
  filter(urban_pct > 30) %>%
  select(species, urban_pct, protected_pct, total_obs)
print(urban_specialists)

cat("\n\nPROTECTED AREA SPECIALISTS ( >30% in protected areas):\n")
protected_specialists <- species_summary %>%
  filter(protected_pct > 30) %>%
  select(species, protected_pct, urban_pct, total_obs)
print(protected_specialists)

cat("\n\nGENERALIST SPECIES (balanced distribution):\n")
generalists <- species_summary %>%
  filter(urban_pct <= 30 & protected_pct <= 30) %>%
  select(species, urban_pct, protected_pct, other_pct)
print(generalists)

# 1.3 Statistical significance test
# Chi-square test for each species
cat("\n\nSTATISTICAL SIGNIFICANCE TESTS:\n")
cat("================================\n")

for(sp in unique(butterfly_df$species)) {
  sp_data <- butterfly_df %>% filter(species == sp)
  sp_table <- table(sp_data$area_type)
  
  # Expected distribution (if evenly distributed across 3 areas)
  expected <- rep(sum(sp_table)/3, 3)
  
  if(sum(sp_table) > 5) {  # Only test if enough observations
    chi_test <- chisq.test(sp_table, p = rep(1/3, 3))
    cat(sprintf("\n%s: p-value = %.4f", sp, chi_test$p.value))
    if(chi_test$p.value < 0.05) {
      cat(" - SIGNIFICANT (species shows preference)")
    } else {
      cat(" - not significant")
    }
  }
}