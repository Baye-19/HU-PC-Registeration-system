package edu.hu.campusguard;

import edu.hu.campusguard.dto.LaptopDto;
import edu.hu.campusguard.dto.LaptopRegistrationDtos;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.LaptopRegistrationEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ConflictException;
import edu.hu.campusguard.repository.LaptopRegistrationRepository;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.StudentRepository;
import edu.hu.campusguard.service.AuditLogService;
import edu.hu.campusguard.service.LaptopApprovalService;
import edu.hu.campusguard.service.LaptopRegistrationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LaptopRegistrationWorkflowTests {

    @Mock
    private LaptopRegistrationRepository registrationRepository;

    @Mock
    private LaptopRepository laptopRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private LaptopRegistrationService registrationService;

    @InjectMocks
    private LaptopApprovalService approvalService;

    @Test
    @DisplayName("Should prevent duplicate hardware registration when serial number already exists")
    void testDuplicateSerialNumberRejected() {
        when(laptopRepository.existsBySerialNumber("SN-DL-882914")).thenReturn(true);

        LaptopRegistrationDtos.LaptopRegistrationRequest req = LaptopRegistrationDtos.LaptopRegistrationRequest.builder()
                .brand("Dell")
                .model("Latitude 5420")
                .serialNumber("SN-DL-882914")
                .build();

        assertThrows(ConflictException.class, () -> {
            registrationService.createRegistration(req, "usr-stu-1", "Abebe Bikila", "STUDENT");
        });
    }

    @Test
    @DisplayName("Should require mandatory rejection reason when an officer rejects registration")
    void testRejectionRequiresMandatoryReason() {
        assertThrows(BadRequestException.class, () -> {
            registrationService.rejectRegistration("reg-123", "   ", "usr-off-1", "Inspector Kebede", "OFFICER");
        });
    }
}
