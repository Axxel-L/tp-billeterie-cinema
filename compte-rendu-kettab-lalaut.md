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

- Port : `3306`
- Utilisateur / mot de passe de **développement** : définis dans `docker-compose.yaml` (aucun secret de production dans le dépôt)

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

## 14 Spécifications d'utilisation de l'IA et autres sources

IA utilisée : Deepseek V4.1 Flash 
Applications utilisée : Kilo Code

Capture d'écran de la conversation avec Deepseek:
![image](https://media.discordapp.net/attachments/1290388444715159643/1562465280469246022/image.png?ex=6ada16b0&is=6ad8c530&hm=7a3f211dd653d188486d1d95bcbb56628931f0f0aea9b5dbb0294a64b999ddb3&=&format=webp&quality=lossless&width=1024&height=613)
![image2](https://media.discordapp.net/attachments/1290388444715159643/1562465280876216342/image.png?ex=6ada16b0&is=6ad8c530&hm=ff40878617fb396d678ab1d595f6cdd82a1687f3742a77e8481ba04c41e66e1b&=&format=webp&quality=lossless&width=1024&height=613)
![image3](https://media.discordapp.net/attachments/1290388444715159643/1562465281215828140/image.png?ex=6ada16b0&is=6ad8c530&hm=e4f724da7088558d3cf5d2d44bbe2a68dea1906a316528442436091b798073eb&=&format=webp&quality=lossless&width=1280&height=238)
![image4](https://media.discordapp.net/attachments/1290388444715159643/1562465281639456870/image.png?ex=6ada16b0&is=6ad8c530&hm=4bf2ff0710a8fbb5ba87cc6426f9de0837d01e74835900f3deded8d2d2e58046&=&format=webp&quality=lossless&width=1280&height=183)
![image5](https://media.discordapp.net/attachments/1290388444715159643/1562465282096758976/image.png?ex=6ada16b0&is=6ad8c530&hm=860510d79ef6ccf7fc2d2cefaf09c7a6f6c634caf13e2d7dbf3cde3b571c58fe&=&format=webp&quality=lossless&width=1024&height=613)
![image6](https://media.discordapp.net/attachments/1290388444715159643/1562465282491031562/image.png?ex=6ada16b0&is=6ad8c530&hm=0a5116b8686d593ca33c54aa5484737da2b1809efd276581caeaf63a188ea7ef&=&format=webp&quality=lossless&width=1024&height=613)
![image7](https://media.discordapp.net/attachments/1290388444715159643/1562465282906136636/image.png?ex=6ada16b0&is=6ad8c530&hm=19f6d78ee1701d5a89809baaedcd631c4c22de149d98ca74ab16f69fb168f3e2&=&format=webp&quality=lossless&width=1024&height=613)
![image8](https://media.discordapp.net/attachments/1290388444715159643/1562465283241803877/image.png?ex=6ada16b0&is=6ad8c530&hm=8c8527af4181127df0461b96ff618ddc027ae9d98025539cc74eb8724461df36&=&format=webp&quality=lossless&width=1024&height=613)
![image9](https://media.discordapp.net/attachments/1290388444715159643/1562476964835762307/image.png?ex=6ada2191&is=6ad8d011&hm=46aefb8454696ab6dc801729527b91a92f9fa07ef5c182e535d34f89f81a0584&=&format=webp&quality=lossless&width=1024&height=613)
![image10](https://media.discordapp.net/attachments/1290388444715159643/1562476965200531506/image.png?ex=6ada2191&is=6ad8d011&hm=3e1bf9a737d47d434eee66bffd17b3de6af719b95d4bdc9d3c685bae61a53ebc&=&format=webp&quality=lossless&width=1024&height=613)

Pour les animations de fond = https://reactbits.dev 