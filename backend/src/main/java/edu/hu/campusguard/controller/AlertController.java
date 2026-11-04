package edu.hu.campusguard.controller;

import edu.hu.campusguard.dto.AlertDtos;
import edu.hu.campusguard.security.CustomUserDetails;
import edu.hu.campusguard.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertDtos.AlertDto>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @PostMapping
    public ResponseEntity<AlertDtos.AlertDto> createAlert(
            @Valid @RequestBody AlertDtos.AlertCreateRequest req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(
                req, userDetails.getId(), userDetails.getFullName(), userDetails.getRole()
        ));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<AlertDtos.AlertDto> acknowledgeAlert(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id, userDetails.getId(), userDetails.getFullName()));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAlerts() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout

        Consumer<AlertDtos.AlertDto> listener = alertDto -> {
            try {
                emitter.send(SseEmitter.event().name("NEW_ALERT").data(alertDto));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        };

        alertService.registerSseListener(listener);

        try {
            emitter.send(SseEmitter.event().name("CONNECTED").data(Map.of("message", "Connected to Hawassa University Perimeter Alert Dispatch")));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        emitter.onCompletion(() -> alertService.unregisterSseListener(listener));
        emitter.onTimeout(() -> {
            alertService.unregisterSseListener(listener);
            emitter.complete();
        });
        emitter.onError(t -> alertService.unregisterSseListener(listener));

        return emitter;
    }
}
