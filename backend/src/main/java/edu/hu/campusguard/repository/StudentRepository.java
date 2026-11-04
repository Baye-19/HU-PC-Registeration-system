package edu.hu.campusguard.repository;

import edu.hu.campusguard.entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<StudentEntity, String> {
    Optional<StudentEntity> findByStudentId(String studentId);
    Optional<StudentEntity> findByInstitutionalEmail(String email);
    Optional<StudentEntity> findByUserId(String userId);
    List<StudentEntity> findByDepartmentName(String departmentName);
    boolean existsByStudentId(String studentId);
    boolean existsByInstitutionalEmail(String email);
}
