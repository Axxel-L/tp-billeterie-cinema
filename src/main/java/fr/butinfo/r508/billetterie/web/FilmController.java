package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.FilmService;
import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;
import fr.butinfo.r508.billetterie.web.dto.FilmResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/films")
@Tag(name = "Films")
public class FilmController {

    private final FilmService filmService;

    public FilmController(FilmService filmService) {
        this.filmService = filmService;
    }

    @GetMapping
    @Operation(summary = "Lister les films", description = "Public. Filtres optionnels et insensibles à la casse.")
    @ApiResponse(responseCode = "200", description = "Liste des films")
    public List<FilmResponse> lister(@RequestParam(required = false) String titre,
                                     @RequestParam(required = false) String genre) {
        return filmService.rechercher(titre, genre);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter un film", description = "Public.")
    @ApiResponse(responseCode = "200", description = "Film trouvé")
    @ApiResponse(responseCode = "404", description = "Film introuvable")
    public FilmResponse trouver(@PathVariable Long id) {
        return filmService.trouver(id);
    }

    @GetMapping("/{id}/media")
    @Operation(summary = "Affiche, bannière et bande-annonce d'un film",
            description = "Public. Nécessite la variable d'environnement TMDB_API_KEY ; renvoie des champs vides sinon.")
    @ApiResponse(responseCode = "200", description = "Médias du film (éventuellement vides)")
    @ApiResponse(responseCode = "404", description = "Film introuvable")
    public FilmMediaResponse media(@PathVariable Long id) {
        return filmService.media(id);
    }
}
