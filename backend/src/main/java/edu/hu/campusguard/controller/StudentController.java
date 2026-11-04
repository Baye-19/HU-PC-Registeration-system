package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.StudentDto;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDto> updateStudent(
            @PathVariable String id,
            @RequestBody StudentDto.StudentUpdateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(studentService.updateStudent(
                id, req,
                userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }
}
