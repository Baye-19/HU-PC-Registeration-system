package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.LaptopEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LaptopRepository extends JpaRepository<LaptopEntity, String> {
    Optional<LaptopEntity> findByPcId(String pcId);
    Optional<LaptopEntity> findBySerialNumber(String serialNumber);
    Optional<LaptopEntity> findByQrToken(String qrToken);
    List<LaptopEntity> findByStudentId(String studentId);
    List<LaptopEntity> findByStudentIdNumber(String studentIdNumber);
    boolean existsBySerialNumber(String serialNumber);
    boolean existsByPcId(String pcId);
    boolean existsByQrToken(String qrToken);

    long countByStatus(String status);
    long countBySecurityStatus(String securityStatus);
    long countByCurrentMovementStatus(String movementStatus);

    @Query("SELECT MAX(CAST(SUBSTRING(l.pcId, 8) AS integer)) FROM LaptopEntity l WHERE l.pcId LIKE 'CG-LPT-%'")
    Integer findMaxPcIdSequence();
}
