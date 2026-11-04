package edu.hu.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class LostReportDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LostReportCreateRequest {
        @NotBlank(message = "Laptop ID is required")
        private String laptopId;

        @NotBlank(message = "Incident type is required")
        private String incidentType;

        @NotBlank(message = "Incident date is required")
        private String incidentDate;

        @NotBlank(message = "Incident location is required")
        private String incidentLocation;

        @NotBlank(message = "Detailed description is required")
        private String description;

        @NotBlank(message = "Emergency contact phone is required")
        private String contactPhone;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewReportRequest {
        @NotBlank(message = "Status is required (UNDER_INVESTIGATION, CONFIRMED_STOLEN, RESOLVED, REJECTED)")
        private String status;

        private String notes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LostReportDto {
        private String id;
        private String laptopId;
        private String pcId;
        private String brand;
        private String model;
        private String serialNumber;
        private String reportingStudentId;
        private String reportingStudentName;
        private String studentIdNumber;
        private String incidentType;
        private String incidentDate;
        private String incidentLocation;
        private String description;
        private String contactPhone;
        private String status;
        private String reviewedByOfficerId;
        private String reviewedByOfficerName;
        private String reviewNotes;
        private String createdAt;
        private String resolvedAt;
    }
}
