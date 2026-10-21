package fr.butinfo.r508.billetterie.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI billetterieOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Billetterie de cinéma")
                        .version("1.0.0")
                        .description("""
                                API de programmation et de réservation.
                                Lectures publiques, écritures protégées par HTTP Basic.
                                Rôles : CLIENT, PROGRAMMATEUR, ADMIN.
                                """))
                .components(new Components().addSecuritySchemes("basicAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("basic")));
    }
}
