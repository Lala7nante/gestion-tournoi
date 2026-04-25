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

    /** Liste des buts du match — ignorée dans le JSON (chargée séparément) */
    @JsonIgnore
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<But> buts = new ArrayList<>();

    /**
     * Équipe domicile — on expose le groupe (nom: A/B/C/D) dans le JSON
     * mais on ignore les joueurs pour alléger la réponse.
     * IMPORTANT: "groupe" ne doit PAS être dans cette liste pour que
     * le tirage automatique des quarts de finale fonctionne.
     */
    @ManyToOne
    @JoinColumn(name = "equipe_domicile_id", nullable = false)
    @JsonIgnoreProperties({"joueurs"})
    private Equipe equipeDomicile;

    /**
     * Équipe extérieure — même logique que equipeDomicile.
     */
    @ManyToOne
    @JoinColumn(name = "equipe_exterieur_id", nullable = false)
    @JsonIgnoreProperties({"joueurs"})
    private Equipe equipeExterieur;

    /** Score de l'équipe domicile à la fin du temps réglementaire */
    private int scoreDomicile = 0;

    /** Score de l'équipe extérieure à la fin du temps réglementaire */
    private int scoreExterieur = 0;

    /** Indique si le match s'est joué en prolongation */
    private boolean prolongation = false;

    /** Score domicile en prolongation */
    private int scoreProlDomicile = 0;

    /** Score extérieur en prolongation */
    private int scoreProlExterieur = 0;

    /** Indique si le match s'est joué aux tirs au but */
    private boolean penalty = false;

    /** Score domicile aux tirs au but */
    private int scorePenDomicile = 0;

    /** Score extérieur aux tirs au but */
    private int scorePenExterieur = 0;

    /** Date du match */
    @Column(name = "date_match")
    private LocalDate dateMatch;

    /** Lieu / stade du match */
    private String lieu;

    /** Phase du tournoi (GROUPE, QUART, DEMI, TROISIEME, FINALE) */
    @Enumerated(EnumType.STRING)
    private Phase phase;

    /** Statut du match (PREVU ou TERMINE) */
    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.PREVU;

    // ---- Statistiques équipe domicile ----
    private int tirsDomicile = 0;
    private int tirsCadresDomicile = 0;
    private int possessionDomicile = 50;
    private int passesDomicile = 0;
    private int fautesDomicile = 0;
    private int cartonsJaunesDomicile = 0;
    private int cartonsRougesDomicile = 0;
    private int cornersDomicile = 0;
    private int horsJeuDomicile = 0;

    // ---- Statistiques équipe extérieure ----
    private int tirsExterieur = 0;
    private int tirsCadresExterieur = 0;
    private int possessionExterieur = 50;
    private int passesExterieur = 0;
    private int fautesExterieur = 0;
    private int cartonsJaunesExterieur = 0;
    private int cartonsRougesExterieur = 0;
    private int cornersExterieur = 0;
    private int horsJeuExterieur = 0;

    /** Phases possibles du tournoi */
    public enum Phase {
        GROUPE, ROUND_16, QUART, DEMI, TROISIEME, FINALE
    }

    /** Statuts possibles d'un match */
    public enum Statut {
        PREVU, TERMINE
    }
}