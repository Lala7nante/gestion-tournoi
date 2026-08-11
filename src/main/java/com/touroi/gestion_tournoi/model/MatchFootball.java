package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "match_football")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchFootball {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<But> buts = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "equipe_domicile_id", nullable = false)
    @JsonIgnoreProperties({"joueurs"})
    private Equipe equipeDomicile;

    @ManyToOne
    @JoinColumn(name = "equipe_exterieur_id", nullable = false)
    @JsonIgnoreProperties({"joueurs"})
    private Equipe equipeExterieur;

    // ---- Ligue ----
    @ManyToOne
    @JoinColumn(name = "tournoi_id")
    @JsonIgnoreProperties({"joueurs", "equipes", "groupes"})
    private Tournoi tournoi;

    private Integer journee; // 1, 2, 3... pour la ligue

    // ---- Scores ----
    private int scoreDomicile = 0;
    private int scoreExterieur = 0;
    private boolean prolongation = false;
    private int scoreProlDomicile = 0;
    private int scoreProlExterieur = 0;
    private boolean penalty = false;
    private int scorePenDomicile = 0;
    private int scorePenExterieur = 0;

    @Column(name = "date_match")
    private LocalDate dateMatch;

    private String lieu;

    @Enumerated(EnumType.STRING)
    private Phase phase;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.PREVU;

    // ---- Stats domicile ----
    private int tirsDomicile = 0;
    private int tirsCadresDomicile = 0;
    private int possessionDomicile = 50;
    private int passesDomicile = 0;
    private int fautesDomicile = 0;
    private int cartonsJaunesDomicile = 0;
    private int cartonsRougesDomicile = 0;
    private int cornersDomicile = 0;
    private int horsJeuDomicile = 0;

    // ---- Stats extérieur ----
    private int tirsExterieur = 0;
    private int tirsCadresExterieur = 0;
    private int possessionExterieur = 50;
    private int passesExterieur = 0;
    private int fautesExterieur = 0;
    private int cartonsJaunesExterieur = 0;
    private int cartonsRougesExterieur = 0;
    private int cornersExterieur = 0;
    private int horsJeuExterieur = 0;

    public enum Phase {
        GROUPE, ROUND_16, QUART, DEMI, TROISIEME, FINALE, JOURNEE_LIGUE
    }

    public enum Statut {
        PREVU, TERMINE
    }
}