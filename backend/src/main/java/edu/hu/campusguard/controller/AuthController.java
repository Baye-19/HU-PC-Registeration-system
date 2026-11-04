package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.AuthDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request, HttpServletRequest req) {
        String ip = req.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, ip));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, AuthDtos.UserDto>> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("user", authService.getCurrentUser(userDetails.getUsername())));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "system", "CampusGuard Hawassa University Security Engine"));
    }
}
