package com.example.PhillyViolence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PhillyViolenceApplication {

	public static void main(String[] args) {
		// Debug: Print environment variables
		System.out.println("=== Environment Variables Debug ===");
		System.out.println("MYSQLHOST: " + System.getenv("MYSQLHOST"));
		System.out.println("MYSQLPORT: " + System.getenv("MYSQLPORT"));
		System.out.println("MYSQLDATABASE: " + System.getenv("MYSQLDATABASE"));
		System.out.println("MYSQLUSER: " + System.getenv("MYSQLUSER"));
		System.out.println("MYSQLPASSWORD: " + (System.getenv("MYSQLPASSWORD") != null ? "***SET***" : "NULL"));
		System.out.println("==================================");
		
		SpringApplication.run(PhillyViolenceApplication.class, args);
	}

}
