package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.AlertAcknowledgementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertAcknowledgementRepository extends JpaRepository<AlertAcknowledgementEntity, String> {
    List<AlertAcknowledgementEntity> findByAlertId(String alertId);
    Optional<AlertAcknowledgementEntity> findByAlertIdAndOfficerId(String alertId, String officerId);
    boolean existsByAlertIdAndOfficerId(String alertId, String officerId);
}
