package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.config.SecurityConfig;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import fr.butinfo.r508.billetterie.error.GlobalExceptionHandler;
import fr.butinfo.r508.billetterie.service.ReservationService;
import fr.butinfo.r508.billetterie.service.SalleService;
import fr.butinfo.r508.billetterie.web.dto.ReservationResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ReservationController.class, SalleController.class})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReservationService reservationService;

    @MockitoBean
    private SalleService salleService;

    @Test
    @WithMockUser(roles = "CLIENT")
    void creationValideRenvoie201EtLeContrat() throws Exception {
        when(reservationService.creer(any())).thenReturn(new ReservationResponse(
                "RES-ABCDEFGHJK", StatutReservation.CONFIRMEE, 3, new BigDecimal("29.70"),
                12L, "lea@example.test", LocalDateTime.now()));

        mockMvc.perform(post("/api/reservations")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":12,"emailClient":"lea@example.test","nombrePlaces":3}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("RES-ABCDEFGHJK"))
                .andExpect(jsonPath("$.statut").value("CONFIRMEE"))
                .andExpect(jsonPath("$.nombrePlaces").value(3))
                .andExpect(jsonPath("$.montantTotal").value(29.70));
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void validationEchoueePourZeroPlace() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":12,"emailClient":"lea@example.test","nombrePlaces":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ECHOUEE"))
                .andExpect(jsonPath("$.path").value("/api/reservations"));

        verifyNoInteractions(reservationService);
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void validationEchoueePourNeufPlaces() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":12,"emailClient":"lea@example.test","nombrePlaces":9}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ECHOUEE"));
    }

    @Test
    void anonymeRefuseAvec401() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":12,"emailClient":"lea@example.test","nombrePlaces":2}
                                """))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(reservationService);
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void clientNePeutPasCreerDeSalle() throws Exception {
        mockMvc.perform(post("/api/admin/salles")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"nom":"Salle interdite","capacite":50}
                                """))
                .andExpect(status().isForbidden());

        verifyNoInteractions(salleService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminPeutCreerUneSalle() throws Exception {
        when(salleService.creer(any())).thenReturn(
                new fr.butinfo.r508.billetterie.web.dto.SalleResponse(4L, "Salle 4", 50));

        mockMvc.perform(post("/api/admin/salles")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"nom":"Salle 4","capacite":50}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Salle 4"));
    }
}
