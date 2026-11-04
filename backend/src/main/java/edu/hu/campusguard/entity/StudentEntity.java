package edu.hu.campusguard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", unique = true, length = 36)
    private String userId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "student_name_amharic", length = 150)
    private String studentNameAmharic;

    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

    @Column(name = "institutional_email", nullable = false, unique = true, length = 150)
    private String institutionalEmail;

    @Column(name = "department_id", length = 36)
    private String departmentId;

    @Column(name = "department_name", nullable = false, length = 150)
    private String departmentName;

    @Column(name = "faculty_name", nullable = false, length = 150)
    private String facultyName;

    @Column(name = "academic_year", nullable = false)
    private int academicYear;

    @Column(length = 30)
    private String phone;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "account_status", nullable = false, length = 30)
    @Builder.Default
    private String accountStatus = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
