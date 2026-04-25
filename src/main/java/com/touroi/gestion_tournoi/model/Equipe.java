package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Entité représentant une équipe de football dans le tournoi.
 * Chaque équipe appartient à un groupe (A, B, C ou D).
 */
@Entity
@Table(name = "equipe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipe {

    /** Identifiant unique de l'équipe (généré automatiquement) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nom de l'équipe (ex: "Brighton & Hove Albion") */
    @Column(nullable = false)
    private String nom;

    /** Ville de l'équipe */
    private String ville;

    /** Nom du coach de l'équipe */
    private String coach;

    /**
     * Groupe auquel appartient l'équipe (A, B, C ou D).
     * On expose le groupe dans le JSON mais on ignore ses sous-relations
     * (equipes et tournoi) pour éviter les boucles infinies de sérialisation.
     */
    @ManyToOne
    @JoinColumn(name = "groupe_id", nullable = false)
    @JsonIgnoreProperties({"equipes", "tournoi"})
    private Groupe groupe;

    /**
     * Liste des joueurs appartenant à cette équipe.
     * Ignorée dans le JSON pour alléger les réponses API.
     */
    @JsonIgnore
    @OneToMany(mappedBy = "equipe")
    private List<Joueur> joueurs;
}