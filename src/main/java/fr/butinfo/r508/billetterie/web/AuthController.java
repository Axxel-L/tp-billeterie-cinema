package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.web.dto.MeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification")
@SecurityRequirement(name = "basicAuth")
public class AuthController {

    @GetMapping("/me")
    @Operation(summary = "Identité et rôles de l'utilisateur courant")
    public MeResponse me(Authentication authentification) {
        List<String> roles = authentification.getAuthorities().stream()
                .map(Object::toString)
                .filter(autorite -> autorite.startsWith("ROLE_"))
                .toList();
        return new MeResponse(authentification.getName(), roles);
    }
}
