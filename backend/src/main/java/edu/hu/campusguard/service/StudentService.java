package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.StudentDto;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ResourceNotFoundException;
import edu.hu.campusguard.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(String id) {
        StudentEntity student = studentRepository.findById(id)
                .or(() -> studentRepository.findByStudentId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + id));
        return toDto(student);
    }

    @Transactional
    public StudentDto updateStudent(String id, StudentDto.StudentUpdateRequest req, String actorId, String actorName, String actorRole) {
        StudentEntity student = studentRepository.findById(id)
                .or(() -> studentRepository.findByStudentId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + id));

        if (req.getFullName() != null && !req.getFullName().isBlank()) student.setFullName(req.getFullName().trim());
        if (req.getStudentNameAmharic() != null) student.setStudentNameAmharic(req.getStudentNameAmharic().trim());
        if (req.getPhone() != null) student.setPhone(req.getPhone().trim());
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) student.setDepartmentName(req.getDepartment().trim());
        if (req.getFaculty() != null && !req.getFaculty().isBlank()) student.setFacultyName(req.getFaculty().trim());
        if (req.getAcademicYear() != null && req.getAcademicYear() > 0) student.setAcademicYear(req.getAcademicYear());
        if (req.getPhotoUrl() != null) student.setPhotoUrl(req.getPhotoUrl());

        StudentEntity saved = studentRepository.save(student);

        auditLogService.record(actorId, actorName, actorRole,
                "STUDENT_UPDATED", "Student", saved.getId(),
                "SUCCESS", "Updated student profile " + saved.getFullName(), "127.0.0.1");

        return toDto(saved);
    }

    public StudentDto toDto(StudentEntity s) {
        return StudentDto.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .fullName(s.getFullName())
                .studentNameAmharic(s.getStudentNameAmharic())
                .studentId(s.getStudentId())
                .institutionalEmail(s.getInstitutionalEmail())
                .departmentId(s.getDepartmentId())
                .department(s.getDepartmentName())
                .faculty(s.getFacultyName())
                .academicYear(s.getAcademicYear())
                .phone(s.getPhone())
                .photoUrl(s.getPhotoUrl())
                .accountStatus(s.getAccountStatus())
                .createdAt(s.getCreatedAt().toString())
                .build();
    }
}
