package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.LaptopDto;
import edu.hu.campusguard.dto.LaptopRegistrationDtos;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.LaptopRegistrationEntity;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ConflictException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.LaptopRegistrationRepository;
import edu.hu.campusguard.repository.LaptopRepository;
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
public class LaptopRegistrationService {

    private final LaptopRegistrationRepository registrationRepository;
    private final LaptopRepository laptopRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public LaptopRegistrationDtos.LaptopRegistrationDto createRegistration(
            LaptopRegistrationDtos.LaptopRegistrationRequest req,
            String actorId, String actorName, String actorRole) {

        String cleanSerial = req.getSerialNumber().trim().toUpperCase();

        // Duplicate serial check
        if (laptopRepository.existsBySerialNumber(cleanSerial)) {
            throw new ConflictException("Hardware conflict: Serial Number " + cleanSerial + " is already permanently registered to an active laptop asset.");
        }

        // Duplicate pending registration check
        registrationRepository.findBySerialNumber(cleanSerial).ifPresent(r -> {
            if ("PENDING".equals(r.getStatus())) {
                throw new ConflictException("Hardware serial number " + cleanSerial + " already has a pending registration under review.");
            }
        });

        // Resolve student
        StudentEntity student = null;
        if (req.getStudentId() != null && !req.getStudentId().isBlank()) {
            student = studentRepository.findById(req.getStudentId())
                    .or(() -> studentRepository.findByStudentId(req.getStudentId()))
                    .orElse(null);
        }

        String studentId = student != null ? student.getId() : (req.getStudentId() != null ? req.getStudentId() : actorId);
        String studentName = student != null ? student.getFullName() : (req.getStudentName() != null ? req.getStudentName() : actorName);
        String studentIdNumber = student != null ? student.getStudentId() : (req.getStudentIdNumber() != null ? req.getStudentIdNumber() : "HU/N/A");
        String department = student != null ? student.getDepartmentName() : (req.getDepartment() != null ? req.getDepartment() : "General Studies");
        String faculty = student != null ? student.getFacultyName() : (req.getFaculty() != null ? req.getFaculty() : "Hawassa University");
        String photoUrl = req.getStudentPhotoUrl() != null ? req.getStudentPhotoUrl() : (student != null ? student.getPhotoUrl() : null);
        String amharicName = req.getStudentNameAmharic() != null ? req.getStudentNameAmharic() : (student != null ? student.getStudentNameAmharic() : null);
        String phone = req.getOwnerPhone() != null ? req.getOwnerPhone() : (student != null ? student.getPhone() : null);

        LaptopRegistrationEntity reg = LaptopRegistrationEntity.builder()
                .id("reg-" + UUID.randomUUID().toString())
                .studentId(studentId)
                .studentName(studentName)
                .studentNameAmharic(amharicName)
                .studentIdNumber(studentIdNumber)
                .department(department)
                .faculty(faculty)
                .ownerPhone(phone)
                .studentPhotoUrl(photoUrl)
                .brand(req.getBrand().trim())
                .model(req.getModel().trim())
                .serialNumber(cleanSerial)
                .deviceType(req.getDeviceType() != null ? req.getDeviceType() : "Laptop")
                .processor(req.getProcessor())
                .ram(req.getRam())
                .storage(req.getStorage())
                .os(req.getOs())
                .color(req.getColor())
                .physicalDescription(req.getPhysicalDescription())
                .status("PENDING")
                .submittedByRole(actorRole)
                .submittedByUserId(actorId)
                .registrationDate(OffsetDateTime.now())
                .build();

        LaptopRegistrationEntity saved = registrationRepository.save(reg);

        auditLogService.record(actorId, actorName, actorRole,
                "REGISTRATION_SUBMITTED", "LaptopRegistration", saved.getId(),
                "SUCCESS", "Submitted PC registration for " + saved.getBrand() + " " + saved.getModel() + " (S/N: " + cleanSerial + ")", "127.0.0.1");

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<LaptopRegistrationDtos.LaptopRegistrationDto> getRegistrations(String status, String actorId, String actorRole, String studentIdNumber) {
        List<LaptopRegistrationEntity> list;
        if (status != null && !status.isBlank()) {
            list = registrationRepository.findByStatus(status.toUpperCase());
        } else {
            list = registrationRepository.findAll();
        }

        // Students strictly restricted to their own submissions
        if ("STUDENT".equals(actorRole)) {
            list = list.stream()
                    .filter(r -> r.getSubmittedByUserId().equals(actorId) ||
                                 r.getStudentId().equals(actorId) ||
                                 (studentIdNumber != null && r.getStudentIdNumber().equalsIgnoreCase(studentIdNumber)))
                    .collect(Collectors.toList());
        }

        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public LaptopRegistrationDtos.LaptopRegistrationDto rejectRegistration(
            String id, String reason, String actorId, String actorName, String actorRole) {

        if (reason == null || reason.trim().isBlank()) {
            throw new BadRequestException("Rejection reason is strictly mandatory for security audit compliance.");
        }

        LaptopRegistrationEntity reg = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop registration not found: " + id));

        if (!"PENDING".equals(reg.getStatus())) {
            throw new BadRequestException("Cannot reject registration with current status: " + reg.getStatus());
        }

        reg.setStatus("REJECTED");
        reg.setRejectionReason(reason.trim());
        reg.setReviewedByOfficerId(actorId);
        reg.setReviewedByOfficerName(actorName);
        reg.setReviewDate(OffsetDateTime.now());

        LaptopRegistrationEntity saved = registrationRepository.save(reg);

        auditLogService.record(actorId, actorName, actorRole,
                "REGISTRATION_REJECTED", "LaptopRegistration", saved.getId(),
                "SUCCESS", "Rejected registration. Reason: " + reason.trim(), "127.0.0.1");

        return toDto(saved);
    }

    public LaptopRegistrationDtos.LaptopRegistrationDto toDto(LaptopRegistrationEntity r) {
        return LaptopRegistrationDtos.LaptopRegistrationDto.builder()
                .id(r.getId())
                .studentId(r.getStudentId())
                .studentName(r.getStudentName())
                .studentNameAmharic(r.getStudentNameAmharic())
                .studentIdNumber(r.getStudentIdNumber())
                .department(r.getDepartment())
                .faculty(r.getFaculty())
                .ownerPhone(r.getOwnerPhone())
                .studentPhotoUrl(r.getStudentPhotoUrl())
                .brand(r.getBrand())
                .model(r.getModel())
                .serialNumber(r.getSerialNumber())
                .deviceType(r.getDeviceType())
                .processor(r.getProcessor())
                .ram(r.getRam())
                .storage(r.getStorage())
                .os(r.getOs())
                .color(r.getColor())
                .physicalDescription(r.getPhysicalDescription())
                .status(r.getStatus())
                .submittedByRole(r.getSubmittedByRole())
                .submittedByUserId(r.getSubmittedByUserId())
                .reviewedByOfficerId(r.getReviewedByOfficerId())
                .reviewedByOfficerName(r.getReviewedByOfficerName())
                .reviewDate(r.getReviewDate() != null ? r.getReviewDate().toString() : null)
                .rejectionReason(r.getRejectionReason())
                .pcId(r.getPcId())
                .registrationDate(r.getRegistrationDate().toString())
                .build();
    }
}
