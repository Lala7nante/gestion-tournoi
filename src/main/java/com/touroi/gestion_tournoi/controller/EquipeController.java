package com.touroi.gestion_tournoi.controller;

import com.touroi.gestion_tournoi.model.Equipe;
import com.touroi.gestion_tournoi.service.EquipeService;
import com.touroi.gestion_tournoi.service.GroupeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class EquipeController {

    @Autowired
    private EquipeService equipeService;

    @Autowired
    private GroupeService groupeService;

   
    @GetMapping("/equipes")
public String findAll(Model model) {
    model.addAttribute("equipes", equipeService.findAll());
    return "equipe/index_all";
}


@GetMapping("/equipes/new")
public String newFormGlobal(Model model) {
    model.addAttribute("equipe", new Equipe());
    model.addAttribute("groupes", groupeService.findAll());
    return "equipe/form_global";
}

@PostMapping("/equipes")
public String saveGlobal(@ModelAttribute Equipe equipe,
                          @RequestParam Long groupeId) {
    equipeService.save(equipe, groupeId);
    return "redirect:/equipes";
}
@GetMapping("/equipes/{id}/edit")
public String editFormGlobal(@PathVariable Long id, Model model) {
    model.addAttribute("equipe", equipeService.findById(id));
    model.addAttribute("groupes", groupeService.findAll());
    return "equipe/form_global";
}

@PostMapping("/equipes/{id}")
public String updateGlobal(@PathVariable Long id,
                            @ModelAttribute Equipe equipe) {
    equipeService.update(id, equipe);
    return "redirect:/equipes";
}

@GetMapping("/equipes/{id}/delete")
public String deleteGlobal(@PathVariable Long id) {
    equipeService.delete(id);
    return "redirect:/equipes";
}
}