package edu.hu.campusguard.exception;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private List<String> details;
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now();
    private String path;
}
