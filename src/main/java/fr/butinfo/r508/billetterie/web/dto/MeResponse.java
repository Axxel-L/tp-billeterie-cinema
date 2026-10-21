package fr.butinfo.r508.billetterie.web.dto;

import java.util.List;

public record MeResponse(String username, List<String> roles) {
}
