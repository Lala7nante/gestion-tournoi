package com.touroi.gestion_tournoi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "statistique")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Statistique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "joueur_id", nullable = false)
    private Joueur joueur;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private MatchFootball match;

    private int buts = 0;
    private int passesDecisives = 0;
    private int cartonsJaunes = 0;
    private int cartonsRouges = 0;
    private int minutesJouees = 0;
}