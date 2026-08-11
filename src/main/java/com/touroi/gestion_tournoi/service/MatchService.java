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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchService {

    @Autowired private MatchRepository matchRepository;
    @Autowired private EquipeService equipeService;
    @Autowired private ClassementService classementService;
    @Autowired private TournoiRepository tournoiRepository;

    // ─── COUPE ───────────────────────────────────────────────────────────────

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

    public Tournoi findTournoiById(Long id) {
        return tournoiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournoi introuvable !"));
    }

    public MatchFootball save(MatchFootball match, Long domId, Long extId) {
        Equipe dom = equipeService.findById(domId);
        Equipe ext = equipeService.findById(extId);
        if (domId.equals(extId))
            throw new RuntimeException("Impossible de faire jouer une équipe contre elle-même !");
        match.setEquipeDomicile(dom);
        match.setEquipeExterieur(ext);
        return matchRepository.save(match);
    }

    public Equipe getGagnant(MatchFootball match) {
        if (match.getStatut() != MatchFootball.Statut.TERMINE)
            throw new RuntimeException("Match " + match.getId() + " pas encore terminé !");

        int sd = match.getScoreDomicile(), se = match.getScoreExterieur();
        if (sd > se) return match.getEquipeDomicile();
        if (se > sd) return match.getEquipeExterieur();

        if (match.isProlongation()) {
            int pd = match.getScoreProlDomicile(), pe = match.getScoreProlExterieur();
            if (pd > pe) return match.getEquipeDomicile();
            if (pe > pd) return match.getEquipeExterieur();
        }
        if (match.isPenalty()) {
            int pd = match.getScorePenDomicile(), pe = match.getScorePenExterieur();
            if (pd > pe) return match.getEquipeDomicile();
            if (pe > pd) return match.getEquipeExterieur();
        }
        throw new RuntimeException("Impossible de déterminer le gagnant du match " + match.getId());
    }

    public Equipe getPerdant(MatchFootball match) {
        Equipe g = getGagnant(match);
        return g.getId().equals(match.getEquipeDomicile().getId())
                ? match.getEquipeExterieur() : match.getEquipeDomicile();
    }

    public List<MatchFootball> genererPhaseManaraka(LocalDate dateMatch, String lieu) {
        MatchFootball.Phase phaseAct  = determinerPhaseAnkehitriny();
        MatchFootball.Phase phaseNext = determinerPhaseManaraka(phaseAct);
        List<MatchFootball> matchsPhase = matchRepository.findByPhase(phaseAct);

        boolean tousFinis = matchsPhase.stream()
                .allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE);
        if (!tousFinis) {
            long restants = matchsPhase.stream()
                    .filter(m -> m.getStatut() != MatchFootball.Statut.TERMINE).count();
            throw new RuntimeException("Impossible : " + restants + " match(s) pas encore terminé(s) !");
        }

        if (!matchRepository.findByPhase(phaseNext).isEmpty())
            throw new RuntimeException("La phase " + phaseNext + " a déjà été générée !");

        List<MatchFootball> generes = new ArrayList<>();

        if (phaseNext == MatchFootball.Phase.DEMI) {
            List<Equipe> gagnants = matchsPhase.stream()
                    .map(this::getGagnant).collect(Collectors.toList());
            Collections.shuffle(gagnants);
            for (int i = 0; i < gagnants.size(); i += 2)
                generes.add(creerMatch(gagnants.get(i), gagnants.get(i + 1),
                        MatchFootball.Phase.DEMI, dateMatch, lieu));

        } else if (phaseNext == MatchFootball.Phase.FINALE) {
            List<MatchFootball> demis = matchRepository.findByPhase(MatchFootball.Phase.DEMI);
            generes.add(creerMatch(getGagnant(demis.get(0)), getGagnant(demis.get(1)),
                    MatchFootball.Phase.FINALE, dateMatch, lieu));
            generes.add(creerMatch(getPerdant(demis.get(0)), getPerdant(demis.get(1)),
                    MatchFootball.Phase.TROISIEME, dateMatch, lieu));
        }
        return generes;
    }

    private MatchFootball.Phase determinerPhaseAnkehitriny() {
        if (!matchRepository.findByPhase(MatchFootball.Phase.DEMI).isEmpty())     return MatchFootball.Phase.DEMI;
        if (!matchRepository.findByPhase(MatchFootball.Phase.ROUND_16).isEmpty()) return MatchFootball.Phase.ROUND_16;
        if (!matchRepository.findByPhase(MatchFootball.Phase.QUART).isEmpty())    return MatchFootball.Phase.QUART;
        throw new RuntimeException("Aucune phase éliminatoire trouvée !");
    }

    private MatchFootball.Phase determinerPhaseManaraka(MatchFootball.Phase phase) {
        switch (phase) {
            case ROUND_16: return MatchFootball.Phase.QUART;
            case QUART:    return MatchFootball.Phase.DEMI;
            case DEMI:     return MatchFootball.Phase.FINALE;
            default:       throw new RuntimeException("Pas de phase suivante");
        }
    }

    private MatchFootball creerMatch(Equipe dom, Equipe ext,
                                     MatchFootball.Phase phase,
                                     LocalDate dateMatch, String lieu) {
        MatchFootball m = new MatchFootball();
        m.setEquipeDomicile(dom);
        m.setEquipeExterieur(ext);
        m.setPhase(phase);
        m.setStatut(MatchFootball.Statut.PREVU);
        m.setDateMatch(dateMatch != null ? dateMatch : LocalDate.now().plusDays(7));
        m.setLieu(lieu != null ? lieu : "À définir");
        return matchRepository.save(m);
    }

    public List<MatchFootball> genererTirage(LocalDate dateMatch, String lieu) {
        Tournoi tournoi = tournoiRepository.findAll().get(0);
        int totalQualifies = tournoi.getNbGroupes() * 2;
        MatchFootball.Phase phaseNext = totalQualifies == 8
                ? MatchFootball.Phase.QUART
                : totalQualifies == 16 ? MatchFootball.Phase.ROUND_16 : null;
        if (phaseNext == null) throw new RuntimeException("Nombre de groupes non supporté");

        List<MatchFootball> matchsGroupe = matchRepository.findByPhase(MatchFootball.Phase.GROUPE);
        boolean tousFinis = matchsGroupe.stream()
                .allMatch(m -> m.getStatut() == MatchFootball.Statut.TERMINE);
        if (!tousFinis) throw new RuntimeException("Matchs de groupe pas terminés !");

        List<Equipe> qualifiees = classementService.getEquipesQualifiees();
        Collections.shuffle(qualifiees);

        List<MatchFootball> generes = new ArrayList<>();
        for (int i = 0; i < totalQualifies; i += 2)
            generes.add(creerMatch(qualifiees.get(i), qualifiees.get(i + 1),
                    phaseNext, dateMatch, lieu));
        return generes;
    }

    // ─── LIGUE ───────────────────────────────────────────────────────────────

    public List<MatchFootball> findByLigue(Long tournoiId) {
        return matchRepository.findByTournoiIdAndPhaseOrderByJourneeAscIdDesc(
                tournoiId, MatchFootball.Phase.JOURNEE_LIGUE);
    }

    public List<MatchFootball> genererJourneesLigue(Long tournoiId) {
        Tournoi tournoi = findTournoiById(tournoiId);

        // 👈 TypeTournoi (tsy Type)
        if (tournoi.getType() != Tournoi.TypeTournoi.LIGUE)
            throw new RuntimeException("Ce tournoi n'est pas une Ligue !");

        List<MatchFootball> dejaExistants = matchRepository
                .findByTournoiIdAndPhaseOrderByJourneeAscIdDesc(tournoiId, MatchFootball.Phase.JOURNEE_LIGUE);
        if (!dejaExistants.isEmpty())
            throw new RuntimeException("Les journées sont déjà générées pour cette ligue !");

        // 👈 equipeService fa tsy tournoi.getEquipes()
        List<Equipe> equipes = new ArrayList<>(equipeService.findByTournoi(tournoiId));
        int n = equipes.size();
        if (n < 2) throw new RuntimeException("Il faut au moins 2 équipes pour générer les journées !");

        // Aller simple na aller-retour arakaraky ny typeMatch
        boolean allerRetour = tournoi.getTypeMatch() == Tournoi.TypeMatch.ALLER_RETOUR;

        if (n % 2 != 0) equipes.add(null); // équipe fantôme si impair
        int nbEquipes       = equipes.size();
        int nbJourneesAller = nbEquipes - 1;
        int nbJournees      = allerRetour ? nbJourneesAller * 2 : nbJourneesAller;
        int matchsParJournee = nbEquipes / 2;

        List<Equipe> rotation = new ArrayList<>(equipes.subList(1, nbEquipes));
        Equipe fixe = equipes.get(0);

        List<MatchFootball> generes = new ArrayList<>();
        LocalDate dateDebut = tournoi.getDateDebut() != null
                ? tournoi.getDateDebut() : LocalDate.now().plusDays(7);

        for (int j = 0; j < nbJournees; j++) {
            int journeeNum   = j + 1;
            boolean retour   = allerRetour && j >= nbJourneesAller;
            LocalDate dateJournee = dateDebut.plusWeeks(j);

            List<Equipe> cercle = new ArrayList<>();
            cercle.add(fixe);
            cercle.addAll(rotation);

            for (int i = 0; i < matchsParJournee; i++) {
                Equipe e1 = cercle.get(i);
                Equipe e2 = cercle.get(nbEquipes - 1 - i);
                if (e1 == null || e2 == null) continue;

                MatchFootball match = new MatchFootball();
                match.setEquipeDomicile(retour ? e2 : e1);
                match.setEquipeExterieur(retour ? e1 : e2);
                match.setPhase(MatchFootball.Phase.JOURNEE_LIGUE);
                match.setStatut(MatchFootball.Statut.PREVU);
                match.setJournee(journeeNum);
                match.setTournoi(tournoi);
                match.setDateMatch(dateJournee);
                match.setLieu("À définir");
                generes.add(matchRepository.save(match));
            }

            // Rotation round-robin (aller uniquement)
            if (!retour) rotation.add(0, rotation.remove(rotation.size() - 1));
        }
        return generes;
    }

    public List<Map<String, Object>> calculerClassementLigue(Long tournoiId) {
        List<MatchFootball> matchs = matchRepository
                .findByTournoiIdAndPhaseOrderByJourneeAscIdDesc(tournoiId, MatchFootball.Phase.JOURNEE_LIGUE);

        Map<Long, Map<String, Object>> table = new LinkedHashMap<>();

        for (MatchFootball m : matchs) {
            if (m.getStatut() != MatchFootball.Statut.TERMINE) continue;

            Equipe dom = m.getEquipeDomicile();
            Equipe ext = m.getEquipeExterieur();
            int sd = m.getScoreDomicile(), se = m.getScoreExterieur();

            initEquipe(table, dom);
            initEquipe(table, ext);

            Map<String, Object> d = table.get(dom.getId());
            Map<String, Object> e = table.get(ext.getId());

            addInt(d, "j", 1);   addInt(e, "j", 1);
            addInt(d, "bp", sd); addInt(d, "bc", se); addInt(d, "diff", sd - se);
            addInt(e, "bp", se); addInt(e, "bc", sd); addInt(e, "diff", se - sd);

            if (sd > se)      { addInt(d, "v", 1); addInt(d, "pts", 3); addInt(e, "d", 1); }
            else if (se > sd) { addInt(e, "v", 1); addInt(e, "pts", 3); addInt(d, "d", 1); }
            else              { addInt(d, "n", 1); addInt(d, "pts", 1); addInt(e, "n", 1); addInt(e, "pts", 1); }
        }

        return table.values().stream()
                .sorted(Comparator
                        .comparingInt((Map<String, Object> r) -> -(int) r.get("pts"))
                        .thenComparingInt(r -> -(int) r.get("diff"))
                        .thenComparingInt(r -> -(int) r.get("bp")))
                .collect(Collectors.toList());
    }

    private void initEquipe(Map<Long, Map<String, Object>> table, Equipe e) {
        table.computeIfAbsent(e.getId(), k -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("equipeId",  e.getId());
            row.put("equipeNom", e.getNom());
            row.put("pts", 0); row.put("j", 0);
            row.put("v", 0);   row.put("n", 0); row.put("d", 0);
            row.put("bp", 0);  row.put("bc", 0); row.put("diff", 0);
            return row;
        });
    }

    private void addInt(Map<String, Object> row, String key, int val) {
        row.put(key, (int) row.get(key) + val);
    }

    // ─── Score + Stats ────────────────────────────────────────────────────────

    @Transactional
    public MatchFootball enregistrerScore(Long matchId,
            int scoreDom, int scoreExt,
            boolean prolongation, int scoreProlDom, int scoreProlExt,
            boolean penalty, int scorePenDom, int scorePenExt,
            int tirsDom, int tirsCadresDom, int possessionDom,
            int fautesDom, int cartonsJaunesDom, int cartonsRougesDom,
            int cornersDom, int horsJeuDom,
            int tirsExt, int tirsCadresExt, int possessionExt,
            int fautesExt, int cartonsJaunesExt, int cartonsRougesExt,
            int cornersExt, int horsJeuExt) {

        MatchFootball match = findById(matchId);
        if (MatchFootball.Statut.TERMINE.equals(match.getStatut())) return match;

        match.setScoreDomicile(scoreDom);         match.setScoreExterieur(scoreExt);
        match.setProlongation(prolongation);
        match.setScoreProlDomicile(scoreProlDom); match.setScoreProlExterieur(scoreProlExt);
        match.setPenalty(penalty);
        match.setScorePenDomicile(scorePenDom);   match.setScorePenExterieur(scorePenExt);
        match.setStatut(MatchFootball.Statut.TERMINE);
        match.setTirsDomicile(tirsDom);           match.setTirsCadresDomicile(tirsCadresDom);
        match.setPossessionDomicile(possessionDom);
        match.setFautesDomicile(fautesDom);       match.setCartonsJaunesDomicile(cartonsJaunesDom);
        match.setCartonsRougesDomicile(cartonsRougesDom);
        match.setCornersDomicile(cornersDom);     match.setHorsJeuDomicile(horsJeuDom);
        match.setTirsExterieur(tirsExt);          match.setTirsCadresExterieur(tirsCadresExt);
        match.setPossessionExterieur(possessionExt);
        match.setFautesExterieur(fautesExt);      match.setCartonsJaunesExterieur(cartonsJaunesExt);
        match.setCartonsRougesExterieur(cartonsRougesExt);
        match.setCornersExterieur(cornersExt);    match.setHorsJeuExterieur(horsJeuExt);

        matchRepository.saveAndFlush(match);

        // Classement COUPE uniquement — Ligue calculée dynamiquement
        if (match.getPhase() == MatchFootball.Phase.GROUPE) {
            classementService.updateClassement(match);
        }
        return match;
    }

    public void delete(Long id) {
        matchRepository.deleteById(id);
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
        if (body.containsKey("journee") && body.get("journee") != null)
            match.setJournee(Integer.valueOf(body.get("journee").toString()));
        return matchRepository.save(match);
    }
}