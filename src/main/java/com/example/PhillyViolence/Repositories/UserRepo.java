package com.example.PhillyViolence.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.PhillyViolence.Models.Users;

@Repository
public interface UserRepo extends JpaRepository<Users, Integer> {


    @Query("SELECT u FROM Users u WHERE " +
        "LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    public Users findbyUsername(String username);

}

