# Examen TP – Billetterie de cinéma (BUT Info 3, R5.08)

**Durée :** 4 h · **Par deux** · **Barème :** 20 points
**Stack :** Java 25 · Maven · Spring Boot 4.1.1 · MySQL
**Livrable :** dépôt Maven complet et exécutable
**Commande de référence :** `./mvnw clean verify` (ou `.\mvnw.cmd clean verify` sous Windows)

> Le résultat de `clean verify` prime sur l'IDE. Si le projet ne compile pas avec le Wrapper, la recette automatisée ne peut pas tourner et les points sur les comportements non vérifiables sont perdus.

---

## 0. Mission en bref

Terminer le backend d'une billetterie : publier films et séances, protéger l'administration, accepter des réservations, et **ne jamais dépasser la capacité de la salle**, même avec deux requêtes concurrentes (threads ou instances).

---

## 1. Environnement et Maven (1,5 pt)

- [ ] Parent `spring-boot-starter-parent` **4.1.1** conservé
- [ ] Java 25 déclaré **une seule fois** (`maven.compiler.release` = 25), pas de `source`/`target` contradictoires
- [ ] Maven Wrapper versionné (`mvnw`, `mvnw.cmd`, `.mvn/`)
- [ ] Vérifier `./mvnw -version` (JDK de Maven = Java 25)
- [ ] Pas de versions répétées pour les dépendances gérées par le parent
- [ ] Scopes corrects (`runtime` pour `flyway-mysql` et `mysql-connector-j`, `test` pour les tests)
- [ ] `spring-boot-maven-plugin` dans `<build>`, pas dans `<dependencies>`
- [ ] Lombok / MapStruct facultatifs : si ajoutés, processeurs déclarés explicitement (compatibles Java 25) ; sinon s'en passer
- [ ] Retirer les dépendances inutiles (pas de Redis, Kafka, RabbitMQ, paiement, JWT…)

### Dépendances

| Scope | Dépendance |
|---|---|
| compile | `spring-boot-starter-webmvc` |
| compile | `spring-boot-starter-data-jpa` |
| compile | `spring-boot-starter-validation` |
| compile | `spring-boot-starter-security` |
| compile | `spring-boot-starter-flyway` |
| compile | `spring-boot-starter-actuator` |
| compile | `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.1.1` (version explicite) |
| runtime | `org.flywaydb:flyway-mysql` |
| runtime | `com.mysql:mysql-connector-j` |
| test | `spring-boot-starter-test` |
| test | `spring-boot-starter-webmvc-test` |
| test | `spring-boot-starter-data-jpa-test` |
| test | `spring-boot-starter-security-test` |
| test | `spring-boot-testcontainers` |
| test | `org.testcontainers:testcontainers-mysql` |
| test | `org.testcontainers:testcontainers-junit-jupiter` |

---

## 2. Persistance et migrations (3,5 pts)

### Modèle métier

| Entité | Champs minimaux | Règles |
|---|---|---|
| **Film** | id, titre, genre, dureeMinutes, dateSortie | titre obligatoire ; durée 40–300 min |
| **Salle** | id, nom, capacite | nom **unique** ; capacité 20–500 |
| **Séance** | id, film, salle, debut, prixUnitaire | film et salle obligatoires ; prix > 0 |
| **Réservation** | id, code, seance, emailClient, nombrePlaces, statut, creeeLe | 1 à 8 places ; code **unique** ; statut `CONFIRMEE` ou `ANNULEE` |

### À faire

- [ ] Migration Flyway **V1** : tables, clés étrangères, index, contraintes
- [ ] Données de démo (quelques films, une salle, une séance) dans une migration ou un jeu de données distinct
- [ ] `spring.jpa.hibernate.ddl-auto=validate` (aucune création de schéma par Hibernate)
- [ ] Base reconstructible **uniquement** via les migrations
- [ ] Prix en `BigDecimal` côté Java et `DECIMAL(p,s)` côté SQL
- [ ] Unicité sur `reservation.code` et `salle.nom`
- [ ] Pas de H2 : MySQL uniquement
- [ ] Noms cohérents (français ou anglais) dans le code et l'API

---

## 3. API REST et qualité du contrat (4,5 pts)

### Endpoints

| Méthode et chemin | Accès | Résultat |
|---|---|---|
| `GET /api/films` | Public | 200, liste filtrable par titre ou genre |
| `GET /api/seances?du=&au=` | Public | 200, séances dans l'intervalle |
| `POST /api/programmation/films` | PROGRAMMATEUR ou ADMIN | 201 |
| `POST /api/programmation/seances` | PROGRAMMATEUR ou ADMIN | 201 ou 400 |
| `POST /api/admin/salles` | ADMIN | 201, 400 ou 409 |
| `POST /api/reservations` | CLIENT | 201, 400, 404 ou 409 |
| `DELETE /api/reservations/{code}` | CLIENT ou ADMIN | 204 ou 404 |
| `GET /actuator/health` | Public | 200 |

### Exigences

- [ ] Contrôleurs **fins** ; règles métier dans les **services** ; **repositories** Spring Data
- [ ] **DTO immuables** (par ex. `record`) en entrée et en sortie ; **jamais d'entités JPA** renvoyées
- [ ] Validation Jakarta des entrées avant l'appel métier
- [ ] Lectures publiques sans données techniques inutiles
- [ ] En-tête `Location` sur les créations (si possible)
- [ ] Réponse de `POST /api/reservations` : **code, statut, nombre de places, montant total calculé côté serveur**

Exemple de requête :

```json
{
  "seanceId": 12,
  "emailClient": "lea@example.test",
  "nombrePlaces": 3
}
```

### Gestion des erreurs (`@ControllerAdvice`)

- [ ] Centralisée, corps JSON stable, **sans stack trace ni détail SQL**

```json
{
  "timestamp": "2026-10-17T09:12:00Z",
  "status": 409,
  "code": "CAPACITE_INSUFFISANTE",
  "message": "Il ne reste que 2 places pour cette séance",
  "path": "/api/reservations"
}
```

| Situation | Statut | Exemple de code |
|---|---|---|
| Données invalides | 400 | `VALIDATION_ECHOUEE` |
| Ressource absente | 404 | `SEANCE_INTROUVABLE` |
| Capacité insuffisante ou doublon | 409 | `CAPACITE_INSUFFISANTE` |
| Authentification absente | 401 | réponse Spring Security |
| Rôle insuffisant | 403 | réponse Spring Security |

- [ ] Exceptions métier **spécifiques**, traduites au bon statut HTTP

---

## 4. Sécurité (2,5 pts)

- [ ] Spring Security avec **HTTP Basic**
- [ ] Mots de passe **BCrypt**, jamais en clair dans le code source
- [ ] 3 comptes de démo (en mémoire possible), **documentés dans le README**

| Rôle | Droits |
|---|---|
| `CLIENT` | Créer et annuler une réservation |
| `PROGRAMMATEUR` | Créer films et séances |
| `ADMIN` | Créer des salles + accès à toutes les opérations protégées |

- [ ] Routes de lecture, OpenAPI/Swagger et `/actuator/health` : **publics**
- [ ] Autres endpoints Actuator **non exposés** publiquement
- [ ] Anonyme sur route protégée → 401 ; rôle insuffisant → 403

---

## 5. Capacité et concurrence (3,5 pts)

**Invariant :** pour une séance, somme des places des réservations `CONFIRMEE` ≤ capacité de la salle. Une annulation libère les places.

- [ ] Règle dans une **transaction** (`@Transactional` sur le service)
- [ ] Calcul des places restantes + enregistrement = **une seule opération cohérente**
- [ ] Stratégie **fondée sur la base** : verrou pessimiste (`PESSIMISTIC_WRITE` sur la séance) **ou** verrou optimiste avec gestion du conflit
- [ ] **Pas** de synchronisation en mémoire (`synchronized`, `Lock`…)
- [ ] Conflit → **409**, **aucune réservation partielle**
- [ ] Choix **justifié dans le README**

**Scénario obligatoire :** séance avec 5 places restantes, 2 requêtes simultanées de 4 places → une seule réussit, pas de surréservation.

---

## 6. Tests (3,0 pts)

Tests lisibles, déterministes, exécutés par Maven. Qualité des risques couverts > quantité.

| Type | Couverture minimale |
|---|---|
| Service unitaire | calcul du montant, capacité insuffisante, annulation |
| MVC | création valide, validation 400, authentification 401, rôle 403 |
| JPA | requête de recherche ou de somme des places confirmées |
| Intégration MySQL | migration, réservation réelle, contrainte ou transaction |
| Concurrence | 2 réservations simultanées sur la même séance |

- [ ] Test MySQL avec **Testcontainers**
- [ ] Si Docker est impossible : **conserver le test** et expliquer la limitation dans le README ; les autres tests doivent continuer à passer

---

## 7. Exploitation et documentation (1,5 pt)

- [ ] `/actuator/health` exposé ; autres endpoints de gestion limités
- [ ] OpenAPI sur `/v3/api-docs` et Swagger UI sur `/swagger-ui.html`
- [ ] Vérifier le JAR hors IDE :

```bash
./mvnw clean verify
java -jar target/nom-du-projet.jar
```

### README court, avec

- [ ] Prérequis (JDK 25, Docker pour MySQL/Testcontainers)
- [ ] Démarrage de MySQL (Docker Compose)
- [ ] Commande de lancement et de vérification (`clean verify`)
- [ ] Les 3 comptes de test (identifiants, rôles)
- [ ] Liste des endpoints
- [ ] Décision de concurrence et sa justification
- [ ] Limitation Docker / Testcontainers si applicable

---

## 8. Recette fonctionnelle (exécutée sur copie propre du dépôt)

| ID | Contrôle | Résultat attendu |
|---|---|---|
| A1 | Environnement | Wrapper avec Java 25, `clean verify` OK |
| A2 | Base neuve | Flyway applique les migrations, Hibernate valide le schéma |
| A3 | Lecture publique | Anonyme obtient films et séances, JSON maîtrisé |
| A4 | Validation | Réservation à 0 ou 9 places → 400, corps d'erreur stable |
| A5 | Sécurité | CLIENT ne crée pas de salle ; ADMIN oui ; anonyme sur route protégée → 401 |
| A6 | Réservation | Valide → 201 avec code, statut, quantité, montant total |
| A7 | Capacité | Demande > places restantes → 409 sans écriture partielle |
| A8 | Concurrence | 2 demandes simultanées, aucune surréservation |
| A9 | Annulation | 204 et places libérées pour une réservation suivante |
| A10 | Exploitation | Health et OpenAPI accessibles aux chemins prévus |

---

## 9. Livrables

**À remettre :**
- [ ] Code source et tests (arborescence Maven standard)
- [ ] `pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/`
- [ ] Migrations Flyway versionnées
- [ ] Configuration **sans secret réel** ni mot de passe de production
- [ ] `README.md`

**À ne PAS remettre :** `target/`, fichiers de config IDE, journaux, secrets locaux.

---

## 10. Bonus (max 1 pt, plafonné à 20/20, doit être fonctionnel **et testé**)

- [ ] ETag / contrôle de version HTTP sur une ressource modifiable
- [ ] Idempotence de la création de réservation via une clé fournie par le client
- [ ] Métrique Micrometer (places réservées / refusées)

---

## 11. Points de vigilance Java 25

- Comparer : JDK du projet, JDK qui exécute Maven, runtime du `java -jar`
- Utiliser `release 25` (pas `source`/`target` contradictoires)
- Avec un processeur d'annotations : déclarer explicitement les processeurs ; un ancien Lombok peut échouer avec Java 25
- Après modification des processeurs : `clean verify` pour éliminer les sources générées obsolètes

---

## 12. Barème

| Critère | Points |
|---|---|
| Environnement et Maven | 1,5 |
| Persistance et migrations | 3,5 |
| API et qualité du contrat | 4,5 |
| Sécurité | 2,5 |
| Capacité et concurrence | 3,5 |
| Tests | 3,0 |
| Exploitation et documentation | 1,5 |
| **Total** | **20** |

---

## 13. Planning conseillé (≈ 4 h)

| Durée | Priorité |
|---|---|
| 25 min | Maven, dépendances, démarrage MySQL |
| 50 min | Migration et modèle JPA |
| 75 min | API, DTO, validation, erreurs |
| 40 min | Sécurité et rôles |
| 30 min | Transaction et concurrence |
| 20 min | Tests, documentation, vérification finale |

**Règles de qualité :** pas de logique de capacité dans les contrôleurs · transactions délimitées dans les services · exceptions métier spécifiques · dépendances inutiles retirables à la correction.

**Aide autorisée :** documentation officielle (Java, Maven, Spring Boot, Spring Security, Flyway, Testcontainers, springdoc). Un exemple externe ne dispense pas d'expliquer ses choix ni de respecter les versions imposées.