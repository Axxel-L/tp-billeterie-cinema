package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.SalleService;
import fr.butinfo.r508.billetterie.web.dto.SalleRequest;
import fr.butinfo.r508.billetterie.web.dto.SalleResponse;
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

@RestController
@RequestMapping("/api/admin/salles")
@Tag(name = "Administration")
@SecurityRequirement(name = "basicAuth")
public class SalleController {

    private final SalleService salleService;

    public SalleController(SalleService salleService) {
        this.salleService = salleService;
    }

    @PostMapping
    @Operation(summary = "Créer une salle", description = "ADMIN uniquement")
    @ApiResponse(responseCode = "201", description = "Salle créée")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "409", description = "Nom de salle déjà utilisé")
    public ResponseEntity<SalleResponse> creer(@Valid @RequestBody SalleRequest requete) {
        SalleResponse salle = salleService.creer(requete);
        return ResponseEntity
                .created(java.net.URI.create("/api/admin/salles/" + salle.id()))
                .body(salle);
    }
}
