package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.But;
import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.repository.ButRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class ButService {

    @Autowired private ButRepository butRepository;
    @Autowired private MatchService matchService;
    @Autowired private JoueurService joueurService;

    public List<But> findByMatch(Long matchId) {
        return butRepository.findByMatchIdOrderByMinuteAsc(matchId);
    }

    public But save(Long matchId, Map<String, Object> body) {
        MatchFootball match = matchService.findById(matchId);

        Long buteurId = Long.valueOf(body.get("buteurId").toString());
        Joueur buteur = joueurService.findById(buteurId);

        But but = new But();
        but.setMatch(match);
        but.setButeur(buteur);
        but.setMinute(Integer.parseInt(body.get("minute").toString()));
        but.setType(But.TypeBut.valueOf(body.get("type").toString()));

        if (body.get("passeurId") != null && !body.get("passeurId").toString().isBlank()) {
            Long passeurId = Long.valueOf(body.get("passeurId").toString());
            but.setPasseur(joueurService.findById(passeurId));
        }

        return butRepository.save(but);
    }

    public void delete(Long id) {
        butRepository.deleteById(id);
    }
}