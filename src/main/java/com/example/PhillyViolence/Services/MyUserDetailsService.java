package com.example.PhillyViolence.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.PhillyViolence.Models.UserPrincipal;
import com.example.PhillyViolence.Models.Users;
import com.example.PhillyViolence.Repositories.UserRepo;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo repo;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user1 = repo.findbyUsername(username);

        if (user1 == null) {
            throw new UsernameNotFoundException("User not found");
        }

        return new UserPrincipal(user1);
    }
}
