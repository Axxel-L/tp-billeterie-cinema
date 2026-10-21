package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.domain.Salle;
import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import fr.butinfo.r508.billetterie.error.CapaciteInsuffisanteException;
import fr.butinfo.r508.billetterie.repository.FilmRepository;
import fr.butinfo.r508.billetterie.repository.ReservationRepository;
import fr.butinfo.r508.billetterie.repository.SalleRepository;
import fr.butinfo.r508.billetterie.repository.SeanceRepository;
import fr.butinfo.r508.billetterie.web.dto.ReservationRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class ReservationConcurrencyTest {

    @Container
    @ServiceConnection
    static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.4");

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SeanceRepository seanceRepository;

    @Autowired
    private SalleRepository salleRepository;

    @Autowired
    private FilmRepository filmRepository;

    @Test
    void deuxDemandesSimultaneesNeSurserventPasLaSeance() throws Exception {
        Seance seance = creerSeance(20);
        reservationService.creer(new ReservationRequest(seance.getId(), "avant1@example.test", 8));
        reservationService.creer(new ReservationRequest(seance.getId(), "avant2@example.test", 7));

        long dejaReservees = reservationRepository.sommePlaces(seance.getId(), StatutReservation.CONFIRMEE);
        assertThat(dejaReservees).isEqualTo(15L);

        CountDownLatch depart = new CountDownLatch(1);
        ExecutorService executeur = Executors.newFixedThreadPool(2);
        try {
            Callable<Boolean> premiere = demande(seance.getId(), "simul1@example.test", depart);
            Callable<Boolean> seconde = demande(seance.getId(), "simul2@example.test", depart);

            Future<Boolean> resultat1 = executeur.submit(premiere);
            Future<Boolean> resultat2 = executeur.submit(seconde);
            depart.countDown();

            boolean succes1 = resultat1.get(15, TimeUnit.SECONDS);
            boolean succes2 = resultat2.get(15, TimeUnit.SECONDS);

            assertThat(succes1 ^ succes2)
                    .as("exactement une des deux réservations doit réussir")
                    .isTrue();
        } finally {
            executeur.shutdownNow();
        }

        long total = reservationRepository.sommePlaces(seance.getId(), StatutReservation.CONFIRMEE);
        assertThat(total).isEqualTo(19L);
        assertThat(total).isLessThanOrEqualTo(20L);
    }

    private Callable<Boolean> demande(Long seanceId, String email, CountDownLatch depart) {
        return () -> {
            depart.await(5, TimeUnit.SECONDS);
            try {
                reservationService.creer(new ReservationRequest(seanceId, email, 4));
                return true;
            } catch (CapaciteInsuffisanteException ex) {
                return false;
            }
        };
    }

    private Seance creerSeance(int capacite) {
        Film film = filmRepository.findAll().getFirst();
        Salle salle = salleRepository.saveAndFlush(new Salle("Salle CC " + UUID.randomUUID(), capacite));
        return seanceRepository.saveAndFlush(new Seance(
                film, salle, LocalDateTime.now().plusDays(6), new BigDecimal("12.00")));
    }
}
