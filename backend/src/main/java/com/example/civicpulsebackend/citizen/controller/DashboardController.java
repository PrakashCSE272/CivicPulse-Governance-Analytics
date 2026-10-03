package com.example.civicpulsebackend.citizen.controller;

import com.example.civicpulsebackend.citizen.repository.*;
import com.example.civicpulsebackend.welfare.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final WorkflowRepository workflowRepository;
    private final RevenueRepository revenueRepository;
    private final BudgetRepository budgetRepository;
    private final DepartmentRepository departmentRepository;
    private final CitizenSatisfactionRepository citizenSatisfactionRepository;
    private final GrievanceRepository grievanceRepository;

    public DashboardController(WorkflowRepository workflowRepository,
                               RevenueRepository revenueRepository,
                               BudgetRepository budgetRepository,
                               DepartmentRepository departmentRepository,
                               CitizenSatisfactionRepository citizenSatisfactionRepository,
                               GrievanceRepository grievanceRepository) {
        this.workflowRepository = workflowRepository;
        this.revenueRepository = revenueRepository;
        this.budgetRepository = budgetRepository;
        this.departmentRepository = departmentRepository;
        this.citizenSatisfactionRepository = citizenSatisfactionRepository;
        this.grievanceRepository = grievanceRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        Map<String, Object> cards = new LinkedHashMap<>();
        Map<String, Object> services = new LinkedHashMap<>();
        Map<String, Object> grievances = new LinkedHashMap<>();
        Map<String, Object> revenue = new LinkedHashMap<>();
        Map<String, Object> budget = new LinkedHashMap<>();
        Map<String, Object> trends = new LinkedHashMap<>();

        var workflows = workflowRepository.findAll();
        if (!workflows.isEmpty()) {
            var w = workflows.stream()
        .max(Comparator.comparingDouble(x -> x.getTotalRequests()))
        .get();
            services.put("requests", w.getTotalRequests());
            services.put("resolvedPercent", w.getResolvedPercent());
            services.put("avgDays", w.getAvgResolutionDays());
            cards.put("serviceSla", w.getResolvedPercent());
        }

        var grievanceList = grievanceRepository.findAll();
        if (!grievanceList.isEmpty()) {
            var g = grievanceList.get(0);
            grievances.put("filed", g.getTotalFiled());
            grievances.put("resolvedPercent", g.getResolvedPercent());
            grievances.put("mttrHours", g.getMttrHours());
        }

        var revenues = revenueRepository.findAll();
        if (!revenues.isEmpty()) {
            var r = revenues.get(0);
            revenue.put("total", r.getTotalRevenue());
            revenue.put("propertyTaxPercent", r.getPropertyTaxPercent());
            revenue.put("licensesPercent", r.getLicensesPercent());
            cards.put("revenueCollected", r.getTotalRevenue());
        }

        var budgets = budgetRepository.findAll();
        if (!budgets.isEmpty()) {
            var b = budgets.get(0);
            budget.put("allocated", b.getAllocated());
            budget.put("utilized", b.getUtilized());
            budget.put("utilizedPercent", b.getUtilizedPercent());
        }

        var satisfaction = citizenSatisfactionRepository.findAll();
        if (!satisfaction.isEmpty()) {
            var c = satisfaction.get(0);
            cards.put("citizenSatisfaction", c.getRating());
            trends.put("complaintsDownPercent", c.getComplaintsDownPercent());
            trends.put("servicesUpPercent", c.getServicesUpPercent());
        }

        List<Map<String, Object>> departments = departmentRepository.findAll().stream()
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", d.getName());
                    m.put("performance", d.getPerformancePercent());
                    return m;
                })
                .toList();

        summary.put("cards", cards);
        summary.put("services", services);
        summary.put("grievances", grievances);
        summary.put("revenue", revenue);
        summary.put("budget", budget);
        summary.put("departments", departments);
        summary.put("trends", trends);
        return summary;
    }
}
