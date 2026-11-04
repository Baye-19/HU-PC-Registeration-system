package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.AlertDtos;
import edu.hu.campusguard.dto.LostReportDtos;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.LostReportEntity;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.LostReportRepository;
import edu.hu.campusguard.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostReportService {

    private final LostReportRepository lostReportRepository;
    private final LaptopRepository laptopRepository;
    private final StudentRepository studentRepository;
    private final AlertService alertService;
    private final AuditLogService auditLogService;

    @Transactional
    public LostReportDtos.LostReportDto createReport(
            LostReportDtos.LostReportCreateRequest req,
            String actorId, String actorName, String actorRole) {

        LaptopEntity laptop = laptopRepository.findById(req.getLaptopId())
                .or(() -> laptopRepository.findByPcId(req.getLaptopId()))
                .orElseThrow(() -> new ResourceNotFoundException("Laptop asset not found: " + req.getLaptopId()));

        // Check student ownership if student reporting
        if ("STUDENT".equals(actorRole)) {
            StudentEntity student = studentRepository.findByUserId(actorId).orElse(null);
            String studentIdNumber = student != null ? student.getStudentId() : "";
            if (!laptop.getStudentId().equals(actorId) && !laptop.getStudentIdNumber().equalsIgnoreCase(studentIdNumber)) {
                throw new BadRequestException("Access denied: You can only report your own registered laptop asset.");
            }
        }

        OffsetDateTime incidentDate;
        try {
            incidentDate = OffsetDateTime.parse(req.getIncidentDate());
        } catch (Exception e) {
            incidentDate = OffsetDateTime.now();
        }

        LostReportEntity report = LostReportEntity.builder()
                .id("rep-" + UUID.randomUUID().toString())
                .laptopId(laptop.getId())
                .pcId(laptop.getPcId())
                .brand(laptop.getBrand())
                .model(laptop.getModel())
                .serialNumber(laptop.getSerialNumber())
                .reportingStudentId(laptop.getStudentId())
                .reportingStudentName(laptop.getStudentName())
                .studentIdNumber(laptop.getStudentIdNumber())
                .incidentType(req.getIncidentType())
                .incidentDate(incidentDate)
                .incidentLocation(req.getIncidentLocation())
                .description(req.getDescription())
                .contactPhone(req.getContactPhone())
                .status("SUBMITTED")
                .createdAt(OffsetDateTime.now())
                .build();

        // Flag laptop and broadcast alert
        laptop.setSecurityStatus("REPORTED_LOST");
        laptopRepository.save(laptop);

        LostReportEntity saved = lostReportRepository.save(report);

        // Broadcast alert
        alertService.createAlert(
                AlertDtos.AlertCreateRequest.builder()
                        .type("STOLEN_DEVICE")
                        .title("ALERT: Lost/Stolen Laptop [" + laptop.getPcId() + "]")
                        .message(laptop.getBrand() + " " + laptop.getModel() + " (S/N: " + laptop.getSerialNumber() + ") reported stolen at " + req.getIncidentLocation() + ". Detain at gates.")
                        .severity("HIGH")
                        .laptopId(laptop.getId())
                        .pcId(laptop.getPcId())
                        .lostReportId(saved.getId())
                        .build(),
                actorId, actorName, actorRole
        );

        auditLogService.record(actorId, actorName, actorRole,
                "LOST_REPORT_SUBMITTED", "LostReport", saved.getId(),
                "SUCCESS", "Reported stolen device PC ID: " + laptop.getPcId(), "127.0.0.1");

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LostReportDtos.LostReportDto> getReports(String actorId, String actorRole, String studentIdNumber) {
        List<LostReportEntity> reports = lostReportRepository.findAllByOrderByCreatedAtDesc();

        if ("STUDENT".equals(actorRole)) {
            reports = reports.stream()
                    .filter(r -> r.getReportingStudentId().equals(actorId) ||
                                 (studentIdNumber != null && r.getStudentIdNumber().equalsIgnoreCase(studentIdNumber)))
                    .collect(Collectors.toList());
        }

        return reports.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public LostReportDtos.LostReportDto reviewReport(
            String reportId, String status, String notes,
            String officerId, String officerName, String officerRole) {

        LostReportEntity report = lostReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus(status);
        report.setReviewedByOfficerId(officerId);
        report.setReviewedByOfficerName(officerName);
        report.setReviewNotes(notes);

        if ("RESOLVED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status)) {
            report.setResolvedAt(OffsetDateTime.now());
            LaptopEntity laptop = laptopRepository.findById(report.getLaptopId()).orElse(null);
            if (laptop != null && "NORMAL".equals(laptop.getSecurityStatus())) {
                laptop.setSecurityStatus("NORMAL");
                laptopRepository.save(laptop);
            }
        }

        LostReportEntity saved = lostReportRepository.save(report);

        auditLogService.record(officerId, officerName, officerRole,
                "LOST_REPORT_REVIEWED", "LostReport", saved.getId(),
                "SUCCESS", "Updated status to " + status + ". Notes: " + notes, "127.0.0.1");

        return toDto(saved);
    }

    @Transactional
    public LostReportDtos.LostReportDto resolveReport(
            String reportId, String notes,
            String officerId, String officerName, String officerRole) {

        LostReportEntity report = lostReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus("RESOLVED");
        report.setResolvedAt(OffsetDateTime.now());
        report.setReviewedByOfficerId(officerId);
        report.setReviewedByOfficerName(officerName);
        report.setReviewNotes(notes != null ? notes : "Recovered and cleared.");

        // Clear restriction on laptop
        LaptopEntity laptop = laptopRepository.findById(report.getLaptopId()).orElse(null);
        if (laptop != null) {
            laptop.setSecurityStatus("NORMAL");
            laptopRepository.save(laptop);
        }

        LostReportEntity saved = lostReportRepository.save(report);

        auditLogService.record(officerId, officerName, officerRole,
                "LOST_REPORT_RESOLVED", "LostReport", saved.getId(),
                "SUCCESS", "Report resolved, asset restored to NORMAL", "127.0.0.1");

        return toDto(saved);
    }

    public LostReportDtos.LostReportDto toDto(LostReportEntity r) {
        return LostReportDtos.LostReportDto.builder()
                .id(r.getId())
                .laptopId(r.getLaptopId())
                .pcId(r.getPcId())
                .brand(r.getBrand())
                .model(r.getModel())
                .serialNumber(r.getSerialNumber())
                .reportingStudentId(r.getReportingStudentId())
                .reportingStudentName(r.getReportingStudentName())
                .studentIdNumber(r.getStudentIdNumber())
                .incidentType(r.getIncidentType())
                .incidentDate(r.getIncidentDate().toString())
                .incidentLocation(r.getIncidentLocation())
                .description(r.getDescription())
                .contactPhone(r.getContactPhone())
                .status(r.getStatus())
                .reviewedByOfficerId(r.getReviewedByOfficerId())
                .reviewedByOfficerName(r.getReviewedByOfficerName())
                .reviewNotes(r.getReviewNotes())
                .createdAt(r.getCreatedAt().toString())
                .resolvedAt(r.getResolvedAt() != null ? r.getResolvedAt().toString() : null)
                .build();
    }
}
