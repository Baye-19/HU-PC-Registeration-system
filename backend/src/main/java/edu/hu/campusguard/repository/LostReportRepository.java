package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.LostReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LostReportRepository extends JpaRepository<LostReportEntity, String> {
    List<LostReportEntity> findAllByOrderByCreatedAtDesc();
    List<LostReportEntity> findByStatus(String status);
    List<LostReportEntity> findByLaptopId(String laptopId);
    List<LostReportEntity> findByReportingStudentId(String studentId);
    List<LostReportEntity> findByStudentIdNumber(String studentIdNumber);
}
