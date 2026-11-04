package edu.hu.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private String id;
    private String userId;
    private String fullName;
    private String studentNameAmharic;
    private String studentId;
    private String institutionalEmail;
    private String departmentId;
    private String department;
    private String faculty;
    private int academicYear;
    private String phone;
    private String photoUrl;
    private String accountStatus;
    private String createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentUpdateRequest {
        private String fullName;
        private String studentNameAmharic;
        private String phone;
        private String department;
        private String faculty;
        private Integer academicYear;
        private String photoUrl;
    }
}
