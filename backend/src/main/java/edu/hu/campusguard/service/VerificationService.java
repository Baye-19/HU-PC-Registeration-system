package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.StudentDto;
import edu.hu.campusguard.dto.VerificationDtos;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final LaptopRepository laptopRepository;
    private final StudentRepository studentRepository;
    private final LaptopApprovalService laptopApprovalService;
    private final StudentService studentService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public VerificationDtos.VerificationResponseDto verifyDevice(VerificationDtos.VerifyRequest req, String officerId, String officerName, String officerRole) {
        String token = req.getToken();
        String pcId = req.getPcId();
        String serialNumber = req.getSerialNumber();

        Optional<LaptopEntity> laptopOpt = Optional.empty();
        String verificationMethod = "MANUAL_ENTRY";

        if (token != null && !token.isBlank()) {
            verificationMethod = "QR_SCAN";
            laptopOpt = laptopRepository.findByQrToken(token.trim());
            if (laptopOpt.isEmpty()) {
                // Check if token was in format pcId:serial
                if (token.contains(":")) {
                    String[] parts = token.split(":", 2);
                    laptopOpt = laptopRepository.findByPcId(parts[0]);
                }
            }
        }

        if (laptopOpt.isEmpty() && pcId != null && !pcId.isBlank()) {
            laptopOpt = laptopRepository.findByPcId(pcId.trim().toUpperCase());
        }

        if (laptopOpt.isEmpty() && serialNumber != null && !serialNumber.isBlank()) {
            laptopOpt = laptopRepository.findBySerialNumber(serialNumber.trim().toUpperCase());
        }

        List<String> warnings = new ArrayList<>();

        if (laptopOpt.isEmpty()) {
            auditLogService.record(officerId, officerName, officerRole,
                    "GATE_VERIFICATION_FAILED", "Verification", token != null ? token : (pcId != null ? pcId : serialNumber),
                    "FAILURE", "Unrecognized QR token or hardware credential presented at gate", "127.0.0.1");

            return VerificationDtos.VerificationResponseDto.builder()
                    .verified(false)
                    .verificationMethod(verificationMethod)
                    .verificationResult("DENIED")
                    .recommendedAction("DENY_PASSAGE")
                    .message("UNRECOGNIZED ASSET: This hardware is NOT registered in Hawassa University database. Detain at gate until ownership is proven.")
                    .warnings(List.of("Unregistered hardware attempting campus gate crossing."))
                    .build();
        }

        LaptopEntity laptop = laptopOpt.get();

        // Check if student profile exists
        StudentEntity student = studentRepository.findById(laptop.getStudentId())
                .or(() -> studentRepository.findByStudentId(laptop.getStudentIdNumber()))
                .orElse(null);

        StudentDto studentDto = student != null ? studentService.toDto(student) : null;

        // Check 1: Restricted or Reported Stolen
        if ("REPORTED_LOST".equalsIgnoreCase(laptop.getSecurityStatus()) || "RESTRICTED".equalsIgnoreCase(laptop.getSecurityStatus())) {
            auditLogService.record(officerId, officerName, officerRole,
                    "SECURITY_ALERT_TRIGGERED", "Laptop", laptop.getPcId(),
                    "FAILURE", "STOLEN ASSET INTERCEPTED AT GATE! S/N: " + laptop.getSerialNumber(), "127.0.0.1");

            return VerificationDtos.VerificationResponseDto.builder()
                    .verified(false)
                    .verificationMethod(verificationMethod)
                    .verificationResult("FLAGGED")
                    .laptop(laptopApprovalService.toDto(laptop))
                    .student(studentDto)
                    .recommendedAction("DETAIN_AND_NOTIFY")
                    .message("SECURITY ALERT: This laptop is flagged as STOLEN / RESTRICTED! Detain person and device immediately. Campus Police Union notified.")
                    .warnings(List.of("FLAGGED AS STOLEN IN HAWASSA UNIVERSITY SECURITY REGISTRY", "Detain carrier immediately and call Security Dispatch."))
                    .build();
        }

        // Check 2: Unapproved or Revoked
        if (!"APPROVED".equalsIgnoreCase(laptop.getStatus())) {
            return VerificationDtos.VerificationResponseDto.builder()
                    .verified(false)
                    .verificationMethod(verificationMethod)
                    .verificationResult("DENIED")
                    .laptop(laptopApprovalService.toDto(laptop))
                    .student(studentDto)
                    .recommendedAction("DENY_PASSAGE")
                    .message("REGISTRATION NOT APPROVED: Hardware asset status is " + laptop.getStatus() + ". Entry/Exit denied.")
                    .warnings(List.of("Asset is not in APPROVED status."))
                    .build();
        }

        // Success: Legitimate registered device
        return VerificationDtos.VerificationResponseDto.builder()
                .verified(true)
                .verificationMethod(verificationMethod)
                .verificationResult("GRANTED")
                .laptop(laptopApprovalService.toDto(laptop))
                .student(studentDto)
                .recommendedAction("PERMIT_PASSAGE")
                .message("AUTHORIZED: Verified Hawassa University student asset. Clearance granted.")
                .warnings(warnings)
                .build();
    }
}
