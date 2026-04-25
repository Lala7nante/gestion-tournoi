package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "buts")
public class But {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id")
    @JsonIgnoreProperties({"equipeDomicile", "equipeExterieur", "buts", "statistiques",
        "tirsDomicile","tirsCadresDomicile","possessionDomicile","passesDomicile",
        "fautesDomicile","cartonsJaunesDomicile","cartonsRougesDomicile","cornersDomicile",
        "horsJeuDomicile","tirsExterieur","tirsCadresExterieur","possessionExterieur",
        "passesExterieur","fautesExterieur","cartonsJaunesExterieur","cartonsRougesExterieur",
        "cornersExterieur","horsJeuExterieur","scoreProlDomicile","scoreProlExterieur",
        "scorePenDomicile","scorePenExterieur"})
    private MatchFootball match;

    @ManyToOne
    @JoinColumn(name = "buteur_id")
    @JsonIgnoreProperties({"statistiques"})
    private Joueur buteur;

    @ManyToOne
    @JoinColumn(name = "passeur_id", nullable = true)
    @JsonIgnoreProperties({"statistiques"})
    private Joueur passeur;

    private int minute;

    @Enumerated(EnumType.STRING)
    private TypeBut type = TypeBut.NORMAL;

    public enum TypeBut { NORMAL, PENALTY, CSC }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MatchFootball getMatch() { return match; }
    public void setMatch(MatchFootball match) { this.match = match; }
    public Joueur getButeur() { return buteur; }
    public void setButeur(Joueur buteur) { this.buteur = buteur; }
    public Joueur getPasseur() { return passeur; }
    public void setPasseur(Joueur passeur) { this.passeur = passeur; }
    public int getMinute() { return minute; }
    public void setMinute(int minute) { this.minute = minute; }
    public TypeBut getType() { return type; }
    public void setType(TypeBut type) { this.type = type; }
}