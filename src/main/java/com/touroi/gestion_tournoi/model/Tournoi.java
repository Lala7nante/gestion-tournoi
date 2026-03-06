package com.touroi.gestion_tournoi.model;

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

    @Column(name = "nb_groupes", nullable = false)
    private int nbGroupes;

    @Enumerated(EnumType.STRING)
    private StatutTournoi statut = StatutTournoi.EN_COURS;

    @ToString.Exclude
    @OneToMany(mappedBy = "tournoi", fetch = FetchType.LAZY)
    private List<Groupe> groupes;  

    public enum StatutTournoi {
        EN_COURS, TERMINE
    }
}