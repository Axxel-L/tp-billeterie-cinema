package fr.butinfo.r508.billetterie.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/", "/films", "/seances", "/reservation", "/admin"})
    public String index() {
        return "forward:/index.html";
    }
}
