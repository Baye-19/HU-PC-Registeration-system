package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.LaptopDto;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.LaptopRegistrationEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.LaptopRegistrationRepository;
import edu.hu.campusguard.repository.LaptopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LaptopApprovalService {

    private final LaptopRegistrationRepository registrationRepository;
    private final LaptopRepository laptopRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public synchronized LaptopDto approveRegistration(String registrationId, String officerId, String officerName, String officerRole) {
        LaptopRegistrationEntity reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Laptop registration not found: " + registrationId));

        if (!"PENDING".equals(reg.getStatus())) {
            throw new BadRequestException("Registration cannot be approved because status is: " + reg.getStatus());
        }

        // Generate next sequential atomic PC ID: e.g. CG-LPT-000004
        Integer maxSeq = laptopRepository.findMaxPcIdSequence();
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
        String pcId = String.format("CG-LPT-%06d", nextSeq);

        // Generate opaque unguessable cryptographic QR token
        String qrToken = "HU-QR-" + UUID.randomUUID().toString();

        LaptopEntity laptop = LaptopEntity.builder()
                .id("lpt-" + UUID.randomUUID().toString())
                .pcId(pcId)
                .registrationId(reg.getId())
                .studentId(reg.getStudentId())
                .studentName(reg.getStudentName())
                .studentNameAmharic(reg.getStudentNameAmharic())
                .studentIdNumber(reg.getStudentIdNumber())
                .department(reg.getDepartment())
                .faculty(reg.getFaculty())
                .ownerPhone(reg.getOwnerPhone())
                .studentPhotoUrl(reg.getStudentPhotoUrl())
                .brand(reg.getBrand())
                .model(reg.getModel())
                .serialNumber(reg.getSerialNumber())
                .deviceType(reg.getDeviceType())
                .processor(reg.getProcessor())
                .ram(reg.getRam())
                .storage(reg.getStorage())
                .os(reg.getOs())
                .color(reg.getColor())
                .physicalDescription(reg.getPhysicalDescription())
                .status("APPROVED")
                .securityStatus("NORMAL")
                .qrToken(qrToken)
                .currentMovementStatus("OUT")
                .createdAt(OffsetDateTime.now())
                .build();

        LaptopEntity savedLaptop = laptopRepository.save(laptop);

        // Update registration record
        reg.setStatus("APPROVED");
        reg.setPcId(pcId);
        reg.setReviewedByOfficerId(officerId);
        reg.setReviewedByOfficerName(officerName);
        reg.setReviewDate(OffsetDateTime.now());
        registrationRepository.save(reg);

        auditLogService.record(officerId, officerName, officerRole,
                "REGISTRATION_APPROVED", "Laptop", savedLaptop.getId(),
                "SUCCESS", "Approved registration for " + reg.getStudentName() + ". Assigned PC ID: " + pcId, "127.0.0.1");

        return toDto(savedLaptop);
    }

    public LaptopDto toDto(LaptopEntity l) {
        return LaptopDto.builder()
                .id(l.getId())
                .pcId(l.getPcId())
                .registrationId(l.getRegistrationId())
                .studentId(l.getStudentId())
                .studentName(l.getStudentName())
                .studentNameAmharic(l.getStudentNameAmharic())
                .studentIdNumber(l.getStudentIdNumber())
                .department(l.getDepartment())
                .faculty(l.getFaculty())
                .ownerPhone(l.getOwnerPhone())
                .studentPhotoUrl(l.getStudentPhotoUrl())
                .brand(l.getBrand())
                .model(l.getModel())
                .serialNumber(l.getSerialNumber())
                .deviceType(l.getDeviceType())
                .processor(l.getProcessor())
                .ram(l.getRam())
                .storage(l.getStorage())
                .os(l.getOs())
                .color(l.getColor())
                .physicalDescription(l.getPhysicalDescription())
                .status(l.getStatus())
                .securityStatus(l.getSecurityStatus())
                .qrToken(l.getQrToken())
                .currentMovementStatus(l.getCurrentMovementStatus())
                .lastMovementDate(l.getLastMovementDate() != null ? l.getLastMovementDate().toString() : null)
                .lastMovementGate(l.getLastMovementGate())
                .lastMovementOfficer(l.getLastMovementOfficer())
                .createdAt(l.getCreatedAt().toString())
                .build();
    }
}
