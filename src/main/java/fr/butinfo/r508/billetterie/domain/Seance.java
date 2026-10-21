package fr.butinfo.r508.billetterie.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seance")
public class Seance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @Column(nullable = false)
    private LocalDateTime debut;

    @Column(name = "prix_unitaire", nullable = false, precision = 8, scale = 2)
    private BigDecimal prixUnitaire;

    protected Seance() {
    }

    public Seance(Film film, Salle salle, LocalDateTime debut, BigDecimal prixUnitaire) {
        this.film = film;
        this.salle = salle;
        this.debut = debut;
        this.prixUnitaire = prixUnitaire;
    }

    public Long getId() {
        return id;
    }

    public Film getFilm() {
        return film;
    }

    public Salle getSalle() {
        return salle;
    }

    public LocalDateTime getDebut() {
        return debut;
    }

    public BigDecimal getPrixUnitaire() {
        return prixUnitaire;
    }
}
