package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.service.ClassementService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ClassementController {

    @Autowired
    private ClassementService classementService;

    @Autowired
    private TournoiService tournoiService;

    // GET /api/classement
    @GetMapping("/classement")
    public Map<Long, List<Map<String, Object>>> index() {
        List<Tournoi> tournois = tournoiService.findAll();
        Map<Long, List<Map<String, Object>>> classementMap = new HashMap<>();

        for (Tournoi t : tournois) {
            for (Groupe g : t.getGroupes()) {
                List<Classement> classements = classementService.findByGroupe(g.getId());

                List<Long> equipesAvecStats = classements.stream()
                        .map(c -> c.getEquipe().getId())
                        .toList();

                List<Map<String, Object>> rows = new ArrayList<>();

                for (Classement c : classements) {
                    rows.add(buildRow(c.getEquipe(), g, c));
                }

                for (Equipe eq : g.getEquipes()) {
                    if (!equipesAvecStats.contains(eq.getId())) {
                        rows.add(buildRowVide(eq, g));
                    }
                }

                rows.sort((a, b) -> {
                    int pa = (int) a.get("points");
                    int pb = (int) b.get("points");
                    if (pb != pa) return pb - pa;

                    int diffA = (int) a.get("butsMarques") - (int) a.get("butsEncaisses");
                    int diffB = (int) b.get("butsMarques") - (int) b.get("butsEncaisses");
                    if (diffB != diffA) return diffB - diffA;

                    return (int) b.get("butsMarques") - (int) a.get("butsMarques");
                });

                classementMap.put(g.getId(), rows);
            }
        }

        return classementMap;
    }

    // GET /api/groupes/{groupeId}/classement
    @GetMapping("/groupes/{groupeId}/classement")
    public List<Classement> byGroupe(@PathVariable Long groupeId) {
        return classementService.findByGroupe(groupeId);
    }

    // POST /api/groupes/{groupeId}/classement/reinitialiser
    @PostMapping("/groupes/{groupeId}/classement/reinitialiser")
    public void reinitialiser(@PathVariable Long groupeId) {
        classementService.resetAllByGroupe(groupeId);
    }

    // POST /api/classement/recalculer
    @PostMapping("/classement/recalculer")
    public void recalculerTout() {
        List<Long> groupeIds = classementService.findAllGroupeIds();
        for (Long groupeId : groupeIds) {
            classementService.resetAllByGroupe(groupeId);
        }
    }

    // --- Helpers ---

    private Map<String, Object> buildRow(Equipe eq, Groupe g, Classement c) {
        Map<String, Object> row = new HashMap<>();
        row.put("equipeId", eq.getId());
        row.put("equipeNom", eq.getNom());
        row.put("groupeId", g.getId());
        row.put("groupeNom", g.getNom());
        row.put("points", c.getPoints());
        row.put("victoires", c.getVictoires());
        row.put("nuls", c.getNuls());
        row.put("defaites", c.getDefaites());
        row.put("butsMarques", c.getButsMarques());
        row.put("butsEncaisses", c.getButsEncaisses());
        return row;
    }

    private Map<String, Object> buildRowVide(Equipe eq, Groupe g) {
        Map<String, Object> row = new HashMap<>();
        row.put("equipeId", eq.getId());
        row.put("equipeNom", eq.getNom());
        row.put("groupeId", g.getId());
        row.put("groupeNom", g.getNom());
        row.put("points", 0);
        row.put("victoires", 0);
        row.put("nuls", 0);
        row.put("defaites", 0);
        row.put("butsMarques", 0);
        row.put("butsEncaisses", 0);
        return row;
    }
}