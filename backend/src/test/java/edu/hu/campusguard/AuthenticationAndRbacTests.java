package edu.hu.campusguard;

import edu.hu.campusguard.dto.AuthDtos;
import edu.hu.campusguard.entity.UserEntity;
import edu.hu.campusguard.exception.UnauthorizedException;
import edu.hu.campusguard.repository.UserRepository;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.security.JwtTokenProvider;
import edu.hu.campusguard.service.AuditLogService;
import edu.hu.campusguard.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthenticationAndRbacTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private UserEntity testAdminUser;
    private UserEntity testStudentUser;

    @BeforeEach
    void setUp() {
        testAdminUser = UserEntity.builder()
                .id("usr-admin-1")
                .username("admin")
                .email("admin@hu.edu.et")
                .fullName("Dr. Tadesse Bekele")
                .role("ADMIN")
                .passwordHash("$2a$10$hashedpassword")
                .active(true)
                .build();

        testStudentUser = UserEntity.builder()
                .id("usr-student-1")
                .username("student.abebe")
                .email("abebe.bikila@hu.edu.et")
                .fullName("Abebe Bikila")
                .role("STUDENT")
                .passwordHash("$2a$10$hashedpassword")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully authenticate valid credentials and issue signed token")
    void testSuccessfulLogin() {
        when(userRepository.findByUsernameOrEmail("admin", "admin")).thenReturn(Optional.of(testAdminUser));
        when(passwordEncoder.matches("Admin@123", testAdminUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("valid.jwt.token");

        AuthDtos.AuthResponse response = authService.login(new AuthDtos.LoginRequest("admin", "Admin@123"), "127.0.0.1");

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("Dr. Tadesse Bekele", response.getUser().getFullName());
        assertEquals("ADMIN", response.getUser().getRole());
        verify(auditLogService, times(1)).record(eq(testAdminUser.getId()), any(), any(), eq("LOGIN_SUCCESS"), any(), any(), eq("SUCCESS"), any(), any());
    }

    @Test
    @DisplayName("Should reject invalid password with UnauthorizedException")
    void testInvalidPasswordFails() {
        when(userRepository.findByUsernameOrEmail("admin", "admin")).thenReturn(Optional.of(testAdminUser));
        when(passwordEncoder.matches("WrongPassword", testAdminUser.getPasswordHash())).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> {
            authService.login(new AuthDtos.LoginRequest("admin", "WrongPassword"), "127.0.0.1");
        });

        verify(auditLogService, times(1)).record(eq(testAdminUser.getId()), any(), any(), eq("LOGIN_FAILURE"), any(), any(), eq("FAILURE"), any(), any());
    }

    @Test
    @DisplayName("Should reject unknown user with UnauthorizedException")
    void testUnknownUserFails() {
        when(userRepository.findByUsernameOrEmail("nonexistent", "nonexistent")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> {
            authService.login(new AuthDtos.LoginRequest("nonexistent", "anyPassword"), "127.0.0.1");
        });
    }
}
