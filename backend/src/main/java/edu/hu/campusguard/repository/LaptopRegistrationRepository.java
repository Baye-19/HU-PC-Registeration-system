package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.LaptopRegistrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LaptopRegistrationRepository extends JpaRepository<LaptopRegistrationEntity, String> {
    List<LaptopRegistrationEntity> findByStatus(String status);
    List<LaptopRegistrationEntity> findByStudentId(String studentId);
    List<LaptopRegistrationEntity> findByStudentIdNumber(String studentIdNumber);
    List<LaptopRegistrationEntity> findBySubmittedByUserId(String submittedByUserId);
    Optional<LaptopRegistrationEntity> findBySerialNumber(String serialNumber);
    boolean existsBySerialNumber(String serialNumber);
}
