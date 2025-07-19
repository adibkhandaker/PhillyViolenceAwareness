package com.example.PhillyViolence.Services;

import com.example.PhillyViolence.Models.APIManipulator;
import com.example.PhillyViolence.Models.Incident;
import com.example.PhillyViolence.Models.IncidentStats;
import com.example.PhillyViolence.Repositories.IncidentRepository;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentService implements ApplicationRunner {

    @Autowired
    private IncidentRepository incidentRepository;

    // Philadelphia crime data API URLs for multiple years
    private String buildAPIUrl(int year, boolean isHistorical) {
        // No limit - get all records for the year
        return String.format(
            "https://phl.carto.com/api/v2/sql?filename=incidents_part1_part2&format=csv&skipfields=cartodb_id,the_geom,the_geom_webmercator&q=SELECT%%20*%%20,%%20ST_Y(the_geom)%%20AS%%20lat,%%20ST_X(the_geom)%%20AS%%20lng%%20FROM%%20incidents_part1_part2%%20WHERE%%20dispatch_date_time%%20>=%%20'%d-01-01'%%20AND%%20dispatch_date_time%%20<%%20'%d-01-01'%%20AND%%20ucr_general%%20IN%%20('100','200','300','400')%%20ORDER%%20BY%%20dispatch_date_time%%20DESC",
            year, year + 1
        );
    }
    
    private final int[] HISTORICAL_YEARS = {2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024};
    private final int CURRENT_YEAR = 2025;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Check if database is empty or needs initialization
        long totalRecords = incidentRepository.count();
        System.out.println("=== DATABASE INITIALIZATION CHECK ===");
        System.out.println("Current database contains " + totalRecords + " records");
        
        // Only initialize if database is truly empty (less than 50000 records to account for any test data)
        if (totalRecords < 50000) {
            System.out.println("Database appears empty (< 50000 records). Initializing with all historical data...");
            initializeAllHistoricalData();
        } else {
            System.out.println("Database already contains sufficient data (" + totalRecords + " records). Skipping full initialization.");
            System.out.println("Only updating current year (" + CURRENT_YEAR + ") data if needed...");
            // Always update current year data to ensure we have the latest crimes
            updateCurrentYearData();
        }
        System.out.println("=== INITIALIZATION COMPLETE ===");
    }

    // Initialize database with ALL historical data (2006-2024) - runs only once
    private void initializeAllHistoricalData() {
        System.out.println("=== INITIALIZING ALL HISTORICAL DATA (2006-2024) ===");
        
        int totalProcessed = 0;
        StringBuilder resultMessage = new StringBuilder();
        
        // Load all historical years (2006-2024)
        for (int year : HISTORICAL_YEARS) {
            try {
                String apiUrl = buildAPIUrl(year, true); // true = historical data (higher limit)
                System.out.println("Loading historical data for year " + year + "...");
                
                URL url = new URL(apiUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "PhillyViolence-App/1.0");
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(60000); // Longer timeout for historical data
                
                int responseCode = connection.getResponseCode();
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    int yearCount = parseCSVAndSaveIncidents(reader, year);
                    totalProcessed += yearCount;
                    resultMessage.append(String.format("Year %d: %d incidents loaded. ", year, yearCount));
                    System.out.println("✅ Successfully loaded " + yearCount + " incidents for year " + year);
                } else {
                    System.out.println("❌ API failed for year " + year + " with code " + responseCode);
                    resultMessage.append(String.format("Year %d: API failed. ", year));
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to fetch data for year " + year + ": " + e.getMessage());
                resultMessage.append(String.format("Year %d: Error occurred. ", year));
            }
        }
        
        // Now load current year (2025) data
        updateCurrentYearData();
        
        if (totalProcessed == 0) {
            System.out.println("❌ All APIs failed. Creating sample data...");
            createEnhancedSampleData();
        } else {
            System.out.println("✅ Historical data initialization completed. Total incidents: " + totalProcessed);
        }
    }

    // @Scheduled(fixedDelay = 3600000) // Run every hour - updates 2025 data only - DISABLED DURING DEVELOPMENT
    // public void getIncidentData() {
    //     updateCurrentYearData();
    // }
    
    // Method to update only current year (2025) data every hour
    private void updateCurrentYearData() {
        try {
            System.out.println("=== UPDATING CURRENT YEAR (" + CURRENT_YEAR + ") DATA ===");
            
            // First, delete existing 2025 data to avoid duplicates
            int deletedCount = incidentRepository.deleteByDispatchDateTimeYear(CURRENT_YEAR);
            System.out.println("Deleted " + deletedCount + " existing " + CURRENT_YEAR + " records");
            
            String apiUrl = buildAPIUrl(CURRENT_YEAR, false); // false = current year (normal limit)
            System.out.println("Fetching latest " + CURRENT_YEAR + " data...");
            
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "PhillyViolence-App/1.0");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                int count = parseCSVAndSaveIncidents(reader, CURRENT_YEAR);
                System.out.println("✅ Current year update completed: " + count + " incidents processed for " + CURRENT_YEAR);
            } else {
                System.out.println("❌ Current year update failed: API returned code " + responseCode);
            }
        } catch (Exception e) {
            System.err.println("❌ Current year update error: " + e.getMessage());
        }
    }

    // Manual refresh endpoint - only updates current year unless forced
    public String refreshIncidentData() {
        return refreshIncidentData(false);
    }
    
    // Manual refresh with option to reload all data
    public String refreshIncidentData(boolean forceReloadAll) {
        if (forceReloadAll) {
            System.out.println("=== FORCED RELOAD OF ALL DATA ===");
            // Clear database completely
            incidentRepository.deleteAll();
            initializeAllHistoricalData();
            return "Forced reload completed. All data refreshed.";
        } else {
            System.out.println("=== MANUAL REFRESH (CURRENT YEAR ONLY) ===");
            updateCurrentYearData();
            long totalRecords = incidentRepository.count();
            return String.format("Manual refresh completed. Current year updated. Total records in database: %d", totalRecords);
        }
    }

    private int parseCSVAndSaveIncidents(BufferedReader reader, int year) throws Exception {
        String line;
        boolean isFirstLine = true;
        int processedCount = 0;
        int maxRecords = Integer.MAX_VALUE; // No limit - get all available records
        
        while ((line = reader.readLine()) != null && processedCount < maxRecords) {
            if (isFirstLine) {
                isFirstLine = false;
                continue; // Skip header
            }
            
            try {
                // Split CSV line handling quoted fields
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                
                if (values.length >= 15) { // Ensure we have all required fields
                    // CSV format: objectid,dc_dist,psa,dispatch_date_time,dispatch_date,dispatch_time,hour,dc_key,location_block,ucr_general,text_general_code,point_x,point_y,lat,lng
                    Long objectId = parseLong(values[0]);
                    
                    // Skip if we already have this incident
                    if (objectId != null && incidentRepository.existsByObjectId(objectId)) {
                        continue;
                    }
                    
                    Incident incident = new Incident();
                    incident.setObjectId(objectId);
                    incident.setDcDistrict(cleanValue(values[1]));
                    incident.setPsa(cleanValue(values[2]));
                    
                    // Parse dispatch_date_time (format: 2024-12-31 23:53:00+00)
                    String dispatchDateTimeStr = cleanValue(values[3]);
                    if (dispatchDateTimeStr != null) {
                        try {
                            // Remove timezone info and parse
                            String cleanDateTime = dispatchDateTimeStr.replace("+00", "");
                            incident.setDispatchDateTime(LocalDateTime.parse(cleanDateTime, 
                                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                        } catch (Exception e) {
                            System.err.println("Error parsing date: " + dispatchDateTimeStr);
                        }
                    }
                    
                    incident.setDispatchDate(cleanValue(values[4]));
                    incident.setDispatchTime(cleanValue(values[5]));
                    incident.setHour(parseInt(values[6]));
                    incident.setLocationBlock(cleanValue(values[8]));
                    incident.setUcrGeneral(cleanValue(values[9]));
                    incident.setTextGeneralCode(cleanValue(values[10]));
                    
                    // Parse coordinates (lat, lng are at positions 13, 14)
                    incident.setLatitude(parseDouble(values[13]));
                    incident.setLongitude(parseDouble(values[14]));
                    
                    incidentRepository.save(incident);
                    processedCount++;
                }
            } catch (Exception e) {
                System.err.println("Error parsing CSV line: " + line);
                System.err.println("Error: " + e.getMessage());
            }
        }
        
        return processedCount;
    }

    private void createSampleData() {
        // Create sample data as fallback
        incidentRepository.deleteAll();
        
        for (int i = 1; i <= 100; i++) {
            Incident incident = new Incident();
            incident.setObjectId((long) i);
            incident.setDcDistrict("0" + ((i % 26) + 1));
            incident.setPsa("PSA" + ((i % 15) + 1));
            incident.setDispatchDateTime(LocalDateTime.now().minusDays(i % 30));
            incident.setDispatchDate("2024-12-" + String.format("%02d", (i % 28) + 1));
            incident.setDispatchTime(String.format("%02d:%02d", (i % 24), (i * 13) % 60));
            incident.setHour(i % 24);
            incident.setLocationBlock("Sample Block " + i);
            
            // Distribute among violent crime types (UCR 100-499)
            String[] ucrCodes = {"100", "200", "300", "400"}; // Homicide, Rape, Robbery, Aggravated Assault
            incident.setUcrGeneral(ucrCodes[i % 4]);
            
            String[] crimeTypes = {"Homicide", "Rape", "Robbery", "Aggravated Assault"};
            incident.setTextGeneralCode(crimeTypes[i % 4]);
            
            // Philadelphia coordinates range
            incident.setLatitude(39.9526 + (Math.random() - 0.5) * 0.2);
            incident.setLongitude(-75.1652 + (Math.random() - 0.5) * 0.2);
            
            incidentRepository.save(incident);
        }
        System.out.println("Created 100 sample incidents as fallback data");
    }

    private void createEnhancedSampleData() {
        // Create enhanced sample data as fallback
        incidentRepository.deleteAll();
        
        for (int i = 1; i <= 100; i++) {
            Incident incident = new Incident();
            incident.setObjectId((long) i);
            incident.setDcDistrict("0" + ((i % 26) + 1));
            incident.setPsa("PSA" + ((i % 15) + 1));
            incident.setDispatchDateTime(LocalDateTime.now().minusDays(i % 30));
            incident.setDispatchDate("2024-12-" + String.format("%02d", (i % 28) + 1));
            incident.setDispatchTime(String.format("%02d:%02d", (i % 24), (i * 13) % 60));
            incident.setHour(i % 24);
            incident.setLocationBlock("Sample Block " + i);
            
            // Distribute among violent crime types (UCR 100-499)
            String[] ucrCodes = {"100", "200", "300", "400"}; // Homicide, Rape, Robbery, Aggravated Assault
            incident.setUcrGeneral(ucrCodes[i % 4]);
            
            String[] crimeTypes = {"Homicide", "Rape", "Robbery", "Aggravated Assault"};
            incident.setTextGeneralCode(crimeTypes[i % 4]);
            
            // Philadelphia coordinates range
            incident.setLatitude(39.9526 + (Math.random() - 0.5) * 0.2);
            incident.setLongitude(-75.1652 + (Math.random() - 0.5) * 0.2);
            
            incidentRepository.save(incident);
        }
        System.out.println("Created 100 enhanced sample incidents as fallback data");
    }

    // Helper methods for parsing
    private String cleanValue(String value) {
        if (value == null) return null;
        value = value.trim();
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1);
        }
        return value.isEmpty() ? null : value;
    }

    private Long parseLong(String value) {
        String cleaned = cleanValue(value);
        if (cleaned == null || cleaned.isEmpty()) return null;
        try {
            return Long.parseLong(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseInt(String value) {
        String cleaned = cleanValue(value);
        if (cleaned == null || cleaned.isEmpty()) return null;
        try {
            return Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        String cleaned = cleanValue(value);
        if (cleaned == null || cleaned.isEmpty()) return null;
        try {
            return Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Existing methods remain the same...
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public IncidentStats getIncidentStats() {
        List<Incident> incidents = incidentRepository.findAll();
        
        long homicides = incidents.stream().filter(i -> i.getUcrGeneral() != null && i.getUcrGeneral().startsWith("1")).count();
        long rapes = incidents.stream().filter(i -> i.getUcrGeneral() != null && i.getUcrGeneral().startsWith("2")).count();
        long robberies = incidents.stream().filter(i -> i.getUcrGeneral() != null && i.getUcrGeneral().startsWith("3")).count();
        long aggravatedAssaults = incidents.stream().filter(i -> i.getUcrGeneral() != null && i.getUcrGeneral().startsWith("4")).count();
        
        return new IncidentStats(
            incidents.size(),
            (int) homicides,
            (int) rapes,
            (int) robberies,
            (int) aggravatedAssaults
        );
    }

    public List<Incident> getIncidentsByCrimeType(int ucrGeneral) {
        String ucrString = String.valueOf(ucrGeneral);
        return incidentRepository.findAll().stream()
                .filter(incident -> incident.getUcrGeneral() != null && incident.getUcrGeneral().equals(ucrString))
                .collect(Collectors.toList());
    }

    public List<Incident> getIncidentsByYear(int year) {
        return incidentRepository.findAll().stream()
                .filter(incident -> incident.getDispatchDateTime() != null && incident.getDispatchDateTime().getYear() == year)
                .collect(Collectors.toList());
    }

    public List<Incident> getIncidentsSortedByYear() {
        return incidentRepository.findAll().stream()
                .filter(incident -> incident.getDispatchDateTime() != null)
                .sorted((a, b) -> a.getDispatchDateTime().compareTo(b.getDispatchDateTime()))
                .collect(Collectors.toList());
    }

    public List<Incident> getIncidentsbyAddress(String address) {
        return incidentRepository.getIncidentsbyAddress(address);
    }

    public Incident getIncident(long incidentID) {
        return incidentRepository.findById(incidentID).orElse(null);
    }

    public List<Incident> getIncidentsYearCrimeType(int year, int ucrGeneral) {
        return incidentRepository.getIncidentsYearCrimeType(year, ucrGeneral);
    }
}
