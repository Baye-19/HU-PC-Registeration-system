package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.LostReportDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.LostReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lost-reports")
@RequiredArgsConstructor
public class LostReportController {

    private final LostReportService lostReportService;

    @GetMapping
    public ResponseEntity<List<LostReportDtos.LostReportDto>> getReports(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String studentIdNo = userDetails.getUserEntity().getUsername();
        return ResponseEntity.ok(lostReportService.getReports(userDetails.getId(), userDetails.getRole(), studentIdNo));
    }

    @PostMapping
    public ResponseEntity<LostReportDtos.LostReportDto> createReport(
            @Valid @RequestBody LostReportDtos.LostReportCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lostReportService.createReport(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<LostReportDtos.LostReportDto> reviewReport(
            @PathVariable String id,
            @Valid @RequestBody LostReportDtos.ReviewReportRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(lostReportService.reviewReport(
                id, req.getStatus(), req.getNotes(),
                userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public ResponseEntity<LostReportDtos.LostReportDto> resolveReport(
            @PathVariable String id,
            @RequestBody(required = false) LostReportDtos.ReviewReportRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String notes = req != null ? req.getNotes() : "Recovered and cleared.";
        return ResponseEntity.ok(lostReportService.resolveReport(
                id, notes,
                userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }
}
