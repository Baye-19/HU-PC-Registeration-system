package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.AlertEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<AlertEntity, String> {
    List<AlertEntity> findAllByOrderByCreatedAtDesc();
    List<AlertEntity> findByActiveTrueOrderByCreatedAtDesc();
}
