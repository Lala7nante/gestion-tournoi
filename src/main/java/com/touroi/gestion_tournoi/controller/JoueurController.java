package com.touroi.gestion_tournoi.controller;
import com.touroi.gestion_tournoi.model.Joueur;
import com.touroi.gestion_tournoi.service.JoueurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class JoueurController {

    @Autowired
    private JoueurService joueurService;

    // GET /api/joueurs
    @GetMapping("/joueurs")
    public List<Joueur> getAllJoueurs() {
        return joueurService.findAll();
    }

    // ✅ AJOUTÉ : GET /api/joueurs/{id}
    @GetMapping("/joueurs/{id}")
    public ResponseEntity<?> getJoueurById(@PathVariable Long id) {
        return ResponseEntity.ok(joueurService.findById(id));
    }

    // GET /api/equipes/{equipeId}/joueurs
    @GetMapping("/equipes/{equipeId}/joueurs")
    public List<Joueur> getJoueursByEquipe(@PathVariable Long equipeId) {
        return joueurService.findByEquipe(equipeId);
    }

    // POST /api/equipes/{equipeId}/joueurs
    @PostMapping("/equipes/{equipeId}/joueurs")
    public ResponseEntity<?> save(@PathVariable Long equipeId,
                                  @RequestBody Joueur joueur) {
        return ResponseEntity.ok(joueurService.save(joueur, equipeId));
    }

    // PUT /api/equipes/{equipeId}/joueurs/{id}
    @PutMapping("/equipes/{equipeId}/joueurs/{id}")
    public ResponseEntity<?> update(@PathVariable Long equipeId,
                                    @PathVariable Long id,
                                    @RequestBody Joueur joueur) {
        return ResponseEntity.ok(joueurService.update(id, joueur));
    }

    // DELETE /api/equipes/{equipeId}/joueurs/{id}
    @DeleteMapping("/equipes/{equipeId}/joueurs/{id}")
    public ResponseEntity<?> delete(@PathVariable Long equipeId,
                                    @PathVariable Long id) {
        joueurService.delete(id);
        return ResponseEntity.ok("Joueur supprimé");
    }
}