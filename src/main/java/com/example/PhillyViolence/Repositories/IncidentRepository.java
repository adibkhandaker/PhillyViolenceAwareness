package com.example.PhillyViolence.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.PhillyViolence.Models.Incident;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Optional<Incident> findByObjectId(Long objectId);
    boolean existsByObjectId(Long objectId);
}
