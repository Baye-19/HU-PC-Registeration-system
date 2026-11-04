package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.VerificationDtos;
import edu.hu.campusguard.entity.GateEntity;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.SecurityEventEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ConflictException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.GateRepository;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GateMovementService {

    private final LaptopRepository laptopRepository;
    private final GateRepository gateRepository;
    private final SecurityEventRepository eventRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public synchronized VerificationDtos.SecurityEventDto recordMovement(
            VerificationDtos.MovementRecordRequest req,
            String officerId, String officerName, String officerRole) {

        LaptopEntity laptop = laptopRepository.findById(req.getLaptopId())
                .or(() -> laptopRepository.findByPcId(req.getLaptopId()))
                .orElseThrow(() -> new ResourceNotFoundException("Laptop asset not found: " + req.getLaptopId()));

        // Prevent movement of restricted or lost laptops
        if ("REPORTED_LOST".equalsIgnoreCase(laptop.getSecurityStatus()) || "RESTRICTED".equalsIgnoreCase(laptop.getSecurityStatus())) {
            throw new BadRequestException("MOVEMENT BLOCKED: Device " + laptop.getPcId() + " is flagged as STOLEN/RESTRICTED. Detain at gate.");
        }

        GateEntity gate = gateRepository.findById(req.getGateId())
                .or(() -> gateRepository.findByCode(req.getGateId()))
                .orElse(null);

        String gateName = gate != null ? gate.getName() : "Main Campus Gate (North)";
        String gateId = gate != null ? gate.getId() : "gate-1";

        String reqMovement = req.getMovementType().toUpperCase(); // IN or OUT
        String currentStatus = laptop.getCurrentMovementStatus();

        // Consecutive movement anomaly conflict check
        boolean isConflict = false;
        if ("IN".equals(reqMovement) && "IN".equals(currentStatus)) {
            isConflict = true;
        } else if ("OUT".equals(reqMovement) && "OUT".equals(currentStatus)) {
            isConflict = true;
        }

        if (isConflict && !Boolean.TRUE.equals(req.getOverrideConflict())) {
            throw new ConflictException("CONSECUTIVE MOVEMENT CONFLICT: Laptop is currently registered as " + currentStatus +
                    ". Double-" + reqMovement + " transition requires authorized officer override confirmation.");
        }

        // Apply state transition
        laptop.setCurrentMovementStatus(reqMovement);
        laptop.setLastMovementDate(OffsetDateTime.now());
        laptop.setLastMovementGate(gateName);
        laptop.setLastMovementOfficer(officerName);
        laptopRepository.save(laptop);

        // Record auditable gate security event
        SecurityEventEntity event = SecurityEventEntity.builder()
                .id("evt-" + UUID.randomUUID().toString())
                .laptopId(laptop.getId())
                .pcId(laptop.getPcId())
                .studentName(laptop.getStudentName())
                .studentIdNumber(laptop.getStudentIdNumber())
                .brand(laptop.getBrand())
                .model(laptop.getModel())
                .serialNumber(laptop.getSerialNumber())
                .gateId(gateId)
                .gateName(gateName)
                .officerId(officerId)
                .officerName(officerName)
                .movementType(reqMovement)
                .verificationMethod(req.getVerificationMethod() != null ? req.getVerificationMethod() : "QR_SCAN")
                .verificationResult(req.getVerificationResult() != null ? req.getVerificationResult() : "GRANTED")
                .notes(req.getNotes() != null ? req.getNotes() : (isConflict ? "Officer overridden consecutive transition." : "Standard gate clearance."))
                .timestamp(OffsetDateTime.now())
                .build();

        SecurityEventEntity saved = eventRepository.save(event);

        auditLogService.record(officerId, officerName, officerRole,
                "GATE_MOVEMENT_RECORDED", "Laptop", laptop.getPcId(),
                "SUCCESS", reqMovement + " transition cleared at " + gateName, "127.0.0.1");

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<VerificationDtos.SecurityEventDto> getRecentEvents() {
        return eventRepository.findTop100ByOrderByTimestampDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VerificationDtos.SecurityEventDto toDto(SecurityEventEntity e) {
        return VerificationDtos.SecurityEventDto.builder()
                .id(e.getId())
                .laptopId(e.getLaptopId())
                .pcId(e.getPcId())
                .studentName(e.getStudentName())
                .studentIdNumber(e.getStudentIdNumber())
                .brand(e.getBrand())
                .model(e.getModel())
                .serialNumber(e.getSerialNumber())
                .gateId(e.getGateId())
                .gateName(e.getGateName())
                .officerId(e.getOfficerId())
                .officerName(e.getOfficerName())
                .movementType(e.getMovementType())
                .verificationMethod(e.getVerificationMethod())
                .verificationResult(e.getVerificationResult())
                .notes(e.getNotes())
                .timestamp(e.getTimestamp().toString())
                .build();
    }
}
