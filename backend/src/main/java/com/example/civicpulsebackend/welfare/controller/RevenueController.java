package com.example.civicpulsebackend.welfare.controller;

import com.example.civicpulsebackend.welfare.entity.Revenue;
import com.example.civicpulsebackend.welfare.repository.RevenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    @Autowired
    private RevenueRepository repository;

    @GetMapping
    public List<Revenue> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Revenue create(@RequestBody Revenue entity) {
        return repository.save(entity);
    }
}