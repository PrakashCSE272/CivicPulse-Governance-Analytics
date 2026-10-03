package com.example.civicpulsebackend.welfare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private double allocated;
    private double utilized;
    private int utilizedPercent;
}