package edu.hu.campusguard;

import edu.hu.campusguard.dto.VerificationDtos;
import edu.hu.campusguard.entity.GateEntity;
import edu.hu.campusguard.entity.LaptopEntity;
import edu.hu.campusguard.entity.SecurityEventEntity;
import edu.hu.campusguard.exception.BadRequestException;
import edu.hu.campusguard.exception.ConflictException;
import edu.hu.campusguard.repository.GateRepository;
import edu.hu.campusguard.repository.LaptopRepository;
import edu.hu.campusguard.repository.SecurityEventRepository;
import edu.hu.campusguard.service.AuditLogService;
import edu.hu.campusguard.service.GateMovementService;
import edu.hu.campusguard.service.LaptopApprovalService;
import edu.hu.campusguard.service.StudentService;
import edu.hu.campusguard.service.VerificationService;
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
public class GateMovementVerificationTests {

    @Mock
    private LaptopRepository laptopRepository;

    @Mock
    private GateRepository gateRepository;

    @Mock
    private SecurityEventRepository eventRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private LaptopApprovalService laptopApprovalService;

    @Mock
    private StudentService studentService;

    @InjectMocks
    private VerificationService verificationService;

    @InjectMocks
    private GateMovementService gateMovementService;

    @Test
    @DisplayName("Should detect stolen laptop and recommend DETAIN_AND_NOTIFY action")
    void testStolenLaptopFlaggedAtGate() {
        LaptopEntity stolenLaptop = LaptopEntity.builder()
                .id("lpt-1")
                .pcId("CG-LPT-000001")
                .serialNumber("SN-DL-882914")
                .securityStatus("REPORTED_LOST")
                .status("APPROVED")
                .build();

        when(laptopRepository.findByQrToken("HU-QR-STOLEN")).thenReturn(Optional.of(stolenLaptop));

        VerificationDtos.VerifyRequest req = VerificationDtos.VerifyRequest.builder()
                .token("HU-QR-STOLEN")
                .build();

        VerificationDtos.VerificationResponseDto response = verificationService.verifyDevice(
                req, "usr-gate-1", "Officer Girma", "GATE_OFFICER"
        );

        assertFalse(response.isVerified());
        assertEquals("FLAGGED", response.getVerificationResult());
        assertEquals("DETAIN_AND_NOTIFY", response.getRecommendedAction());
    }

    @Test
    @DisplayName("Should prevent consecutive double-IN movement without authorized override")
    void testConsecutiveMovementConflict() {
        LaptopEntity insideLaptop = LaptopEntity.builder()
                .id("lpt-2")
                .pcId("CG-LPT-000002")
                .serialNumber("SN-HP-339102")
                .currentMovementStatus("IN")
                .securityStatus("NORMAL")
                .status("APPROVED")
                .build();

        when(laptopRepository.findById("lpt-2")).thenReturn(Optional.of(insideLaptop));

        VerificationDtos.MovementRecordRequest req = VerificationDtos.MovementRecordRequest.builder()
                .laptopId("lpt-2")
                .gateId("gate-1")
                .movementType("IN") // Double IN!
                .overrideConflict(false)
                .build();

        assertThrows(ConflictException.class, () -> {
            gateMovementService.recordMovement(req, "usr-gate-1", "Officer Girma", "GATE_OFFICER");
        });
    }
}
