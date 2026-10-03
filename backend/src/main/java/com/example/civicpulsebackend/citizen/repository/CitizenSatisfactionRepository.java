package com.example.civicpulsebackend.citizen.repository;

import com.example.civicpulsebackend.citizen.entity.CitizenSatisfaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CitizenSatisfactionRepository extends JpaRepository<CitizenSatisfaction, UUID> {
}
