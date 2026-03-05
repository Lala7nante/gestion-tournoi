package com.touroi.gestion_tournoi.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "groupe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Groupe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1)
    private Character nom; // Automatique: A, B, C...

    @ManyToOne
    @JoinColumn(name = "tournoi_id", nullable = false)
    private Tournoi tournoi;

    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL)
    private List<Equipe> equipes;
}
