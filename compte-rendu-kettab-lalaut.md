# Billetterie de cinéma

Backend d'une billetterie de cinéma : films, séances, réservations, avec garantie de capacité sous concurrence.

**Auteurs :** Lalaut Axel · Kettab Abigail

---

## 1. Prérequis

- JDK **25** (vérifier avec `java -version`)
- Docker (pour MySQL et les tests Testcontainers)
- Aucun Maven à installer : le Maven Wrapper est fourni

Vérifier que Maven utilise bien Java 25 :

```bash
./mvnw -version          # Windows : .\mvnw.cmd -version
```

## 2. Démarrage de MySQL

```bash
docker compose up -d
```

- Base : `………`
- Port : `………`
- Utilisateur / mot de passe de **développement** : définis dans `compose.yaml` / `application.properties` (aucun secret de production dans le dépôt)

Les tables sont créées **uniquement par Flyway** au démarrage (`spring.jpa.hibernate.ddl-auto=validate`).

## 3. Construire et vérifier

```bash
./mvnw clean verify      # Windows : .\mvnw.cmd clean verify
```

Cette commande compile, applique les tests et produit le JAR.

## 4. Lancer l'application

```bash
java -jar target/………-0.0.1-SNAPSHOT.jar
```

L'application écoute sur `http://localhost:8080`.

## 5. Comptes de démonstration

Authentification **HTTP Basic**. Mots de passe stockés en **BCrypt** dans la configuration.

| Utilisateur | Mot de passe (démo) | Rôle | Droits |
|---|---|---|---|
| `client` | `………` | CLIENT | Créer et annuler une réservation |
| `programmateur` | `………` | PROGRAMMATEUR | Créer films et séances |
| `admin` | `………` | ADMIN | Créer des salles + toutes les opérations protégées |

## 6. Endpoints

| Méthode et chemin | Accès | Réponses |
|---|---|---|
| `GET /api/films` (filtres `titre`, `genre`) | Public | 200 |
| `GET /api/seances?du=&au=` | Public | 200 |
| `POST /api/programmation/films` | PROGRAMMATEUR, ADMIN | 201 |
| `POST /api/programmation/seances` | PROGRAMMATEUR, ADMIN | 201, 400 |
| `POST /api/admin/salles` | ADMIN | 201, 400, 409 |
| `POST /api/reservations` | CLIENT | 201, 400, 404, 409 |
| `DELETE /api/reservations/{code}` | CLIENT, ADMIN | 204, 404 |
| `GET /actuator/health` | Public | 200 |

Documentation :
- OpenAPI : `/v3/api-docs`
- Swagger UI : `/swagger-ui.html`

### Exemple de réservation

```bash
curl -u client:MOT_DE_PASSE -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"seanceId": 1, "emailClient": "lea@example.test", "nombrePlaces": 3}'
```

Réponse `201` : code de réservation, statut, nombre de places, montant total (calculé côté serveur).

### Format des erreurs

```json
{
  "timestamp": "2026-10-21T09:12:00Z",
  "status": 409,
  "code": "CAPACITE_INSUFFISANTE",
  "message": "Il ne reste que 2 places pour cette séance",
  "path": "/api/reservations"
}
```

| Situation | Statut | Code |
|---|---|---|
| Données invalides | 400 | `VALIDATION_ECHOUEE` |
| Séance absente | 404 | `SEANCE_INTROUVABLE` |
| Capacité insuffisante / doublon | 409 | `CAPACITE_INSUFFISANTE` |
| Non authentifié | 401 | réponse Spring Security |
| Rôle insuffisant | 403 | réponse Spring Security |

## 7. Décision de concurrence

**Invariant :** pour une séance, la somme des places des réservations confirmées ne dépasse jamais la capacité de la salle.

**Stratégie retenue :** ☐ verrou pessimiste  ☐ verrou optimiste

**Mise en œuvre :** ………
(ex. `@Lock(PESSIMISTIC_WRITE)` sur la lecture de la séance dans `ReservationService.reserver`, dans une transaction qui calcule les places restantes puis enregistre la réservation.)

**Justification :**
- ………
- Fonctionne avec plusieurs threads **et** plusieurs instances, car le verrou est pris par la base.
- En cas de conflit : réponse **409** et aucune réservation partielle (rollback).

**Scénario vérifié :** 5 places restantes, 2 requêtes simultanées de 4 places → une seule réussit (test de concurrence `………`).

## 8. Exploitation

- `/actuator/health` est public.
- Les autres endpoints Actuator ne sont pas exposés (`management.endpoints.web.exposure.include=health`).
- Migrations dans `src/main/resources/db/migration` :
  - `V1__schema.sql` : tables, clés étrangères, index, contraintes d'unicité
  - `V2__donnees_demo.sql` : films, salle et séance de démonstration

## 9. Tests

| Type | Classe(s) | Ce qui est couvert |
|---|---|---|
| Service unitaire | `………` | montant, capacité insuffisante, annulation |
| MVC | `………` | création valide, 400, 401, 403 |
| JPA | `………` | somme des places confirmées / recherche |
| Intégration MySQL (Testcontainers) | `………` | migration, réservation réelle, contrainte |
| Concurrence | `………` | 2 réservations simultanées |

**Limitation connue :** ………
(ex. « Docker indisponible sur mon poste : les tests Testcontainers sont présents mais n'ont pas pu être exécutés ; les autres tests passent. » À supprimer si non applicable.)

## 10. Recette (état d'avancement)

| ID | Contrôle | État |
|---|---|---|
| A1 | `clean verify` avec Java 25 | ☐ |
| A2 | Base neuve : Flyway + validation Hibernate | ☐ |
| A3 | Lecture publique anonyme | ☐ |
| A4 | 0 ou 9 places → 400 | ☐ |
| A5 | Sécurité : CLIENT / ADMIN / anonyme | ☐ |
| A6 | Réservation valide → 201 | ☐ |
| A7 | Capacité dépassée → 409 sans écriture partielle | ☐ |
| A8 | Concurrence sans surréservation | ☐ |
| A9 | Annulation → 204 et places libérées | ☐ |
| A10 | Health et OpenAPI accessibles | ☐ |

## 11. Bonus (si réalisés)

- ☐ ETag / contrôle de version : ………
- ☐ Idempotence de la réservation (clé client) : ………
- ☐ Métrique Micrometer : ………

## 12. Structure du projet

```
src/main/java/………/
  controller/     contrôleurs fins
  service/        règles métier et transactions
  repository/     Spring Data JPA
  domain/         entités JPA
  dto/            DTO immuables (records)
  exception/      exceptions métier + ControllerAdvice
  config/         sécurité, OpenAPI
src/main/resources/
  application.properties
  db/migration/   migrations Flyway
src/test/java/………/
```

## 13. Points restants / difficultés

- ………

## 14 Spécifications d'utilisation de l'IA