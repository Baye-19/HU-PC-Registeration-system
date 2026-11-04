package edu.hu.campusguard.service;

import edu.hu.campusguard.entity.AuditLogEntity;
import edu.hu.campusguard.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(String actorId, String actorName, String actorRole,
                       String action, String targetEntity, String targetId,
                       String outcome, String details, String ipAddress) {
        AuditLogEntity log = AuditLogEntity.builder()
                .id("aud-" + UUID.randomUUID().toString())
                .actorId(actorId != null ? actorId : "anonymous")
                .actorName(actorName != null ? actorName : "Anonymous")
                .actorRole(actorRole != null ? actorRole : "NONE")
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .outcome(outcome)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .timestamp(OffsetDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogEntity> getRecentLogs() {
        return auditLogRepository.findTop200ByOrderByTimestampDesc();
    }
}
