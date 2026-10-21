package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.SeanceService;
import fr.butinfo.r508.billetterie.web.dto.SeanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/seances")
@Tag(name = "Séances")
public class SeanceController {

    private final SeanceService seanceService;

    public SeanceController(SeanceService seanceService) {
        this.seanceService = seanceService;
    }

    @GetMapping
    @Operation(summary = "Lister les séances d'une période",
            description = "Public. Bornes ISO incluses, par défaut aujourd'hui → +7 jours.")
    @ApiResponse(responseCode = "200", description = "Séances de la période")
    public List<SeanceResponse> lister(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate du,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate au) {
        return seanceService.lister(du, au);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter une séance", description = "Public. Inclut les places restantes.")
    @ApiResponse(responseCode = "200", description = "Séance trouvée")
    @ApiResponse(responseCode = "404", description = "Séance introuvable")
    public SeanceResponse trouver(@PathVariable Long id) {
        return seanceService.trouver(id);
    }
}
