package edu.hu.campusguard.controller;

import edu.hu.campusguard.entity.GateEntity;
import edu.hu.campusguard.repository.GateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gates")
@RequiredArgsConstructor
public class GateController {

    private final GateRepository gateRepository;

    @GetMapping
    public ResponseEntity<List<GateEntity>> getAllGates() {
        return ResponseEntity.ok(gateRepository.findAll());
    }
}
