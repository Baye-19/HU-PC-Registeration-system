package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "security_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityEventEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "laptop_id", nullable = false, length = 36)
    private String laptopId;

    @Column(name = "pc_id", nullable = false, length = 50)
    private String pcId;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "student_id_number", nullable = false, length = 50)
    private String studentIdNumber;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "gate_id", nullable = false, length = 36)
    private String gateId;

    @Column(name = "gate_name", nullable = false, length = 150)
    private String gateName;

    @Column(name = "officer_id", nullable = false, length = 36)
    private String officerId;

    @Column(name = "officer_name", nullable = false, length = 150)
    private String officerName;

    @Column(name = "movement_type", nullable = false, length = 10)
    private String movementType; // IN, OUT

    @Column(name = "verification_method", nullable = false, length = 30)
    private String verificationMethod; // QR_SCAN, MANUAL_ENTRY

    @Column(name = "verification_result", nullable = false, length = 30)
    private String verificationResult; // GRANTED, DENIED, FLAGGED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now();
}
