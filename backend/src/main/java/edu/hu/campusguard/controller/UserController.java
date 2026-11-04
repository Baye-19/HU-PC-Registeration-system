package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.AuthDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<List<AuthDtos.UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<AuthDtos.UserDto> createUser(
            @Valid @RequestBody AuthDtos.UserCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }
}
