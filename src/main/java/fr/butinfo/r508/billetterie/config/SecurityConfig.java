package fr.butinfo.r508.billetterie.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String HASH_CLIENT =
            "$2a$10$OOxf0dhDM.NhSjEgcYlVSeiRXFw/2fNkHcTV0/7KbmQ6yKxp7k0IW";
    private static final String HASH_PROGRAMMATEUR =
            "$2a$10$S4ep4Nv2UL543/QTKSWlcudz34TWevk43i1L67a7CiL2RlEFHB.rG";
    private static final String HASH_ADMIN =
            "$2a$10$VErmXXNCLnhILCkJCl7wJO0QYoMDjxBk9O/h9G/CaUUmb7u2BIZX.";

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encodeur) {
        UserDetails client = User.withUsername("client")
                .password(HASH_CLIENT)
                .roles("CLIENT")
                .build();
        UserDetails programmateur = User.withUsername("programmateur")
                .password(HASH_PROGRAMMATEUR)
                .roles("PROGRAMMATEUR")
                .build();
        UserDetails admin = User.withUsername("admin")
                .password(HASH_ADMIN)
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(client, programmateur, admin);
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("""
                ROLE_ADMIN > ROLE_PROGRAMMATEUR
                ROLE_ADMIN > ROLE_CLIENT
                """);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(autorisations -> autorisations
                        .requestMatchers(HttpMethod.GET,
                                "/api/films", "/api/films/**",
                                "/api/seances", "/api/seances/**",
                                "/api/salles").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/v3/api-docs", "/v3/api-docs/**",
                                "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .requestMatchers("/", "/index.html", "/assets/**", "/liquidglass/**",
                                "/favicon.ico", "/favicon.svg", "/error",
                                "/films", "/seances", "/reservation", "/admin").permitAll()
                        .requestMatchers("/api/programmation/**")
                        .hasAnyRole("PROGRAMMATEUR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservations/mes-reservations")
                        .hasAnyRole("CLIENT", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reservations").hasAnyRole("CLIENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reservations/**").hasAnyRole("CLIENT", "ADMIN")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}
