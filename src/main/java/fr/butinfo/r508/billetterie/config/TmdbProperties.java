package fr.butinfo.r508.billetterie.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.tmdb")
public record TmdbProperties(String apiKey, String baseUrl, String imageBaseUrl) {

    public TmdbProperties {
        apiKey = apiKey == null ? "" : apiKey.trim();
        baseUrl = baseUrl == null || baseUrl.isBlank()
                ? "https://api.themoviedb.org/3"
                : baseUrl;
        imageBaseUrl = imageBaseUrl == null || imageBaseUrl.isBlank()
                ? "https://image.tmdb.org/t/p"
                : imageBaseUrl;
    }
}
