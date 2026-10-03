package com.example.civicpulsebackend.citizen.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
public class Grievance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int totalFiled;
    private int resolvedPercent;
    private int mttrHours;
}