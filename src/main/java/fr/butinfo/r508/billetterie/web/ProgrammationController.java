package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.FilmService;
import fr.butinfo.r508.billetterie.service.SeanceService;
import fr.butinfo.r508.billetterie.web.dto.FilmRequest;
import fr.butinfo.r508.billetterie.web.dto.FilmResponse;
import fr.butinfo.r508.billetterie.web.dto.SeanceRequest;
import fr.butinfo.r508.billetterie.web.dto.SeanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/programmation")
@Tag(name = "Programmation")
@SecurityRequirement(name = "basicAuth")
public class ProgrammationController {

    private final FilmService filmService;
    private final SeanceService seanceService;

    public ProgrammationController(FilmService filmService, SeanceService seanceService) {
        this.filmService = filmService;
        this.seanceService = seanceService;
    }

    @PostMapping("/films")
    @Operation(summary = "Créer un film", description = "PROGRAMMATEUR ou ADMIN")
    @ApiResponse(responseCode = "201", description = "Film créé")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "401", description = "Authentification requise")
    @ApiResponse(responseCode = "403", description = "Rôle insuffisant")
    public ResponseEntity<FilmResponse> creerFilm(@Valid @RequestBody FilmRequest requete) {
        FilmResponse film = filmService.creer(requete);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/films/{id}").buildAndExpand(film.id()).toUri())
                .body(film);
    }

    @PostMapping("/seances")
    @Operation(summary = "Créer une séance", description = "PROGRAMMATEUR ou ADMIN")
    @ApiResponse(responseCode = "201", description = "Séance créée")
    @ApiResponse(responseCode = "400", description = "Données invalides ou film/salle inconnu")
    @ApiResponse(responseCode = "401", description = "Authentification requise")
    @ApiResponse(responseCode = "403", description = "Rôle insuffisant")
    public ResponseEntity<SeanceResponse> creerSeance(@Valid @RequestBody SeanceRequest requete) {
        SeanceResponse seance = seanceService.creer(requete);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/seances/{id}").buildAndExpand(seance.id()).toUri())
                .body(seance);
    }
}
