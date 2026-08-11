package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "equipe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String ville;

    private String coach;

    // COUPE — nullable 
    @ManyToOne
    @JoinColumn(name = "groupe_id", nullable = true)
    @JsonIgnoreProperties({"equipes", "tournoi"})
    private Groupe groupe;

    // LIGUE 
    @ManyToOne
    @JoinColumn(name = "tournoi_id", nullable = true)
    @JsonIgnoreProperties({"equipes", "groupes"})
    private Tournoi tournoi;

    @JsonIgnore
    @OneToMany(mappedBy = "equipe")
    private List<Joueur> joueurs;
}