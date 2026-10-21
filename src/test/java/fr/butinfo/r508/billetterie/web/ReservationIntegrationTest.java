package fr.butinfo.r508.billetterie.web;

import com.jayway.jsonpath.JsonPath;
import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.domain.Salle;
import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.repository.FilmRepository;
import fr.butinfo.r508.billetterie.repository.SalleRepository;
import fr.butinfo.r508.billetterie.repository.SeanceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class ReservationIntegrationTest {

    @Container
    @ServiceConnection
    static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.4");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private SalleRepository salleRepository;

    @Autowired
    private SeanceRepository seanceRepository;

    @Test
    void migrationsAppliqueesEtLecturePublique() throws Exception {
        mockMvc.perform(get("/api/films"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titre").exists());

        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void reservationPuisAnnulationLibereLesPlaces() throws Exception {
        Seance seance = creerSeance(20);

        MvcResult resultat = mockMvc.perform(post("/api/reservations")
                        .with(httpBasic("client", "client123"))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":%d,"emailClient":"integration@example.test","nombrePlaces":3}
                                """.formatted(seance.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statut").value("CONFIRMEE"))
                .andExpect(jsonPath("$.nombrePlaces").value(3))
                .andExpect(jsonPath("$.montantTotal").value(27.00))
                .andReturn();

        String code = JsonPath.read(resultat.getResponse().getContentAsString(), "$.code");

        mockMvc.perform(get("/api/seances/{id}", seance.getId()))
                .andExpect(jsonPath("$.placesRestantes").value(17));

        mockMvc.perform(delete("/api/reservations/{code}", code)
                        .with(httpBasic("client", "client123")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/seances/{id}", seance.getId()))
                .andExpect(jsonPath("$.placesRestantes").value(20));
    }

    @Test
    void capaciteDepasseeRenvoie409SansEcriture() throws Exception {
        Seance seance = creerSeance(20);

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/reservations")
                            .with(httpBasic("client", "client123"))
                            .contentType(APPLICATION_JSON)
                            .content("""
                                    {"seanceId":%d,"emailClient":"plein%d@example.test","nombrePlaces":8}
                                    """.formatted(seance.getId(), i)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post("/api/reservations")
                        .with(httpBasic("client", "client123"))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":%d,"emailClient":"trop@example.test","nombrePlaces":8}
                                """.formatted(seance.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CAPACITE_INSUFFISANTE"));

        mockMvc.perform(get("/api/seances/{id}", seance.getId()))
                .andExpect(jsonPath("$.placesRestantes").value(4));
    }

    @Test
    void anonymeRefuseEtClientNeCreePasDeSalle() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"seanceId":1,"emailClient":"anonyme@example.test","nombrePlaces":1}
                                """))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/admin/salles")
                        .with(httpBasic("client", "client123"))
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"nom":"Salle interdite","capacite":50}
                                """))
                .andExpect(status().isForbidden());
    }

    private Seance creerSeance(int capacite) {
        Film film = filmRepository.findAll().getFirst();
        Salle salle = salleRepository.saveAndFlush(
                new Salle("Salle IT " + UUID.randomUUID(), capacite));
        return seanceRepository.saveAndFlush(new Seance(
                film, salle, LocalDateTime.now().plusDays(5), new BigDecimal("9.00")));
    }
}
