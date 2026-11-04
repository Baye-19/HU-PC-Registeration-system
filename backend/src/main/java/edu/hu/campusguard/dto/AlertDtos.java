package edu.hu.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

public class AlertDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertCreateRequest {
        @NotBlank(message = "Alert type is required")
        private String type;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Message is required")
        private String message;

        @NotBlank(message = "Severity is required")
        private String severity; // HIGH, MEDIUM, INFO

        private String laptopId;
        private String pcId;
        private String lostReportId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertDto {
        private String id;
        private String type;
        private String title;
        private String message;
        private String severity;
        private String laptopId;
        private String pcId;
        private String lostReportId;
        private boolean active;
        private String createdAt;
        private List<String> acknowledgedByOfficerIds;
    }
}
