package edu.hu.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class LaptopRegistrationDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LaptopRegistrationRequest {
        private String studentId;
        private String studentName;
        private String studentNameAmharic;
        private String studentIdNumber;
        private String department;
        private String faculty;
        private String ownerPhone;
        private String studentPhotoUrl;

        @NotBlank(message = "Brand is required")
        private String brand;

        @NotBlank(message = "Model is required")
        private String model;

        @NotBlank(message = "Serial number is required")
        private String serialNumber;

        private String deviceType;
        private String processor;
        private String ram;
        private String storage;
        private String os;
        private String color;
        private String physicalDescription;
        private Boolean autoApprove;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LaptopRegistrationDto {
        private String id;
        private String studentId;
        private String studentName;
        private String studentNameAmharic;
        private String studentIdNumber;
        private String department;
        private String faculty;
        private String ownerPhone;
        private String studentPhotoUrl;
        private String brand;
        private String model;
        private String serialNumber;
        private String deviceType;
        private String processor;
        private String ram;
        private String storage;
        private String os;
        private String color;
        private String physicalDescription;
        private String status;
        private String submittedByRole;
        private String submittedByUserId;
        private String reviewedByOfficerId;
        private String reviewedByOfficerName;
        private String reviewDate;
        private String rejectionReason;
        private String pcId;
        private String registrationDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectRequest {
        @NotBlank(message = "Rejection reason is strictly required")
        private String reason;
    }
}
