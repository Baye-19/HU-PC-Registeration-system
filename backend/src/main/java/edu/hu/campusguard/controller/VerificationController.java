package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.VerificationDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.GateMovementService;
import edu.hu.campusguard.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;
    private final GateMovementService gateMovementService;

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('GATE_OFFICER', 'OFFICER', 'ADMIN')")
    public ResponseEntity<VerificationDtos.VerificationResponseDto> verify(
            @RequestBody VerificationDtos.VerifyRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(verificationService.verifyDevice(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @PostMapping("/movement")
    @PreAuthorize("hasAnyRole('GATE_OFFICER', 'OFFICER', 'ADMIN')")
    public ResponseEntity<VerificationDtos.SecurityEventDto> recordMovement(
            @Valid @RequestBody VerificationDtos.MovementRecordRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gateMovementService.recordMovement(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @GetMapping("/events")
    public ResponseEntity<List<VerificationDtos.SecurityEventDto>> getEvents() {
        return ResponseEntity.ok(gateMovementService.getRecentEvents());
    }
}
