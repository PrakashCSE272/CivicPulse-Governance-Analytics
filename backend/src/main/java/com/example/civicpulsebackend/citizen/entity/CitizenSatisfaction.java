package com.example.civicpulsebackend.citizen.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
public class CitizenSatisfaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private double rating;
    private int complaintsDownPercent;
    private int servicesUpPercent;
}