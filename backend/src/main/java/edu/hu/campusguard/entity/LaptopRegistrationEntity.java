package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "laptop_registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaptopRegistrationEntity {

    @Id
    @Column(length = 36)
    private String id;

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

    @Column(name = "serial_number", nullable = false, length = 100)
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
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "submitted_by_role", nullable = false, length = 30)
    private String submittedByRole;

    @Column(name = "submitted_by_user_id", nullable = false, length = 36)
    private String submittedByUserId;

    @Column(name = "reviewed_by_officer_id", length = 36)
    private String reviewedByOfficerId;

    @Column(name = "reviewed_by_officer_name", length = 150)
    private String reviewedByOfficerName;

    @Column(name = "review_date")
    private OffsetDateTime reviewDate;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "pc_id", length = 50)
    private String pcId;

    @Column(name = "registration_date", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime registrationDate = OffsetDateTime.now();
}
