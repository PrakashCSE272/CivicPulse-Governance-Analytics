package com.example.civicpulsebackend.welfare.controller;   // match Revenue's package

import com.example.civicpulsebackend.welfare.entity.Budget;   // match Budget.java's package
import com.example.civicpulsebackend.welfare.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetRepository repository;

    @GetMapping
    public List<Budget> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Budget create(@RequestBody Budget entity) {
        return repository.save(entity);
    }
        @DeleteMapping("/{id}")
    public void delete(@PathVariable java.util.UUID id) {
        repository.deleteById(id);
    }
}
