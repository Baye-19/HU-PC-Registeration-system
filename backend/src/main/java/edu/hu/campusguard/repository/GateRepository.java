package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.GateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GateRepository extends JpaRepository<GateEntity, String> {
    Optional<GateEntity> findByCode(String code);
}
