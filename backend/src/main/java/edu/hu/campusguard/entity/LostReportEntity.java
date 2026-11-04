package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lost_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostReportEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "laptop_id", nullable = false, length = 36)
    private String laptopId;

    @Column(name = "pc_id", nullable = false, length = 50)
    private String pcId;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "reporting_student_id", nullable = false, length = 36)
    private String reportingStudentId;

    @Column(name = "reporting_student_name", nullable = false, length = 150)
    private String reportingStudentName;

    @Column(name = "student_id_number", nullable = false, length = 50)
    private String studentIdNumber;

    @Column(name = "incident_type", nullable = false, length = 50)
    private String incidentType;

    @Column(name = "incident_date", nullable = false)
    private OffsetDateTime incidentDate;

    @Column(name = "incident_location", nullable = false, length = 200)
    private String incidentLocation;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "contact_phone", nullable = false, length = 30)
    private String contactPhone;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, UNDER_INVESTIGATION, CONFIRMED_STOLEN, RESOLVED, REJECTED

    @Column(name = "reviewed_by_officer_id", length = 36)
    private String reviewedByOfficerId;

    @Column(name = "reviewed_by_officer_name", length = 150)
    private String reviewedByOfficerName;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;
}
