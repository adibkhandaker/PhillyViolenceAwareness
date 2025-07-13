package com.example.PhillyViolence.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.PhillyViolence.Models.Incident;
import com.example.PhillyViolence.Services.IncidentService;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        List<Incident> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/crime-type/{ucrGeneral}")
    public ResponseEntity<List<Incident>> getIncidentsByCrimeType(@PathVariable String ucrGeneral) {
        List<Incident> incidents = incidentService.getIncidentsByCrimeType(Integer.parseInt(ucrGeneral));
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/address/{address}")
    public ResponseEntity<List<Incident>> getIncidentsbyAddress(@PathVariable String address) {
        List<Incident> incidents = incidentService.getIncidentsbyAddress(address);
        return new ResponseEntity<>(incidents, HttpStatus.OK);
    }

    @GetMapping("/by-year/{year}")
    public ResponseEntity<List<Incident>> getIncidentsByYear(@PathVariable int year) {
        List<Incident> incidents = incidentService.getIncidentsByYear(year);
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/sorted-by-year")
    public ResponseEntity<List<Incident>> getIncidentsSortedByYear() {
        List<Incident> incidents = incidentService.getIncidentsSortedByYear();
        return ResponseEntity.ok(incidents);
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refreshIncidentData() {
        String result = incidentService.refreshIncidentData();
        if (result.startsWith("Error")) {
            return ResponseEntity.internalServerError().body(result);
        } else {
            return ResponseEntity.ok(result);
        }
    }

    @PostMapping("/refresh/force")
    public ResponseEntity<String> forceRefreshAllData() {
        String result = incidentService.refreshIncidentData(true);
        if (result.startsWith("Error")) {
            return ResponseEntity.internalServerError().body(result);
        } else {
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<IncidentStats> getIncidentStats() {
        List<Incident> allIncidents = incidentService.getAllIncidents();
        
        long totalViolentCrimes = allIncidents.size();
        long homicides = allIncidents.stream().filter(i -> "100".equals(i.getUcrGeneral())).count();
        long rapes = allIncidents.stream().filter(i -> "200".equals(i.getUcrGeneral())).count();
        long robberies = allIncidents.stream().filter(i -> "300".equals(i.getUcrGeneral())).count();
        long assaults = allIncidents.stream().filter(i -> "400".equals(i.getUcrGeneral())).count();
        
        IncidentStats stats = new IncidentStats(totalViolentCrimes, homicides, rapes, robberies, assaults);
        return ResponseEntity.ok(stats);
    }

    private boolean isViolentCrime(String ucrGeneral) {
        if (ucrGeneral == null) return false;
        // Philadelphia UCR violent crimes: 100=Homicide, 200=Rape, 300=Robbery, 400=Aggravated Assault
        return ucrGeneral.equals("100") || ucrGeneral.equals("200") || 
               ucrGeneral.equals("300") || ucrGeneral.equals("400");
    }

    public static class IncidentStats {
        public final long totalViolentCrimes;
        public final long homicides;
        public final long rapes;
        public final long robberies;
        public final long assaults;

        public IncidentStats(long totalViolentCrimes, long homicides, long rapes, long robberies, long assaults) {
            this.totalViolentCrimes = totalViolentCrimes;
            this.homicides = homicides;
            this.rapes = rapes;
            this.robberies = robberies;
            this.assaults = assaults;
        }
    }
}
