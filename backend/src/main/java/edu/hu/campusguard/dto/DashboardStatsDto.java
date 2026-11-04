package edu.hu.campusguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalStudents;
    private long totalLaptops;
    private long pendingRegistrations;
    private long approvedRegistrations;
    private long rejectedRegistrations;
    private long activeGateMovementsToday;
    private long activeStolenAlerts;
    private long totalMovements;
    private long currentlyInsideCampus;
    private long currentlyOutsideCampus;
}
