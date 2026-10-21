package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.ReservationService;
import fr.butinfo.r508.billetterie.web.dto.ReservationClientResponse;
import fr.butinfo.r508.billetterie.web.dto.ReservationRequest;
import fr.butinfo.r508.billetterie.web.dto.ReservationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@Tag(name = "Réservations")
@SecurityRequirement(name = "basicAuth")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @Operation(summary = "Créer une réservation",
            description = "CLIENT ou ADMIN. La capacité est vérifiée sous verrou pessimiste.")
    @ApiResponse(responseCode = "201", description = "Réservation confirmée")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "404", description = "Séance introuvable")
    @ApiResponse(responseCode = "409", description = "Capacité insuffisante")
    public ResponseEntity<ReservationResponse> creer(@Valid @RequestBody ReservationRequest requete,
                                                     Authentication authentification) {
        ReservationResponse reservation = reservationService.creer(requete, authentification.getName());
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/reservations/{code}").buildAndExpand(reservation.code()).toUri())
                .body(reservation);
    }

    @GetMapping("/mes-reservations")
    @Operation(summary = "Mes réservations à venir",
            description = "CLIENT ou ADMIN. Retourne le code, la séance, les places et le montant.")
    @ApiResponse(responseCode = "200", description = "Réservations confirmées à venir")
    public List<ReservationClientResponse> mesReservations(Authentication authentification) {
        return reservationService.mesReservations(authentification.getName());
    }

    @DeleteMapping("/{code}")
    @Operation(summary = "Annuler une réservation",
            description = "CLIENT propriétaire ou ADMIN. Idempotent : 204 si déjà annulée.")
    @ApiResponse(responseCode = "204", description = "Réservation annulée")
    @ApiResponse(responseCode = "404", description = "Code inconnu")
    public ResponseEntity<Void> annuler(@PathVariable String code, Authentication authentification) {
        boolean administrateur = authentification.getAuthorities().stream()
                .anyMatch(autorite -> "ROLE_ADMIN".equals(autorite.getAuthority()));
        reservationService.annuler(code, authentification.getName(), administrateur);
        return ResponseEntity.noContent().build();
    }
}
