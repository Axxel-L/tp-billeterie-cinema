package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.domain.Reservation;
import fr.butinfo.r508.billetterie.domain.Salle;
import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import fr.butinfo.r508.billetterie.error.CapaciteInsuffisanteException;
import fr.butinfo.r508.billetterie.error.ReservationIntrouvableException;
import fr.butinfo.r508.billetterie.repository.ReservationRepository;
import fr.butinfo.r508.billetterie.repository.SeanceRepository;
import fr.butinfo.r508.billetterie.web.dto.ReservationRequest;
import fr.butinfo.r508.billetterie.web.dto.ReservationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private SeanceRepository seanceRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Seance seance;

    @BeforeEach
    void initialiser() {
        Film film = new Film("Parasite", "Thriller", 132, LocalDate.of(2019, 5, 30));
        Salle salle = new Salle("Salle Lumière", 20);
        seance = new Seance(film, salle, LocalDateTime.now().plusDays(2), new BigDecimal("11.50"));
    }

    @Test
    void calculeLeMontantTotalCoteServeur() {
        when(seanceRepository.findByIdForUpdate(anyLong())).thenReturn(Optional.of(seance));
        when(reservationRepository.sommePlaces(any(), any())).thenReturn(10L);
        when(reservationRepository.existsByCode(any())).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservationResponse reponse = reservationService.creer(
                new ReservationRequest(1L, "lea@example.test", 3));

        assertThat(reponse.code()).startsWith("RES-").hasSize(16);
        assertThat(reponse.statut()).isEqualTo(StatutReservation.CONFIRMEE);
        assertThat(reponse.nombrePlaces()).isEqualTo(3);
        assertThat(reponse.montantTotal()).isEqualByComparingTo("34.50");
    }

    @Test
    void refuseUneReservationAuDelaDeLaCapacite() {
        when(seanceRepository.findByIdForUpdate(anyLong())).thenReturn(Optional.of(seance));
        when(reservationRepository.sommePlaces(any(), any())).thenReturn(17L);

        assertThatThrownBy(() -> reservationService.creer(
                new ReservationRequest(1L, "lea@example.test", 4)))
                .isInstanceOf(CapaciteInsuffisanteException.class)
                .hasMessageContaining("3 place");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void annuleUneReservationConfirmee() {
        Reservation reservation = new Reservation("RES-TEST123456",
                seance, "lea@example.test", 2, StatutReservation.CONFIRMEE, LocalDateTime.now());
        when(reservationRepository.findByCode("RES-TEST123456")).thenReturn(Optional.of(reservation));

        reservationService.annuler("RES-TEST123456");

        assertThat(reservation.getStatut()).isEqualTo(StatutReservation.ANNULEE);
    }

    @Test
    void annulationDejaEffectueeEstIdempotente() {
        Reservation reservation = new Reservation("RES-TEST123456",
                seance, "lea@example.test", 2, StatutReservation.ANNULEE, LocalDateTime.now());
        when(reservationRepository.findByCode("RES-TEST123456")).thenReturn(Optional.of(reservation));

        reservationService.annuler("RES-TEST123456");

        assertThat(reservation.getStatut()).isEqualTo(StatutReservation.ANNULEE);
    }

    @Test
    void annulationDUnCodeInconnuRenvoie404() {
        when(reservationRepository.findByCode("RES-INCONNU")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.annuler("RES-INCONNU"))
                .isInstanceOf(ReservationIntrouvableException.class);
    }
}
