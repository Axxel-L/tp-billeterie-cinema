package fr.butinfo.r508.billetterie.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.butinfo.r508.billetterie.config.TmdbProperties;
import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);
    private static final Duration DUREE_CACHE = Duration.ofHours(12);
    private static final Duration DUREE_CACHE_ECHEC = Duration.ofMinutes(10);

    private final RestClient restClient;
    private final String apiKey;
    private final String imageBaseUrl;
    private final Map<String, EntreeCache> cache = new ConcurrentHashMap<>();

    public MediaService(RestClient tmdbRestClient, TmdbProperties proprietes) {
        this.restClient = tmdbRestClient;
        this.apiKey = proprietes.apiKey();
        this.imageBaseUrl = proprietes.imageBaseUrl();
    }

    public FilmMediaResponse pourFilm(Film film) {
        if (apiKey.isBlank()) {
            return FilmMediaResponse.vide();
        }
        EntreeCache entree = cache.get(cleCache(film));
        if (entree != null && entree.expireLe().isAfter(Instant.now())) {
            return entree.media();
        }
        try {
            FilmMediaResponse media = rechercher(film);
            cache.put(cleCache(film), new EntreeCache(media, Instant.now().plus(DUREE_CACHE)));
            return media;
        } catch (RuntimeException ex) {
            log.warn("Médias indisponibles pour le film {} : {}", film.getId(), ex.getMessage());
            FilmMediaResponse vide = FilmMediaResponse.vide();
            cache.put(cleCache(film), new EntreeCache(vide, Instant.now().plus(DUREE_CACHE_ECHEC)));
            return vide;
        }
    }

    private String cleCache(Film film) {
        return film.getId() == null
                ? film.getTitre() + "|" + film.getDateSortie()
                : "id:" + film.getId();
    }

    private FilmMediaResponse rechercher(Film film) {
        String recherche = tmdb("/search/movie")
                .queryParam("query", film.getTitre())
                .queryParam("year", film.getDateSortie().getYear())
                .queryParam("language", "fr-FR")
                .queryParam("include_adult", false)
                .encode()
                .toUriString();

        TmdbRecherche resultat = get(recherche, TmdbRecherche.class);
        if (resultat == null || resultat.results() == null || resultat.results().isEmpty()) {
            return FilmMediaResponse.vide();
        }

        long tmdbId = resultat.results().getFirst().id();
        String detail = tmdb("/movie/" + tmdbId)
                .queryParam("language", "fr-FR")
                .queryParam("append_to_response", "videos")
                .encode()
                .toUriString();

        TmdbFilm fiche = get(detail, TmdbFilm.class);
        if (fiche == null) {
            return FilmMediaResponse.vide();
        }

        return new FilmMediaResponse(
                image(fiche.posterPath(), "w500"),
                image(fiche.backdropPath(), "w1280"),
                choisirBandeAnnonce(fiche.videos()),
                texte(fiche.overview()),
                fiche.voteAverage());
    }

    private UriComponentsBuilder tmdb(String chemin) {
        UriComponentsBuilder constructeur = UriComponentsBuilder.fromPath(chemin);
        if (!estJetonBearer()) {
            constructeur.queryParam("api_key", apiKey);
        }
        return constructeur;
    }

    private <T> T get(String uri, Class<T> type) {
        RestClient.RequestHeadersSpec<?> requete = restClient.get().uri(uri);
        if (estJetonBearer()) {
            requete = requete.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }
        return requete.retrieve().body(type);
    }

    private boolean estJetonBearer() {
        return apiKey.startsWith("eyJ");
    }

    private String image(String chemin, String taille) {
        if (chemin == null || chemin.isBlank()) {
            return null;
        }
        return imageBaseUrl + "/" + taille + chemin;
    }

    private String choisirBandeAnnonce(TmdbVideos videos) {
        if (videos == null || videos.results() == null) {
            return null;
        }
        return videos.results().stream()
                .filter(video -> "YouTube".equalsIgnoreCase(video.site()))
                .filter(video -> video.key() != null && !video.key().isBlank())
                .filter(video -> {
                    String type = video.type() == null ? "" : video.type().toLowerCase(Locale.ROOT);
                    return type.equals("trailer") || type.equals("teaser");
                })
                .sorted((a, b) -> Boolean.compare(b.official(), a.official()))
                .map(TmdbVideo::key)
                .findFirst()
                .orElse(null);
    }

    private String texte(String valeur) {
        return valeur == null || valeur.isBlank() ? null : valeur;
    }

    private record EntreeCache(FilmMediaResponse media, Instant expireLe) {
    }

    private record TmdbRecherche(List<TmdbResultat> results) {
    }

    private record TmdbResultat(long id) {
    }

    private record TmdbFilm(
            String overview,
            @JsonProperty("poster_path") String posterPath,
            @JsonProperty("backdrop_path") String backdropPath,
            @JsonProperty("vote_average") Double voteAverage,
            TmdbVideos videos
    ) {
    }

    private record TmdbVideos(List<TmdbVideo> results) {
    }

    private record TmdbVideo(String key, String site, String type, boolean official) {
    }
}
