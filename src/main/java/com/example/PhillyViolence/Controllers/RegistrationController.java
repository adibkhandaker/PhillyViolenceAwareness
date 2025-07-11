package com.example.PhillyViolence.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.PhillyViolence.Models.Users;
import com.example.PhillyViolence.Services.RegistrationService;

@RestController
@CrossOrigin
@RequestMapping("/main")
public class RegistrationController {

    @Autowired
    RegistrationService service;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Users user) {
        service.register(user);
        return new ResponseEntity<>("Registered successfully", HttpStatus.OK);
    }

}
