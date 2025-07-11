package com.example.PhillyViolence.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long objectId;

    private String dcDistrict;
    private String psa;
    private LocalDateTime dispatchDateTime;
    private String dispatchDate;
    private String dispatchTime;
    
    @Column(name = "\"hour\"")
    private Integer hour;
    
    private Long dcKey;
    
    @Column(length = 500)
    private String locationBlock;
    
    private String ucrGeneral;
    
    @Column(length = 200)
    private String textGeneralCode;
    
    private Double pointX;
    private Double pointY;
    private Double latitude;
    private Double longitude;
}

