package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.config.TmdbProperties;
import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.error.TmdbNonConfigureException;
import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.http.HttpMethod.GET;
import static org.hamcrest.Matchers.containsString;

class MediaServiceTest {

    private static final Film PARASITE =
            new Film("Parasite", "Thriller", 132, LocalDate.of(2019, 5, 30));

    @Test
    void enrichitAfficheBanniereEtBandeAnnonce() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MockRestServiceServer serveur = MockRestServiceServer.bindTo(builder).build();
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("cle-test", "http://tmdb.test", "https://image.test"));

        serveur.expect(requestTo(containsString("/search/movie")))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {"results":[{"id":42}]}
                        """, MediaType.APPLICATION_JSON));

        serveur.expect(requestTo(containsString("/movie/42")))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "overview":"Toute la famille est au chômage.",
                          "poster_path":"/affiche.jpg",
                          "backdrop_path":"/bandeau.jpg",
                          "vote_average":8.5,
                          "videos":{"results":[
                            {"key":"teaser","site":"YouTube","type":"Teaser","official":false},
                            {"key":"trailer","site":"YouTube","type":"Trailer","official":true}
                          ]}
                        }
                        """, MediaType.APPLICATION_JSON));

        FilmMediaResponse media = service.pourFilm(PARASITE);

        assertThat(media.afficheUrl()).isEqualTo("https://image.test/w500/affiche.jpg");
        assertThat(media.bandeauUrl()).isEqualTo("https://image.test/w1280/bandeau.jpg");
        assertThat(media.bandeAnnonceCle()).isEqualTo("trailer");
        assertThat(media.synopsis()).contains("chômage");
        assertThat(media.note()).isEqualTo(8.5);
        serveur.verify();
    }

    @Test
    void renvoieDesChampsVidesSiLeFilmNEstPasTrouve() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MockRestServiceServer serveur = MockRestServiceServer.bindTo(builder).build();
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("cle-test", "http://tmdb.test", "https://image.test"));

        serveur.expect(requestTo(containsString("/search/movie")))
                .andRespond(withSuccess("""
                        {"results":[]}
                        """, MediaType.APPLICATION_JSON));

        FilmMediaResponse media = service.pourFilm(PARASITE);

        assertThat(media.afficheUrl()).isNull();
        assertThat(media.bandeAnnonceCle()).isNull();
        serveur.verify();
    }

    @Test
    void neContactePasTmdbSansCle() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MockRestServiceServer serveur = MockRestServiceServer.bindTo(builder).build();
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("", "http://tmdb.test", "https://image.test"));

        FilmMediaResponse media = service.pourFilm(PARASITE);

        assertThat(media).isEqualTo(FilmMediaResponse.vide());
        serveur.verify();
    }

    @Test
    void rechercheDesFilmsReels() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MockRestServiceServer serveur = MockRestServiceServer.bindTo(builder).build();
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("cle-test", "http://tmdb.test", "https://image.test"));

        serveur.expect(requestTo(containsString("/search/movie")))
                .andRespond(withSuccess("""
                        {"results":[
                          {"id":42,"title":"Parasite","release_date":"2019-05-30",
                           "poster_path":"/p.jpg","overview":"Thriller social."}
                        ]}
                        """, MediaType.APPLICATION_JSON));

        var resultats = service.rechercherFilms("Parasite");

        assertThat(resultats).hasSize(1);
        assertThat(resultats.getFirst().titre()).isEqualTo("Parasite");
        assertThat(resultats.getFirst().annee()).isEqualTo(2019);
        assertThat(resultats.getFirst().afficheUrl()).isEqualTo("https://image.test/w342/p.jpg");
    }

    @Test
    void construitUnFilmDepuisLeDetailTmdb() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MockRestServiceServer serveur = MockRestServiceServer.bindTo(builder).build();
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("cle-test", "http://tmdb.test", "https://image.test"));

        serveur.expect(requestTo(containsString("/movie/42")))
                .andRespond(withSuccess("""
                        {
                          "title":"Parasite",
                          "runtime":132,
                          "release_date":"2019-05-30",
                          "genres":[{"name":"Thriller"}],
                          "overview":"Thriller social.",
                          "poster_path":"/p.jpg",
                          "backdrop_path":"/b.jpg",
                          "vote_average":8.5,
                          "videos":{"results":[
                            {"key":"tr","site":"YouTube","type":"Trailer","official":true}
                          ]}
                        }
                        """, MediaType.APPLICATION_JSON));

        var detail = service.detailFilm(42);

        assertThat(detail.titre()).isEqualTo("Parasite");
        assertThat(detail.genre()).isEqualTo("Thriller");
        assertThat(detail.dureeMinutes()).isEqualTo(132);
        assertThat(detail.dateSortie()).isEqualTo(LocalDate.of(2019, 5, 30));
        assertThat(detail.media().afficheUrl()).isEqualTo("https://image.test/w500/p.jpg");
        assertThat(detail.media().bandeAnnonceSite()).isEqualTo("YouTube");
        assertThat(detail.media().bandeAnnonceCle()).isEqualTo("tr");
        serveur.verify();
    }

    @Test
    void rechercheRefuseeSansCle() {
        RestClient.Builder builder = RestClient.builder().baseUrl("http://tmdb.test");
        MediaService service = new MediaService(builder.build(),
                new TmdbProperties("", "http://tmdb.test", "https://image.test"));

        assertThatThrownBy(() -> service.rechercherFilms("Dune"))
                .isInstanceOf(TmdbNonConfigureException.class);
    }
}
