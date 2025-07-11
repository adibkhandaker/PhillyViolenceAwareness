package com.example.PhillyViolence.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IncidentStats {
    private int totalIncidents;
    private int homicides;
    private int rapes;
    private int robberies;
    private int aggravatedAssaults;
} 