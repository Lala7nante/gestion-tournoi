package com.touroi.gestion_tournoi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    @ManyToOne
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    private int points = 0;
    private int victoires = 0;
    private int nuls = 0;
    private int defaites = 0;
    private int butsMarques = 0;
    private int butsEncaisses = 0;

    // Calculé: butsMarques - butsEncaisses
    public int getDifferenceButs() {
        return butsMarques - butsEncaisses;
    }
}