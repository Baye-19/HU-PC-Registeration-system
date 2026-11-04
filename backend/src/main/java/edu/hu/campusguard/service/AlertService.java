package edu.hu.campusguard.service;

import edu.hu.campusguard.dto.AlertDtos;
import edu.hu.campusguard.entity.AlertAcknowledgementEntity;
import edu.hu.campusguard.entity.AlertEntity;
import edu.hu.campusguard.repository.AlertAcknowledgementRepository;
import edu.hu.campusguard.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final AlertAcknowledgementRepository ackRepository;
    private final AuditLogService auditLogService;

    // SSE Client listeners for real-time alerts
    private final List<Consumer<AlertDtos.AlertDto>> sseListeners = new CopyOnWriteArrayList<>();

    public void registerSseListener(Consumer<AlertDtos.AlertDto> listener) {
        sseListeners.add(listener);
    }

    public void unregisterSseListener(Consumer<AlertDtos.AlertDto> listener) {
        sseListeners.remove(listener);
    }

    @Transactional
    public AlertDtos.AlertDto createAlert(AlertDtos.AlertCreateRequest req, String actorId, String actorName, String actorRole) {
        AlertEntity alert = AlertEntity.builder()
                .id("alt-" + UUID.randomUUID().toString())
                .type(req.getType())
                .title(req.getTitle())
                .message(req.getMessage())
                .severity(req.getSeverity())
                .laptopId(req.getLaptopId())
                .pcId(req.getPcId())
                .lostReportId(req.getLostReportId())
                .active(true)
                .createdAt(OffsetDateTime.now())
                .build();

        AlertEntity saved = alertRepository.save(alert);

        auditLogService.record(actorId, actorName, actorRole,
                "ALERT_BROADCAST", "Alert", saved.getId(),
                "SUCCESS", "Broadcasted alert: " + saved.getTitle(), "127.0.0.1");

        AlertDtos.AlertDto dto = toDto(saved);
        // Dispatch to real-time SSE listeners
        for (Consumer<AlertDtos.AlertDto> listener : sseListeners) {
            try {
                listener.accept(dto);
            } catch (Exception ignored) {}
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<AlertDtos.AlertDto> getActiveAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertDtos.AlertDto acknowledgeAlert(String alertId, String officerId, String officerName) {
        AlertEntity alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));

        if (!ackRepository.existsByAlertIdAndOfficerId(alertId, officerId)) {
            AlertAcknowledgementEntity ack = AlertAcknowledgementEntity.builder()
                    .id("ack-" + UUID.randomUUID().toString())
                    .alertId(alertId)
                    .officerId(officerId)
                    .officerName(officerName)
                    .timestamp(OffsetDateTime.now())
                    .build();
            ackRepository.save(ack);
        }

        return toDto(alert);
    }

    private AlertDtos.AlertDto toDto(AlertEntity entity) {
        List<String> acknowledgedOfficerIds = ackRepository.findByAlertId(entity.getId())
                .stream()
                .map(AlertAcknowledgementEntity::getOfficerId)
                .collect(Collectors.toList());

        return AlertDtos.AlertDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .severity(entity.getSeverity())
                .laptopId(entity.getLaptopId())
                .pcId(entity.getPcId())
                .lostReportId(entity.getLostReportId())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt().toString())
                .acknowledgedByOfficerIds(acknowledgedOfficerIds)
                .build();
    }
}
