package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.LaptopDto;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.StudentRepository;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.AuditLogService;
import edu.hu.campusguard.service.LaptopApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/laptops")
@RequiredArgsConstructor
public class LaptopController {

    private final LaptopRepository laptopRepository;
    private final StudentRepository studentRepository;
    private final LaptopApprovalService laptopApprovalService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<List<LaptopDto>> getAllLaptops(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<LaptopEntity> laptops = laptopRepository.findAll();

        if ("STUDENT".equals(userDetails.getRole())) {
            StudentEntity student = studentRepository.findByUserId(userDetails.getId()).orElse(null);
            String studentIdNo = student != null ? student.getStudentId() : "";
            laptops = laptops.stream()
                    .filter(l -> l.getStudentId().equals(userDetails.getId()) ||
                                 l.getStudentIdNumber().equalsIgnoreCase(studentIdNo))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(laptops.stream().map(laptopApprovalService::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaptopDto> getLaptopById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        LaptopEntity laptop = laptopRepository.findById(id)
                .or(() -> laptopRepository.findByPcId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Laptop asset not found: " + id));

        if ("STUDENT".equals(userDetails.getRole())) {
            StudentEntity student = studentRepository.findByUserId(userDetails.getId()).orElse(null);
            String studentIdNo = student != null ? student.getStudentId() : "";
            if (!laptop.getStudentId().equals(userDetails.getId()) && !laptop.getStudentIdNumber().equalsIgnoreCase(studentIdNo)) {
                throw new BadRequestException("Access denied: You may only view your own registered PC details.");
            }
        }

        return ResponseEntity.ok(laptopApprovalService.toDto(laptop));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LaptopDto>> getLaptopsByStudentId(
            @PathVariable String studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if ("STUDENT".equals(userDetails.getRole())) {
            StudentEntity student = studentRepository.findByUserId(userDetails.getId()).orElse(null);
            String studentIdNo = student != null ? student.getStudentId() : "";
            if (!studentId.equals(userDetails.getId()) && !studentId.equalsIgnoreCase(studentIdNo)) {
                throw new BadRequestException("Access denied: You can only query your own laptops.");
            }
        }

        List<LaptopEntity> list = laptopRepository.findByStudentId(studentId);
        if (list.isEmpty()) {
            list = laptopRepository.findByStudentIdNumber(studentId);
        }

        return ResponseEntity.ok(list.stream().map(laptopApprovalService::toDto).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/reissue-qr")
    public ResponseEntity<LaptopDto> reissueQr(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        LaptopEntity laptop = laptopRepository.findById(id)
                .or(() -> laptopRepository.findByPcId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Laptop asset not found: " + id));

        // Generate new opaque secure token
        String newToken = "HU-QR-" + UUID.randomUUID().toString();
        laptop.setQrToken(newToken);
        LaptopEntity saved = laptopRepository.save(laptop);

        auditLogService.record(userDetails.getId(), userDetails.getFullName(), userDetails.getRole(),
                "QR_TOKEN_REISSUED", "Laptop", saved.getPcId(),
                "SUCCESS", "Revoked prior token and reissued cryptographic verification token", "127.0.0.1");

        return ResponseEntity.ok(laptopApprovalService.toDto(saved));
    }
}
