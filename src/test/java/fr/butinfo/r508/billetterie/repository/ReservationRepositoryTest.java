package fr.butinfo.r508.billetterie.repository;

import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.domain.Reservation;
import fr.butinfo.r508.billetterie.domain.Salle;
import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
class ReservationRepositoryTest {

    @Container
    @ServiceConnection
    static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.4");

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private SalleRepository salleRepository;

    @Autowired
    private SeanceRepository seanceRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private Seance seance;

    @BeforeEach
    void initialiser() {
        Film film = filmRepository.save(new Film("Film JPA", "Test", 100, LocalDate.of(2020, 1, 1)));
        Salle salle = salleRepository.save(new Salle("Salle JPA", 50));
        seance = seanceRepository.saveAndFlush(
                new Seance(film, salle, LocalDateTime.now().plusDays(1), new BigDecimal("10.00")));
    }

    @Test
    void sommeUniquementLesPlacesConfirmees() {
        reservationRepository.save(new Reservation("RES-JPA000000001", seance, "a@example.test", 3,
                StatutReservation.CONFIRMEE, LocalDateTime.now()));
        reservationRepository.save(new Reservation("RES-JPA000000002", seance, "b@example.test", 2,
                StatutReservation.CONFIRMEE, LocalDateTime.now()));
        reservationRepository.save(new Reservation("RES-JPA000000003", seance, "c@example.test", 4,
                StatutReservation.ANNULEE, LocalDateTime.now()));
        reservationRepository.flush();

        assertThat(reservationRepository.sommePlaces(seance.getId(), StatutReservation.CONFIRMEE))
                .isEqualTo(5L);
    }

    @Test
    void rechercheLesSeancesDansUnIntervalle() {
        List<Seance> trouvees = seanceRepository.findByPeriode(
                LocalDateTime.now(), LocalDateTime.now().plusDays(2));

        assertThat(trouvees).extracting(Seance::getId).contains(seance.getId());

        List<Seance> horsIntervalle = seanceRepository.findByPeriode(
                LocalDateTime.now().plusDays(10), LocalDateTime.now().plusDays(12));
        assertThat(horsIntervalle).extracting(Seance::getId).doesNotContain(seance.getId());
    }

    @Test
    void chargeLaSeanceAvecSesReferences() {
        Seance trouvee = seanceRepository.findByIdAvecReferences(seance.getId()).orElseThrow();

        assertThat(trouvee.getFilm().getTitre()).isEqualTo("Film JPA");
        assertThat(trouvee.getSalle().getNom()).isEqualTo("Salle JPA");
    }
}
