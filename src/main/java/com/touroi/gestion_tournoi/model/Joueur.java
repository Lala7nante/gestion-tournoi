package com.touroi.gestion_tournoi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "joueur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Joueur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private int age;

    @Enumerated(EnumType.STRING)
    private Poste poste;

    @ManyToOne
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    public enum Poste {
        GARDIEN, DEFENSEUR, MILIEU, ATTAQUANT
    }
}