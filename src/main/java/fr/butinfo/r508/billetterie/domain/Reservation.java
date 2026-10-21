package fr.butinfo.r508.billetterie.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seance_id", nullable = false)
    private Seance seance;

    @Column(name = "email_client", nullable = false, length = 254)
    private String emailClient;

    @Column(name = "client_username", length = 80)
    private String clientUsername;

    @Column(name = "nombre_places", nullable = false)
    private int nombrePlaces;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutReservation statut;

    @Column(name = "creee_le", nullable = false)
    private LocalDateTime creeeLe;

    protected Reservation() {
    }

    public Reservation(String code, Seance seance, String emailClient, int nombrePlaces,
                       StatutReservation statut, LocalDateTime creeeLe) {
        this.code = code;
        this.seance = seance;
        this.emailClient = emailClient;
        this.nombrePlaces = nombrePlaces;
        this.statut = statut;
        this.creeeLe = creeeLe;
    }

    public void annuler() {
        this.statut = StatutReservation.ANNULEE;
    }

    public void assignerClient(String clientUsername) {
        this.clientUsername = clientUsername;
    }

    public String getClientUsername() {
        return clientUsername;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public Seance getSeance() {
        return seance;
    }

    public String getEmailClient() {
        return emailClient;
    }

    public int getNombrePlaces() {
        return nombrePlaces;
    }

    public StatutReservation getStatut() {
        return statut;
    }

    public LocalDateTime getCreeeLe() {
        return creeeLe;
    }
}
