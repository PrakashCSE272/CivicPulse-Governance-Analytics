package com.example.civicpulsebackend.welfare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
public class Revenue {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private double totalRevenue;
    private int propertyTaxPercent;
    private int licensesPercent;
}