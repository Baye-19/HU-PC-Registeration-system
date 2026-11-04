package edu.hu.campusguard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class AuthDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Username or email is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private UserDto user;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private String id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String phone;
        private boolean active;
        private String studentId;
        private String department;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserCreateRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        private String studentNameAmharic;

        @NotBlank(message = "Username or ID is required")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String password;

        @NotBlank(message = "Role is required")
        private String role; // ADMIN, OFFICER, STUDENT, GATE_OFFICER

        private String phone;
        private String studentId;
        private String department;
        private String faculty;
        private Integer academicYear;
        private String photoUrl;

        // Optional attached laptop info
        private String laptopBrand;
        private String laptopModel;
        private String laptopSerialNumber;
        private String laptopColor;
        private String laptopOs;
        private String laptopProcessor;
        private String laptopRam;
        private String laptopStorage;
        private String laptopDeviceType;
        private String laptopDescription;
    }
}
