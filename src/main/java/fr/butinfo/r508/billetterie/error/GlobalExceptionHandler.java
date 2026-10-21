package fr.butinfo.r508.billetterie.error;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiError> gererMetier(BusinessException ex, HttpServletRequest requete) {
        return reponse(ex.getStatus(), ex.getCode(), ex.getMessage(), requete);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> gererValidation(MethodArgumentNotValidException ex,
                                                    HttpServletRequest requete) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formaterErreur)
                .sorted()
                .collect(Collectors.joining("; "));
        if (message.isBlank()) {
            message = "Requête invalide";
        }
        return reponse(HttpStatus.BAD_REQUEST, "VALIDATION_ECHOUEE", message, requete);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<ApiError> gererRequeteIllisible(Exception ex, HttpServletRequest requete) {
        return reponse(HttpStatus.BAD_REQUEST, "VALIDATION_ECHOUEE",
                "Requête invalide ou mal formée", requete);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> gererConflitDonnees(DataIntegrityViolationException ex,
                                                        HttpServletRequest requete) {
        log.warn("Conflit de données sur {} : {}", requete.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return reponse(HttpStatus.CONFLICT, "CONFLIT_DONNEES",
                "La requête entre en conflit avec une ressource existante", requete);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> gererRessourceAbsente(NoResourceFoundException ex,
                                                          HttpServletRequest requete) {
        return reponse(HttpStatus.NOT_FOUND, "RESSOURCE_INTROUVABLE", "Ressource introuvable", requete);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> gererMethode(HttpRequestMethodNotSupportedException ex,
                                                 HttpServletRequest requete) {
        return reponse(HttpStatus.METHOD_NOT_ALLOWED, "METHODE_NON_AUTORISEE",
                "Méthode HTTP non autorisée", requete);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> gererMediaType(HttpMediaTypeNotSupportedException ex,
                                                   HttpServletRequest requete) {
        return reponse(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "TYPE_NON_SUPPORTE",
                "Type de contenu non supporté", requete);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> gererInattendu(Exception ex, HttpServletRequest requete) {
        log.error("Erreur inattendue sur {}", requete.getRequestURI(), ex);
        return reponse(HttpStatus.INTERNAL_SERVER_ERROR, "ERREUR_INTERNE",
                "Une erreur interne est survenue", requete);
    }

    private String formaterErreur(FieldError erreur) {
        return erreur.getField() + " : " + erreur.getDefaultMessage();
    }

    private ResponseEntity<ApiError> reponse(HttpStatus statut, String code, String message,
                                             HttpServletRequest requete) {
        ApiError corps = new ApiError(Instant.now(), statut.value(), code, message, requete.getRequestURI());
        return ResponseEntity.status(statut).body(corps);
    }
}
