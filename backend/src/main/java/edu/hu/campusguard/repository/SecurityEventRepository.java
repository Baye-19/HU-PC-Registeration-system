package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.SecurityEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEventEntity, String> {
    List<SecurityEventEntity> findTop100ByOrderByTimestampDesc();
    List<SecurityEventEntity> findByLaptopIdOrderByTimestampDesc(String laptopId);
    List<SecurityEventEntity> findByGateIdOrderByTimestampDesc(String gateId);
}
