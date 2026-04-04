package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Classement;
import com.touroi.gestion_tournoi.model.Groupe;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.service.ClassementService;
import com.touroi.gestion_tournoi.service.TournoiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
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
    public Map<Long, List<Classement>> index() {
        List<Tournoi> tournois = tournoiService.findAll();
        Map<Long, List<Classement>> classementMap = new HashMap<>();
        for (Tournoi t : tournois) {
            for (Groupe g : t.getGroupes()) {
                classementMap.put(g.getId(), classementService.findByGroupe(g.getId()));
            }
        }
        return classementMap;
    }

    // GET /api/groupes/{groupeId}/classement
    @GetMapping("/groupes/{groupeId}/classement")
    public List<Classement> byGroupe(@PathVariable Long groupeId) {
        return classementService.findByGroupe(groupeId);
    }
}