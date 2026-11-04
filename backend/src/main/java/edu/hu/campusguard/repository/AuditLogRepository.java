package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, String> {
    List<AuditLogEntity> findTop200ByOrderByTimestampDesc();
    List<AuditLogEntity> findByActorIdOrderByTimestampDesc(String actorId);
}
