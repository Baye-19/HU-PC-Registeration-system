package edu.hu.campusguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaptopDto {
    private String id;
    private String pcId;
    private String registrationId;
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
    private String securityStatus;
    private String qrToken;
    private String currentMovementStatus;
    private String lastMovementDate;
    private String lastMovementGate;
    private String lastMovementOfficer;
    private String createdAt;
}
