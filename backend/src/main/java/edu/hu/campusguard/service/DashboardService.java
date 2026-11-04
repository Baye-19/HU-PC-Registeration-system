package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.DashboardStatsDto;
import edu.hu.campusguard.repository.AlertRepository;
import edu.hu.campusguard.repository.LaptopRegistrationRepository;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.SecurityEventRepository;
import edu.hu.campusguard.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final LaptopRepository laptopRepository;
    private final LaptopRegistrationRepository registrationRepository;
    private final SecurityEventRepository eventRepository;
    private final AlertRepository alertRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long totalStudents = studentRepository.count();
        long totalLaptops = laptopRepository.count();
        long pendingRegs = registrationRepository.findByStatus("PENDING").size();
        long approvedRegs = registrationRepository.findByStatus("APPROVED").size();
        long rejectedRegs = registrationRepository.findByStatus("REJECTED").size();
        long totalMovements = eventRepository.count();
        long activeAlerts = alertRepository.findByActiveTrueOrderByCreatedAtDesc().size();
        long inside = laptopRepository.countByCurrentMovementStatus("IN");
        long outside = laptopRepository.countByCurrentMovementStatus("OUT");

        return DashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .totalLaptops(totalLaptops)
                .pendingRegistrations(pendingRegs)
                .approvedRegistrations(approvedRegs)
                .rejectedRegistrations(rejectedRegs)
                .totalMovements(totalMovements)
                .activeGateMovementsToday(totalMovements)
                .activeStolenAlerts(activeAlerts)
                .currentlyInsideCampus(inside)
                .currentlyOutsideCampus(outside)
                .build();
    }
}
