package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Film;
import fr.butinfo.r508.billetterie.error.FilmIntrouvableException;
import fr.butinfo.r508.billetterie.repository.FilmRepository;
import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;
import fr.butinfo.r508.billetterie.web.dto.FilmRequest;
import fr.butinfo.r508.billetterie.web.dto.FilmResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FilmService {

    private final FilmRepository filmRepository;
    private final MediaService mediaService;

    public FilmService(FilmRepository filmRepository, MediaService mediaService) {
        this.filmRepository = filmRepository;
        this.mediaService = mediaService;
    }

    @Transactional(readOnly = true)
    public List<FilmResponse> rechercher(String titre, String genre) {
        return filmRepository.rechercher(nettoyer(titre), nettoyer(genre)).stream()
                .map(FilmResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public FilmResponse trouver(Long id) {
        return filmRepository.findById(id)
                .map(FilmResponse::from)
                .orElseThrow(() -> new FilmIntrouvableException(id));
    }

    @Transactional(readOnly = true)
    public FilmMediaResponse media(Long id) {
        Film film = filmRepository.findById(id)
                .orElseThrow(() -> new FilmIntrouvableException(id));
        return mediaService.pourFilm(film);
    }

    @Transactional
    public FilmResponse creer(FilmRequest requete) {
        Film film = new Film(requete.titre().trim(), requete.genre().trim(),
                requete.dureeMinutes(), requete.dateSortie());
        return FilmResponse.from(filmRepository.save(film));
    }

    private String nettoyer(String valeur) {
        if (valeur == null) {
            return null;
        }
        String propre = valeur.trim();
        return propre.isEmpty() ? null : propre;
    }
}
