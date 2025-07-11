package com.example.PhillyViolence.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.PhillyViolence.Models.Users;
import com.example.PhillyViolence.Repositories.UserRepo;

@Service
public class RegistrationService {

    @Autowired
    UserRepo repo;
    
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public void register(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
    }
}
