package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Entité représentant un groupe dans le tournoi.
 * Un groupe contient 4 équipes (ex: Groupe A, Groupe B, ...).
 * Le nom du groupe est un caractère unique : A, B, C ou D.
 */
@Entity
@Table(name = "groupe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groupe {

    /** Identifiant unique du groupe (généré automatiquement) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Lettre du groupe (A, B, C ou D).
     * Généré automatiquement à la création du tournoi.
     */
    @Column(nullable = false, length = 1)
    private Character nom;

    /**
     * Tournoi auquel appartient ce groupe.
     * On ignore les sous-relations du tournoi (groupes) pour éviter
     * les boucles infinies de sérialisation JSON.
     */
    @ManyToOne
    @JoinColumn(name = "tournoi_id", nullable = false)
    @JsonIgnoreProperties({"groupes"})
    private Tournoi tournoi;

    /**
     * Liste des équipes appartenant à ce groupe.
     * Ignorée dans le JSON pour éviter les boucles infinies
     * (Groupe → Equipe → Groupe → ...).
     */
    @JsonIgnore
    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL)
    private List<Equipe> equipes;
}