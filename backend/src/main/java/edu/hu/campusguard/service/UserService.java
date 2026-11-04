package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.AuthDtos;
import edu.hu.campusguard.dto.LaptopRegistrationDtos;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.entity.UserEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ConflictException;
import edu.hu.campusguard.repository.StudentRepository;
import edu.hu.campusguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LaptopRegistrationService registrationService;
    private final LaptopApprovalService approvalService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<AuthDtos.UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            String studentId = null;
            String dept = null;
            if ("STUDENT".equals(u.getRole())) {
                StudentEntity s = studentRepository.findByUserId(u.getId()).orElse(null);
                if (s != null) {
                    studentId = s.getStudentId();
                    dept = s.getDepartmentName();
                }
            }
            return AuthDtos.UserDto.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .fullName(u.getFullName())
                    .role(u.getRole())
                    .phone(u.getPhone())
                    .active(u.isActive())
                    .studentId(studentId)
                    .department(dept)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AuthDtos.UserDto createUser(AuthDtos.UserCreateRequest req, String actorId, String actorName, String actorRole) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanUsername = req.getUsername().trim().toLowerCase();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new ConflictException("Username is already in use: " + cleanUsername);
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new ConflictException("Email is already registered: " + cleanEmail);
        }

        String userId = "usr-" + UUID.randomUUID().toString();
        String defaultPass = req.getPassword() != null && !req.getPassword().isBlank() ? req.getPassword() : "Student@123";

        UserEntity user = UserEntity.builder()
                .id(userId)
                .username(cleanUsername)
                .email(cleanEmail)
                .passwordHash(passwordEncoder.encode(defaultPass))
                .fullName(req.getFullName().trim())
                .role(req.getRole().toUpperCase())
                .phone(req.getPhone())
                .active(true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        UserEntity savedUser = userRepository.save(user);

        // If creating student profile
        if ("STUDENT".equalsIgnoreCase(req.getRole())) {
            String studentIdNo = req.getStudentId() != null && !req.getStudentId().isBlank()
                    ? req.getStudentId().trim().toUpperCase()
                    : "HU/" + (10000 + (int)(Math.random() * 90000)) + "/15";

            StudentEntity student = StudentEntity.builder()
                    .id("stu-" + UUID.randomUUID().toString())
                    .userId(savedUser.getId())
                    .fullName(savedUser.getFullName())
                    .studentNameAmharic(req.getStudentNameAmharic())
                    .studentId(studentIdNo)
                    .institutionalEmail(savedUser.getEmail())
                    .departmentName(req.getDepartment() != null ? req.getDepartment() : "Computer Science")
                    .facultyName(req.getFaculty() != null ? req.getFaculty() : "Institute of Technology (IoT)")
                    .academicYear(req.getAcademicYear() != null ? req.getAcademicYear() : 3)
                    .phone(savedUser.getPhone())
                    .photoUrl(req.getPhotoUrl())
                    .accountStatus("ACTIVE")
                    .createdAt(OffsetDateTime.now())
                    .build();

            StudentEntity savedStudent = studentRepository.save(student);

            // If simultaneous PC registration was requested
            if (req.getLaptopBrand() != null && req.getLaptopModel() != null && req.getLaptopSerialNumber() != null) {
                var regDto = registrationService.createRegistration(
                        LaptopRegistrationDtos.LaptopRegistrationRequest.builder()
                                .studentId(savedStudent.getId())
                                .studentName(savedStudent.getFullName())
                                .studentNameAmharic(savedStudent.getStudentNameAmharic())
                                .studentIdNumber(savedStudent.getStudentId())
                                .department(savedStudent.getDepartmentName())
                                .faculty(savedStudent.getFacultyName())
                                .ownerPhone(savedStudent.getPhone())
                                .studentPhotoUrl(savedStudent.getPhotoUrl())
                                .brand(req.getLaptopBrand())
                                .model(req.getLaptopModel())
                                .serialNumber(req.getLaptopSerialNumber())
                                .deviceType(req.getLaptopDeviceType() != null ? req.getLaptopDeviceType() : "Laptop")
                                .color(req.getLaptopColor())
                                .os(req.getLaptopOs())
                                .processor(req.getLaptopProcessor())
                                .ram(req.getLaptopRam())
                                .storage(req.getLaptopStorage())
                                .physicalDescription(req.getLaptopDescription())
                                .build(),
                        actorId, actorName, actorRole
                );

                // Auto-approve since created directly by authorized administrator
                approvalService.approveRegistration(regDto.getId(), actorId, actorName, actorRole);
            }
        }

        auditLogService.record(actorId, actorName, actorRole,
                "USER_CREATED", "User", savedUser.getId(),
                "SUCCESS", "Created user " + savedUser.getUsername() + " [" + savedUser.getRole() + "]", "127.0.0.1");

        return AuthDtos.UserDto.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .phone(savedUser.getPhone())
                .active(savedUser.isActive())
                .studentId(req.getStudentId())
                .department(req.getDepartment())
                .build();
    }
}
