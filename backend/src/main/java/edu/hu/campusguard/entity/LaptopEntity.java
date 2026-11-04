package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "laptops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaptopEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "pc_id", nullable = false, unique = true, length = 50)
    private String pcId;

    @Column(name = "registration_id", nullable = false, unique = true, length = 36)
    private String registrationId;

    @Column(name = "student_id", nullable = false, length = 36)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "student_name_amharic", length = 150)
    private String studentNameAmharic;

    @Column(name = "student_id_number", nullable = false, length = 50)
    private String studentIdNumber;

    @Column(nullable = false, length = 150)
    private String department;

    @Column(nullable = false, length = 150)
    private String faculty;

    @Column(name = "owner_phone", length = 30)
    private String ownerPhone;

    @Column(name = "student_photo_url", columnDefinition = "TEXT")
    private String studentPhotoUrl;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "device_type", nullable = false, length = 50)
    private String deviceType;

    @Column(length = 100)
    private String processor;

    @Column(length = 50)
    private String ram;

    @Column(length = 50)
    private String storage;

    @Column(length = 50)
    private String os;

    @Column(length = 50)
    private String color;

    @Column(name = "physical_description", columnDefinition = "TEXT")
    private String physicalDescription;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "APPROVED";

    @Column(name = "security_status", nullable = false, length = 30)
    @Builder.Default
    private String securityStatus = "NORMAL"; // NORMAL, REPORTED_LOST, RESTRICTED

    @Column(name = "qr_token", nullable = false, unique = true, length = 100)
    private String qrToken;

    @Column(name = "current_movement_status", nullable = false, length = 20)
    @Builder.Default
    private String currentMovementStatus = "OUT"; // IN, OUT, UNKNOWN

    @Column(name = "last_movement_date")
    private OffsetDateTime lastMovementDate;

    @Column(name = "last_movement_gate", length = 150)
    private String lastMovementGate;

    @Column(name = "last_movement_officer", length = 150)
    private String lastMovementOfficer;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
