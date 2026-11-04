package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "alert_acknowledgements", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"alert_id", "officer_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertAcknowledgementEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "alert_id", nullable = false, length = 36)
    private String alertId;

    @Column(name = "officer_id", nullable = false, length = 36)
    private String officerId;

    @Column(name = "officer_name", nullable = false, length = 150)
    private String officerName;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now();
}
