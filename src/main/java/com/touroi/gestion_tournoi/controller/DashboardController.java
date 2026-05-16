package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.*;
import com.touroi.gestion_tournoi.service.StatistiqueService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired private TournoiRepository tournoiRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private EquipeRepository equipeRepository;
    @Autowired private GroupeRepository groupeRepository;
    @Autowired private StatistiqueService statistiqueService;
    @Autowired private TournoiService tournoiService;

    // GET /api/dashboard
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Object> data = new HashMap<>();

        // Stats générales
        data.put("nbTournois",  tournoiRepository.count());
        data.put("nbGroupes",   groupeRepository.count());
        data.put("nbEquipes",   equipeRepository.count());
        data.put("nbMatchs",    matchRepository.count());

        // Derniers résultats
        data.put("derniersResultats",
            matchRepository.findByStatutOrderByDateMatchDesc(
                MatchFootball.Statut.TERMINE).stream().limit(5).toList());

        // Prochains matchs
        data.put("prochainsMatchs",
            matchRepository.findByStatutOrderByDateMatchAsc(
                MatchFootball.Statut.PREVU).stream().limit(5).toList());

        // Top buteur + Homme du tournoi + Champions
        tournoiService.findAll().stream().findFirst().ifPresent(t -> {
            var topButeurs = statistiqueService.getTopButeurs(t.getId());
            var hommes     = statistiqueService.getHommesDuMatch(t.getId());
            var champions  = statistiqueService.getMeilleurClub(t.getId());

            if (!topButeurs.isEmpty()) data.put("topButeurs",    topButeurs.get(0));
            if (!hommes.isEmpty())     data.put("hommeTournoi", hommes.get(0));
            data.put("champions", champions);
        });

        return data;
    }
}