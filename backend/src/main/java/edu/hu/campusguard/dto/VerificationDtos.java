package edu.hu.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

public class VerificationDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyRequest {
        private String token;
        private String pcId;
        private String serialNumber;
        private String gateId;
        private String officerId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerificationResponseDto {
        private boolean verified;
        private String verificationMethod;
        private String verificationResult; // GRANTED, DENIED, FLAGGED
        private LaptopDto laptop;
        private StudentDto student;
        private String recommendedAction; // PERMIT_PASSAGE, DENY_PASSAGE, DETAIN_AND_NOTIFY
        private String message;
        private List<String> warnings;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovementRecordRequest {
        @NotBlank(message = "Laptop ID is required")
        private String laptopId;

        @NotBlank(message = "Gate ID is required")
        private String gateId;

        @NotBlank(message = "Movement type is required (IN or OUT)")
        private String movementType; // IN, OUT

        private String verificationMethod; // QR_SCAN, MANUAL_ENTRY
        private String verificationResult; // GRANTED, DENIED, FLAGGED
        private String notes;
        private Boolean overrideConflict;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SecurityEventDto {
        private String id;
        private String laptopId;
        private String pcId;
        private String studentName;
        private String studentIdNumber;
        private String brand;
        private String model;
        private String serialNumber;
        private String gateId;
        private String gateName;
        private String officerId;
        private String officerName;
        private String movementType;
        private String verificationMethod;
        private String verificationResult;
        private String notes;
        private String timestamp;
    }
}
