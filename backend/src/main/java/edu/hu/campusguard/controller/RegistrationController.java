package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.LaptopDto;
import edu.hu.campusguard.dto.LaptopRegistrationDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.LaptopApprovalService;
import edu.hu.campusguard.service.LaptopRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final LaptopRegistrationService registrationService;
    private final LaptopApprovalService approvalService;

    @GetMapping
    public ResponseEntity<List<LaptopRegistrationDtos.LaptopRegistrationDto>> getRegistrations(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String studentIdNumber = userDetails.getUserEntity().getUsername();
        return ResponseEntity.ok(registrationService.getRegistrations(
                status, userDetails.getId(), userDetails.getRole(), studentIdNumber
        ));
    }

    @PostMapping
    public ResponseEntity<LaptopRegistrationDtos.LaptopRegistrationDto> createRegistration(
            @Valid @RequestBody LaptopRegistrationDtos.LaptopRegistrationRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        var regDto = registrationService.createRegistration(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        );

        // If autoApprove requested by OFFICER or ADMIN
        if (Boolean.TRUE.equals(req.getAutoApprove()) && ("OFFICER".equals(userDetails.getRole()) || "ADMIN".equals(userDetails.getRole()))) {
            approvalService.approveRegistration(regDto.getId(), userDetails.getId(), userDetails.getFullName(), userDetails.getRole());
            regDto.setStatus("APPROVED");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(regDto);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<LaptopDto> approveRegistration(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.approveRegistration(
                id, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<LaptopRegistrationDtos.LaptopRegistrationDto> rejectRegistration(
            @PathVariable String id,
            @Valid @RequestBody LaptopRegistrationDtos.RejectRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(registrationService.rejectRegistration(
                id, req.getReason(), userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }
}
