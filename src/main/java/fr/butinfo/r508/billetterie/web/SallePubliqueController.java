package fr.butinfo.r508.billetterie.web;

import fr.butinfo.r508.billetterie.service.SalleService;
import fr.butinfo.r508.billetterie.web.dto.SalleResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/salles")
public class SallePubliqueController {

    private final SalleService salleService;

    public SallePubliqueController(SalleService salleService) {
        this.salleService = salleService;
    }

    @GetMapping
    public List<SalleResponse> lister() {
        return salleService.lister();
    }
}
