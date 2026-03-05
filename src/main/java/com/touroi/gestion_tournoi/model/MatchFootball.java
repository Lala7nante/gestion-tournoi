package com.touroi.gestion_tournoi.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "match_football")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchFootball {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipe_domicile_id", nullable = false)
    private Equipe equipeDomicile;

    @ManyToOne
    @JoinColumn(name = "equipe_exterieur_id", nullable = false)
    private Equipe equipeExterieur;

    // Score 90 minutes
    private int scoreDomicile = 0;
    private int scoreExterieur = 0;

    // Prolongation
    private boolean prolongation = false;
    private int scoreProlDomicile = 0;
    private int scoreProlExterieur = 0;

    // Penalty
    private boolean penalty = false;
    private int scorePenDomicile = 0;
    private int scorePenExterieur = 0;

    @Column(name = "date_match", nullable = false)
    private LocalDate dateMatch;

    private String lieu;

    @Enumerated(EnumType.STRING)
    private Phase phase;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.PREVU;

    public enum Phase {
        GROUPE, ROUND_16, QUART, DEMI, TROISIEME, FINALE
    }

    public enum Statut {
        PREVU, TERMINE
    }
}
