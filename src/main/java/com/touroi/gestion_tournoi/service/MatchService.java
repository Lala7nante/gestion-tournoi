package com.touroi.gestion_tournoi.service;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.model.MatchFootball;
import com.touroi.gestion_tournoi.model.Tournoi;
import com.touroi.gestion_tournoi.repository.MatchRepository;
import com.touroi.gestion_tournoi.repository.TournoiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private EquipeService equipeService;

    @Autowired
    private ClassementService classementService;

    @Autowired
    private TournoiRepository tournoiRepository;

    public List<MatchFootball> findAll() {
        return matchRepository.findAllByOrderByIdDesc();
    }

    public List<MatchFootball> findByPhase(MatchFootball.Phase phase) {
        return matchRepository.findByPhase(phase);
    }

    public MatchFootball findById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match introuvable !"));
    }

    public MatchFootball save(MatchFootball match, Long domId, Long extId) {
        Equipe dom = equipeService.findById(domId);
        Equipe ext = equipeService.findById(extId);

        if (domId.equals(extId)) {
            throw new RuntimeException("Impossible de faire jouer une équipe contre elle-même !");
        }

        match.setEquipeDomicile(dom);
        match.setEquipeExterieur(ext);
        return matchRepository.save(match);
    }

    public Equipe getGagnant(MatchFootball match) {
        if (match.getStatut() != MatchFootball.Statut.TERMINE) {
            throw new RuntimeException("Le match " + match.getId() + " n'est pas encore terminé !");
        }

        int scoreDom = match.getScoreDomicile();
        int scoreExt = match.getScoreExterieur();

        if (scoreDom > scoreExt) return match.getEquipeDomicile();
        if (scoreExt > scoreDom) return match.getEquipeExterieur();

        if (match.isProlongation()) {
            int prolDom = match.getScoreProlDomicile();
            int prolExt = match.getScoreProlExterieur();
            if (prolDom > prolExt) return match.getEquipeDomicile();
            if (prolExt > prolDom) return match.getEquipeExterieur();
        }

        if (match.isPenalty()) {
            int penDom = match.getScorePenDomicile();
            int penExt = match.getScorePenExterieur();
            if (penDom > penExt) return match.getEquipeDomicile();
            if (penExt > penDom) return match.getEquipeExterieur();
        }

        throw new RuntimeException("Impossible de déterminer le gagnant du match " + match.getId());
    }

    public Equipe getPerdant(MatchFootball match) {
        Equipe gagnant = getGagnant(match);
        return gagnant.getId().equals(match.getEquipeDomicile().getId())
                ? match.getEquipeExterieur()
                : match.getEquipeDomicile();
    }

    public List<MatchFootball> genererPhaseManaraka(LocalDate dateMatch, String lieu) {

        MatchFootball.Phase phaseAnkehitriny = determinerPhaseAnkehitriny();
        MatchFootball.Phase phaseManaraka = determinerPhaseManaraka(phaseAnkehitriny);

        List<MatchFootball> matchsPhase = matchRepository.findByPhase(phaseAnkehitriny);

        boolean tousFinis = matchsPhase.stream()
                .allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE);

        if (!tousFinis) {
            long restants = matchsPhase.stream()
                    .filter(m -> m.getStatut() != MatchFootball.Statut.TERMINE)
                    .count();

            throw new RuntimeException(
                    "Impossible : " + restants + " match(s) pas encore terminé(s) !"
            );
        }

        List<MatchFootball> phaseManaraka_existant = matchRepository.findByPhase(phaseManaraka);
        if (!phaseManaraka_existant.isEmpty()) {
            throw new RuntimeException("La phase " + phaseManaraka + " a déjà été générée !");
        }

        List<MatchFootball> matchsGeneres = new ArrayList<>();

        if (phaseManaraka == MatchFootball.Phase.DEMI) {
            List<Equipe> gagnants = new ArrayList<>();
            for (MatchFootball m : matchsPhase) {
                gagnants.add(getGagnant(m));
            }
            Collections.shuffle(gagnants);

            for (int i = 0; i < gagnants.size(); i += 2) {
                matchsGeneres.add(creerMatch(
                        gagnants.get(i), gagnants.get(i + 1),
                        MatchFootball.Phase.DEMI, dateMatch, lieu
                ));
            }

        } else if (phaseManaraka == MatchFootball.Phase.FINALE) {

            List<MatchFootball> matchsDemi = matchRepository.findByPhase(MatchFootball.Phase.DEMI);

            Equipe gagnant1 = getGagnant(matchsDemi.get(0));
            Equipe gagnant2 = getGagnant(matchsDemi.get(1));
            Equipe perdant1 = getPerdant(matchsDemi.get(0));
            Equipe perdant2 = getPerdant(matchsDemi.get(1));

            matchsGeneres.add(creerMatch(gagnant1, gagnant2, MatchFootball.Phase.FINALE, dateMatch, lieu));
            matchsGeneres.add(creerMatch(perdant1, perdant2, MatchFootball.Phase.TROISIEME, dateMatch, lieu));
        }

        return matchsGeneres;
    }

    private MatchFootball.Phase determinerPhaseAnkehitriny() {
        if (!matchRepository.findByPhase(MatchFootball.Phase.DEMI).isEmpty()) {
            return MatchFootball.Phase.DEMI;
        }
        if (!matchRepository.findByPhase(MatchFootball.Phase.ROUND_16).isEmpty()) {
            return MatchFootball.Phase.ROUND_16;
        }
        if (!matchRepository.findByPhase(MatchFootball.Phase.QUART).isEmpty()) {
            return MatchFootball.Phase.QUART;
        }
        throw new RuntimeException("Aucune phase éliminatoire trouvée !");
    }

    private MatchFootball.Phase determinerPhaseManaraka(MatchFootball.Phase phaseAnkehitriny) {
        switch (phaseAnkehitriny) {
            case ROUND_16: return MatchFootball.Phase.QUART;
            case QUART: return MatchFootball.Phase.DEMI;
            case DEMI: return MatchFootball.Phase.FINALE;
            default: throw new RuntimeException("Pas de phase suivante");
        }
    }

    private MatchFootball creerMatch(Equipe dom, Equipe ext,
                                      MatchFootball.Phase phase,
                                      LocalDate dateMatch, String lieu) {

        MatchFootball match = new MatchFootball();
        match.setEquipeDomicile(dom);
        match.setEquipeExterieur(ext);
        match.setPhase(phase);
        match.setStatut(MatchFootball.Statut.PREVU);
        match.setDateMatch(dateMatch != null ? dateMatch : LocalDate.now().plusDays(7));
        match.setLieu(lieu != null ? lieu : "À définir");

        return matchRepository.save(match);
    }

    public List<MatchFootball> genererTirage(LocalDate dateMatch, String lieu) {

        Tournoi tournoi = tournoiRepository.findAll().get(0);
        int nbGroupes = tournoi.getNbGroupes();
        int totalQualifies = nbGroupes * 2;

        MatchFootball.Phase phaseManaraka;

        if (totalQualifies == 8) {
            phaseManaraka = MatchFootball.Phase.QUART;
        } else if (totalQualifies == 16) {
            phaseManaraka = MatchFootball.Phase.ROUND_16;
        } else {
            throw new RuntimeException("Nombre de groupes non supporté");
        }

        List<MatchFootball> matchsGroupe = matchRepository.findByPhase(MatchFootball.Phase.GROUPE);

        boolean tousFinis = matchsGroupe.stream()
                .allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE);

        if (!tousFinis) {
            throw new RuntimeException("Matchs de groupe pas terminés !");
        }

        List<Equipe> qualifiees = classementService.getEquipesQualifiees();

        Collections.shuffle(qualifiees);

        List<MatchFootball> matchsGeneres = new ArrayList<>();

        for (int i = 0; i < totalQualifies; i += 2) {
            matchsGeneres.add(creerMatch(
                    qualifiees.get(i), qualifiees.get(i + 1),
                    phaseManaraka, dateMatch, lieu
            ));
        }

        return matchsGeneres;
    }

    @Transactional
    public MatchFootball enregistrerScore(Long matchId,
                                          int scoreDom, int scoreExt,
                                          boolean prolongation, int scoreProlDom, int scoreProlExt,
                                          boolean penalty, int scorePenDom, int scorePenExt,
                                          int tirsDomicile, int tirsCadresDomicile,
                                          int possessionDomicile,
                                          int fautesDomicile, int cartonsJaunesDomicile,
                                          int cartonsRougesDomicile, int cornersDomicile,
                                          int horsJeuDomicile,
                                          int tirsExterieur, int tirsCadresExterieur,
                                          int possessionExterieur,
                                          int fautesExterieur, int cartonsJaunesExterieur,
                                          int cartonsRougesExterieur, int cornersExterieur,
                                          int horsJeuExterieur) {

        MatchFootball match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match introuvable !"));

        if (MatchFootball.Statut.TERMINE.equals(match.getStatut())) {
            return match;
        }

        match.setScoreDomicile(scoreDom);
        match.setScoreExterieur(scoreExt);
        match.setProlongation(prolongation);
        match.setScoreProlDomicile(scoreProlDom);
        match.setScoreProlExterieur(scoreProlExt);
        match.setPenalty(penalty);
        match.setScorePenDomicile(scorePenDom);
        match.setScorePenExterieur(scorePenExt);

        match.setStatut(MatchFootball.Statut.TERMINE);

        match.setTirsDomicile(tirsDomicile);
        match.setTirsCadresDomicile(tirsCadresDomicile);
        match.setPossessionDomicile(possessionDomicile);
        match.setFautesDomicile(fautesDomicile);
        match.setCartonsJaunesDomicile(cartonsJaunesDomicile);
        match.setCartonsRougesDomicile(cartonsRougesDomicile);
        match.setCornersDomicile(cornersDomicile);
        match.setHorsJeuDomicile(horsJeuDomicile);

        match.setTirsExterieur(tirsExterieur);
        match.setTirsCadresExterieur(tirsCadresExterieur);
        match.setPossessionExterieur(possessionExterieur);
        match.setFautesExterieur(fautesExterieur);
        match.setCartonsJaunesExterieur(cartonsJaunesExterieur);
        match.setCartonsRougesExterieur(cartonsRougesExterieur);
        match.setCornersExterieur(cornersExterieur);
        match.setHorsJeuExterieur(horsJeuExterieur);

        // ← Save d'abord pour que le classement lise le score à jour
        matchRepository.saveAndFlush(match);

        // ← Mise à jour automatique du classement si phase de groupe
        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            classementService.updateClassement(match);
        }

        return match;
    }

    public void delete(Long id) {
        matchRepository.deleteById(id);
    }

    public MatchFootball updateStats(Long matchId,
                                     int tirsDomicile, int tirsCadresDomicile, int possessionDomicile,
                                     int fautesDomicile, int cartonsJaunesDomicile,
                                     int cartonsRougesDomicile, int cornersDomicile, int horsJeuDomicile,
                                     int tirsExterieur, int tirsCadresExterieur, int possessionExterieur,
                                     int fautesExterieur, int cartonsJaunesExterieur,
                                     int cartonsRougesExterieur, int cornersExterieur, int horsJeuExterieur) {

        MatchFootball match = findById(matchId);

        match.setTirsDomicile(tirsDomicile);
        match.setTirsCadresDomicile(tirsCadresDomicile);
        match.setPossessionDomicile(possessionDomicile);
        match.setFautesDomicile(fautesDomicile);
        match.setCartonsJaunesDomicile(cartonsJaunesDomicile);
        match.setCartonsRougesDomicile(cartonsRougesDomicile);
        match.setCornersDomicile(cornersDomicile);
        match.setHorsJeuDomicile(horsJeuDomicile);

        match.setTirsExterieur(tirsExterieur);
        match.setTirsCadresExterieur(tirsCadresExterieur);
        match.setPossessionExterieur(possessionExterieur);
        match.setFautesExterieur(fautesExterieur);
        match.setCartonsJaunesExterieur(cartonsJaunesExterieur);
        match.setCartonsRougesExterieur(cartonsRougesExterieur);
        match.setCornersExterieur(cornersExterieur);
        match.setHorsJeuExterieur(horsJeuExterieur);

        return matchRepository.save(match);
    }

    public MatchFootball update(Long id, Map<String, Object> body) {
        MatchFootball match = findById(id);

        if (body.containsKey("dateMatch") && body.get("dateMatch") != null)
            match.setDateMatch(LocalDate.parse(body.get("dateMatch").toString()));

        if (body.containsKey("lieu") && body.get("lieu") != null)
            match.setLieu(body.get("lieu").toString());

        if (body.containsKey("phase") && body.get("phase") != null)
            match.setPhase(MatchFootball.Phase.valueOf(body.get("phase").toString()));

        if (body.containsKey("statut") && body.get("statut") != null)
            match.setStatut(MatchFootball.Statut.valueOf(body.get("statut").toString()));

        return matchRepository.save(match);
    }
}