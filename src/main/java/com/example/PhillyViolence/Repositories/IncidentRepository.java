package com.example.PhillyViolence.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.example.PhillyViolence.Models.Incident;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Optional<Incident> findByObjectId(Long objectId);
    boolean existsByObjectId(Long objectId);
    
    @Query("SELECT i FROM Incident i WHERE " +
    "LOWER(i.locationBlock) LIKE LOWER(CONCAT('%', :address, '%')) ")
    List<Incident> getIncidentsbyAddress(@Param("address") String address);

    @Modifying
    @Transactional
    @Query("DELETE FROM Incident i WHERE YEAR(i.dispatchDateTime) = :year")
    int deleteByDispatchDateTimeYear(@Param("year") int year);
}


