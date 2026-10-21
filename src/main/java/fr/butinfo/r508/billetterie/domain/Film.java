package fr.butinfo.r508.billetterie.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "film")
public class Film {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(nullable = false, length = 80)
    private String genre;

    @Column(name = "duree_minutes", nullable = false)
    private int dureeMinutes;

    @Column(name = "date_sortie", nullable = false)
    private LocalDate dateSortie;

    @Column(name = "affiche_url", length = 512)
    private String afficheUrl;

    @Column(name = "bandeau_url", length = 512)
    private String bandeauUrl;

    @Column(name = "bande_annonce_cle", length = 32)
    private String bandeAnnonceCle;

    @Column(columnDefinition = "text")
    private String synopsis;

    @Column(precision = 3, scale = 1)
    private BigDecimal note;

    protected Film() {
    }

    public Film(String titre, String genre, int dureeMinutes, LocalDate dateSortie) {
        this(titre, genre, dureeMinutes, dateSortie, null, null, null, null, null);
    }

    public Film(String titre, String genre, int dureeMinutes, LocalDate dateSortie,
                String afficheUrl, String bandeauUrl, String bandeAnnonceCle,
                String synopsis, BigDecimal note) {
        this.titre = titre;
        this.genre = genre;
        this.dureeMinutes = dureeMinutes;
        this.dateSortie = dateSortie;
        this.afficheUrl = afficheUrl;
        this.bandeauUrl = bandeauUrl;
        this.bandeAnnonceCle = bandeAnnonceCle;
        this.synopsis = synopsis;
        this.note = note;
    }

    public Long getId() {
        return id;
    }

    public String getTitre() {
        return titre;
    }

    public String getGenre() {
        return genre;
    }

    public int getDureeMinutes() {
        return dureeMinutes;
    }

    public LocalDate getDateSortie() {
        return dateSortie;
    }

    public String getAfficheUrl() {
        return afficheUrl;
    }

    public String getBandeauUrl() {
        return bandeauUrl;
    }

    public String getBandeAnnonceCle() {
        return bandeAnnonceCle;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public BigDecimal getNote() {
        return note;
    }
}
