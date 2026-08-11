package com.touroi.gestion_tournoi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "tournoi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tournoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String description;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    // nullable = true satria LIGUE tsy mila nbGroupes
    @Column(name = "nb_groupes", nullable = true)
    private Integer nbGroupes;

    @Enumerated(EnumType.STRING)
    private StatutTournoi statut = StatutTournoi.EN_COURS;

    // COUPE na LIGUE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeTournoi type = TypeTournoi.COUPE;

    // LIGUE fields
    @Column(nullable = true)
    private String saison;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_match", nullable = true)
    private TypeMatch typeMatch;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "tournoi", fetch = FetchType.LAZY)
    private List<Groupe> groupes;

    public enum StatutTournoi {
        EN_COURS, TERMINE
    }

    public enum TypeTournoi {
        COUPE, LIGUE
    }

    public enum TypeMatch {
        ALLER_SIMPLE, ALLER_RETOUR
    }
}