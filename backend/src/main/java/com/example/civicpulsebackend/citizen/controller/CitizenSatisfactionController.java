package com.example.civicpulsebackend.citizen.controller;

import com.example.civicpulsebackend.citizen.entity.CitizenSatisfaction;
import com.example.civicpulsebackend.citizen.repository.CitizenSatisfactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/citizen-satisfaction")
public class CitizenSatisfactionController {

    @Autowired
    private CitizenSatisfactionRepository repository;

    @GetMapping
    public List<CitizenSatisfaction> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public CitizenSatisfaction create(@RequestBody CitizenSatisfaction entity) {
        return repository.save(entity);
    }
}
