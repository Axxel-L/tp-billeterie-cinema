package fr.butinfo.r508.billetterie.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.butinfo.r508.billetterie.config.TmdbProperties;
import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.error.ReferenceInvalideException;
import fr.butinfo.r508.billetterie.error.TmdbNonConfigureException;
import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;
import fr.butinfo.r508.billetterie.web.dto.FilmRechercheResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
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
        if (film.getAfficheUrl() != null || film.getBandeAnnonceCle() != null) {
            String site = film.getBandeAnnonceSite();
            if (site == null && film.getBandeAnnonceCle() != null) {
                site = "YouTube";
            }
            return new FilmMediaResponse(
                    film.getAfficheUrl(),
                    film.getBandeauUrl(),
                    site,
                    film.getBandeAnnonceCle(),
                    film.getSynopsis(),
                    film.getNote() == null ? null : film.getNote().doubleValue());
        }
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

    public boolean estConfigure() {
        return !apiKey.isBlank();
    }

    public List<FilmRechercheResponse> rechercherFilms(String titre) {
        verifierCle();
        String uri = tmdb("/search/movie")
                .queryParam("query", titre)
                .queryParam("language", "fr-FR")
                .queryParam("include_adult", false)
                .queryParam("page", 1)
                .encode()
                .toUriString();

        TmdbRecherche recherche = get(uri, TmdbRecherche.class);
        if (recherche == null || recherche.results() == null) {
            return List.of();
        }
        return recherche.results().stream()
                .limit(12)
                .map(resultat -> new FilmRechercheResponse(
                        resultat.id(),
                        resultat.title(),
                        annee(resultat.releaseDate()),
                        image(resultat.posterPath(), "w342"),
                        texte(resultat.overview())))
                .toList();
    }

    public FilmTmdbDetail detailFilm(long tmdbId) {
        verifierCle();
        String uri = tmdb("/movie/" + tmdbId)
                .queryParam("language", "fr-FR")
                .queryParam("append_to_response", "videos")
                .encode()
                .toUriString();

        TmdbFilm fiche = get(uri, TmdbFilm.class);
        if (fiche == null || fiche.title() == null || fiche.title().isBlank()) {
            throw new ReferenceInvalideException("FILM_INTROUVABLE", "Film TMDB introuvable");
        }

        int duree = fiche.runtime() == null ? 0 : fiche.runtime();
        if (duree < 40 || duree > 300) {
            throw new ReferenceInvalideException("DUREE_INVALIDE",
                    "Durée TMDB invalide pour ce film (" + duree + " min)");
        }

        LocalDate sortie = LocalDate.now();
        if (fiche.releaseDate() != null && fiche.releaseDate().length() >= 10) {
            sortie = LocalDate.parse(fiche.releaseDate().substring(0, 10));
        }

        String genre = fiche.genres() == null || fiche.genres().isEmpty()
                ? "Film"
                : fiche.genres().getFirst().name();

        FilmMediaResponse media = new FilmMediaResponse(
                image(fiche.posterPath(), "w500"),
                image(fiche.backdropPath(), "w1280"),
                videoSite(fiche.videos()),
                videoCle(fiche.videos()),
                texte(fiche.overview()),
                fiche.voteAverage());

        return new FilmTmdbDetail(tmdbId, fiche.title().trim(), genre, duree, sortie, media);
    }

    private void verifierCle() {
        if (apiKey.isBlank()) {
            throw new TmdbNonConfigureException();
        }
    }

    private Integer annee(String date) {
        if (date == null || date.length() < 4) {
            return null;
        }
        try {
            return Integer.parseInt(date.substring(0, 4));
        } catch (NumberFormatException ex) {
            return null;
        }
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
                videoSite(fiche.videos()),
                videoCle(fiche.videos()),
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

    private VideoChoisie choisirVideo(TmdbVideos videos) {
        if (videos == null || videos.results() == null) {
            return null;
        }
        return videos.results().stream()
                .filter(video -> video.site() != null && !video.site().isBlank())
                .filter(video -> video.key() != null && !video.key().isBlank())
                .filter(video -> {
                    String type = video.type() == null ? "" : video.type().toLowerCase(Locale.ROOT);
                    return type.equals("trailer") || type.equals("teaser");
                })
                .sorted(Comparator
                        .comparing((TmdbVideo video) -> "YouTube".equalsIgnoreCase(video.site()))
                        .thenComparing(video -> !video.official())
                        .thenComparing(TmdbVideo::site))
                .map(video -> new VideoChoisie(video.site(), video.key()))
                .findFirst()
                .orElse(null);
    }

    private String videoSite(TmdbVideos videos) {
        VideoChoisie video = choisirVideo(videos);
        return video == null ? null : video.site();
    }

    private String videoCle(TmdbVideos videos) {
        VideoChoisie video = choisirVideo(videos);
        return video == null ? null : video.cle();
    }

    private String texte(String valeur) {
        return valeur == null || valeur.isBlank() ? null : valeur;
    }

    private record VideoChoisie(String site, String cle) {
    }

    private record EntreeCache(FilmMediaResponse media, Instant expireLe) {
    }

    private record TmdbRecherche(List<TmdbResultat> results) {
    }

    private record TmdbResultat(
            long id,
            String title,
            @JsonProperty("release_date") String releaseDate,
            @JsonProperty("poster_path") String posterPath,
            String overview
    ) {
    }

    private record TmdbFilm(
            String title,
            Integer runtime,
            @JsonProperty("release_date") String releaseDate,
            List<TmdbGenre> genres,
            String overview,
            @JsonProperty("poster_path") String posterPath,
            @JsonProperty("backdrop_path") String backdropPath,
            @JsonProperty("vote_average") Double voteAverage,
            TmdbVideos videos
    ) {
    }

    private record TmdbGenre(String name) {
    }

    private record TmdbVideos(List<TmdbVideo> results) {
    }

    private record TmdbVideo(String key, String site, String type, boolean official) {
    }
}
