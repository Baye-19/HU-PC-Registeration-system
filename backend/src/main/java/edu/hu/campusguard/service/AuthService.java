package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.AuthDtos;
import edu.hu.campusguard.entity.StudentEntity;
import edu.hu.campusguard.entity.UserEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.UnauthorizedException;
import edu.hu.campusguard.repository.StudentRepository;
import edu.hu.campusguard.repository.UserRepository;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req, String ipAddress) {
        UserEntity user = userRepository.findByUsernameOrEmail(req.getUsername(), req.getUsername())
                .orElse(null);

        if (user == null) {
            auditLogService.record("anonymous", req.getUsername(), "NONE",
                    "LOGIN_FAILURE", "User", req.getUsername(),
                    "FAILURE", "Unknown user credentials supplied", ipAddress);
            throw new UnauthorizedException("Invalid institutional credentials");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            auditLogService.record(user.getId(), user.getFullName(), user.getRole(),
                    "LOGIN_FAILURE", "User", user.getId(),
                    "FAILURE", "Incorrect password supplied", ipAddress);
            throw new UnauthorizedException("Invalid institutional credentials");
        }

        if (!user.isActive()) {
            throw new BadRequestException("This account is currently deactivated. Contact Directorate.");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtTokenProvider.generateToken(userDetails);

        auditLogService.record(user.getId(), user.getFullName(), user.getRole(),
                "LOGIN_SUCCESS", "User", user.getId(),
                "SUCCESS", "Institutional sign-in authenticated", ipAddress);

        return AuthDtos.AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserDto getCurrentUser(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User session expired"));
        return toUserDto(user);
    }

    public AuthDtos.UserDto toUserDto(UserEntity user) {
        String studentId = null;
        String department = null;
        if ("STUDENT".equals(user.getRole())) {
            StudentEntity student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) {
                studentId = student.getStudentId();
                department = student.getDepartmentName();
            }
        }

        return AuthDtos.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .active(user.isActive())
                .studentId(studentId)
                .department(department)
                .build();
    }
}
