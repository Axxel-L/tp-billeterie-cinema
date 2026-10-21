# Billetterie cinéma — R5.08

Back-end Spring Boot de billetterie (films, salles, séances, réservations) avec une SPA
React. La règle centrale : **la somme des places confirmées d'une séance ne dépasse
jamais la capacité de la salle**, même avec deux réservations simultanées.

## Prérequis

- **JDK 25** (`java -version`)
- **Docker** (MySQL local, Testcontainers et image de déploiement)
- **Bun** pour le frontend (installation, scripts, build)

## Démarrage

```bash
docker compose up -d          # MySQL 8.4 sur :3306 (base billetterie)
./mvnw spring-boot:run        # API + SPA sur http://localhost:8080
```

Vérification de référence, sur un clone propre :

```bash
./mvnw clean verify
java -jar target/billetterie-cinema-1.0.0.jar
```

Sous macOS avec **colima**, Testcontainers ne trouve pas le socket par défaut :

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
./mvnw clean verify
```

Sans Docker, les tests Testcontainers sont ignorés (`@Testcontainers(disabledWithoutDocker = true)`)
et les autres restent verts : `clean verify` passe, mais la couverture MySQL n'est alors
pas exercée. C'est la limitation prévue par le sujet.

## Comptes de démonstration

| Identifiant | Mot de passe | Rôle | Droits |
|---|---|---|---|
| `client` | `client123` | `CLIENT` | Créer et annuler une réservation |
| `programmateur` | `programmateur123` | `PROGRAMMATEUR` | Créer films et séances |
| `admin` | `admin123` | `ADMIN` | Salles + toutes les opérations protégées |

Les mots de passe sont stockés sous forme de hachages **BCrypt** dans la configuration ;
aucun mot de passe en clair n'est présent dans le code. Les comptes sont en mémoire
(`InMemoryUserDetailsManager`) pour rester dans le périmètre du sujet.

## API

Authentification **HTTP Basic** ; lectures publiques sans identifiants.

| Méthode | Chemin | Accès | Réponse |
|---|---|---|---|
| GET | `/api/films?titre=&genre=` | public | 200, liste filtrable |
| GET | `/api/films/{id}` | public | 200 / 404 |
| GET | `/api/films/{id}/media` | public | 200, affiche/bannière/bande-annonce (vide sans clé) |
| GET | `/api/seances?du=&au=` | public | 200, dates ISO `yyyy-MM-dd` incluses |
| GET | `/api/seances/{id}` | public | 200 / 404, avec `placesRestantes` |
| GET | `/api/salles` | public | 200 (support du formulaire de programmation) |
| GET | `/api/auth/me` | authentifié | 200, identifiant et rôles |
| POST | `/api/programmation/films` | PROGRAMMATEUR, ADMIN | 201 + `Location` |
| GET | `/api/programmation/films/recherche?titre=` | PROGRAMMATEUR, ADMIN | 200, résultats TMDB (503 sans clé) |
| POST | `/api/programmation/films/depuis-tmdb` | PROGRAMMATEUR, ADMIN | 201, 409, 503 |
| POST | `/api/programmation/seances` | PROGRAMMATEUR, ADMIN | 201 + `Location`, 400 |
| POST | `/api/admin/salles` | ADMIN | 201, 400, 409 |
| POST | `/api/reservations` | CLIENT, ADMIN | 201, 400, 404, 409 |
| GET | `/api/reservations/mes-reservations` | CLIENT, ADMIN | 200, réservations à venir du compte |
| DELETE | `/api/reservations/{code}` | CLIENT (propriétaire), ADMIN | 204 (idempotent), 404 |
| GET | `/actuator/health` | public | 200 |
| GET | `/v3/api-docs` · `/swagger-ui.html` | public | OpenAPI / Swagger UI |

Exemple :

```bash
curl -u client:client123 -X POST http://localhost:8080/api/reservations \
  -H 'Content-Type: application/json' \
  -d '{"seanceId":1,"emailClient":"lea@example.test","nombrePlaces":3}'
```

```json
{"code":"RES-YMWW9YC31F76","statut":"CONFIRMEE","nombrePlaces":3,
 "montantTotal":29.70,"seanceId":1,"emailClient":"lea@example.test",
 "creeeLe":"2026-10-21T14:17:34.257798"}
```

### Catalogue et médias

La migration **V3** remplace la démo par **6 vrais films** (Chihiro, Parasite, Inception,
Dune : Deuxième Partie, Oppenheimer, Interstellar) avec leurs affiches TMDB, leurs clés
de bande-annonce YouTube, un synopsis et une note. **Aucune clé n'est nécessaire pour
les voir** : les URLs sont stockées en base et l'endpoint `GET /api/films/{id}/media`
les renvoie directement.

Pour ajouter un film, l'interface de pilotage interroge TMDB et n'accepte que des
fiches réelles :

```bash
export TMDB_API_KEY=...        # clé v3 (api_key) ou jeton v4 (Bearer)
./mvnw spring-boot:run
```

- `GET /api/programmation/films/recherche?titre=` cherche dans TMDB (titre, année,
  affiche, synopsis).
- `POST /api/programmation/films/depuis-tmdb` avec `{"tmdbId": 693134}` recharge la fiche
  **côté serveur** (titre, genre, durée, date, affiche, bannière, bande-annonce) et la
  stocke : le client ne peut pas inventer un film.
- Sans clé, la recherche répond **503 `TMDB_NON_CONFIGURE`** avec un message explicite
  dans l'UI ; les films déjà en base restent entièrement fonctionnels.
- La clé n'est **jamais** dans le bundle React ni dans un fichier versionné. Cache
  mémoire 12 h, échec 10 min.

### Mes réservations

`GET /api/reservations/mes-reservations` retourne les réservations **CONFIRMEE** dont la
séance est à venir, pour l'utilisateur authentifié. Chaque réservation est liée à son
propriétaire (`reservation.client_username`, V3) : un CLIENT ne peut annuler que les
siennes, un ADMIN peut annuler n'importe quel code. La page **Séances** affiche ce bloc
dès qu'un client est connecté, avec le code et un bouton d'annulation.

### Erreurs

Corps stable `ApiError` (`timestamp`, `status`, `code`, `message`, `path`), sans stack
trace ni détail SQL :

| Situation | Statut | Code |
|---|---|---|
| Validation Jakarta / JSON illisible | 400 | `VALIDATION_ECHOUEE` |
| Film ou salle inconnu à la création d'une séance | 400 | `FILM_INTROUVABLE`, `SALLE_INTROUVABLE` |
| Ressource absente | 404 | `SEANCE_INTROUVABLE`, `RESERVATION_INTROUVABLE`, … |
| Capacité insuffisante | 409 | `CAPACITE_INSUFFISANTE` |
| Nom de salle déjà utilisé | 409 | `SALLE_EXISTANTE` |
| Authentification absente / rôle insuffisant | 401 / 403 | réponses Spring Security |

## Persistance

- Flyway `V1__schema_initial.sql` (tables, clés étrangères, index, `CHECK`),
  `V2__donnees_demo.sql` (première démo) puis `V3__medias_et_reservations_client.sql`
  (colonnes médias, `reservation.client_username`, 6 films réels et leurs séances).
- `spring.jpa.hibernate.ddl-auto=validate` : Hibernate ne crée jamais le schéma.
- MySQL uniquement (pas de H2), prix en `BigDecimal` / `DECIMAL(8,2)`,
  unicité sur `reservation.code` et `salle.nom`.

## Capacité et concurrence

Choix : **verrou pessimiste sur la séance** (`SELECT … FOR UPDATE`) dans une transaction
`READ_COMMITTED`, plus un index `(seance_id, statut)` pour la somme des places.

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public ReservationResponse creer(ReservationRequest requete) {
    Seance seance = seanceRepository.findByIdForUpdate(requete.seanceId())...
    long dejaReservees = reservationRepository.sommePlaces(seance.getId(), CONFIRMEE);
    if (requete.nombrePlaces() > seance.getSalle().getCapacite() - dejaReservees) {
        throw new CapaciteInsuffisanteException(...);   // 409, aucune écriture
    }
    ...
}
```

Justification :

- Le verrou porte **sur la base**, donc il protège aussi plusieurs instances applicatives
  (aucun `synchronized`, aucun `Lock` mémoire).
- Deux réservations concurrentes sur la même séance sont sérialisées : la seconde attend
  le commit de la première, relit la somme et échoue en 409 sans écriture partielle.
- L'isolation est explicitement `READ_COMMITTED` : en `REPEATABLE READ` (défaut MySQL),
  la lecture de la somme pourrait réutiliser un snapshot antérieur au commit concurrent.
- Alternative écartée : verrou optimiste `@Version` + retry, non déterministe et plus
  fragile à tester ; compteur `places_restantes` dénormalisé, hors du modèle imposé.
- L'annulation ne prend pas le verrou : elle ne peut que **libérer** de la capacité et
  ne peut donc pas violer l'invariant. Elle est idempotente (204 si déjà annulée).

Scénario vérifié par `ReservationConcurrencyTest` : capacité 20, 15 places déjà prises,
deux requêtes simultanées de 4 places → exactement une réussit, total final 19 ≤ 20.

## Tests

| Classe | Type | Couverture |
|---|---|---|
| `ReservationServiceTest` | unitaire (Mockito) | montant, capacité, annulation, propriété, mes réservations |
| `MediaServiceTest` | unitaire (MockRestServiceServer) | mapping TMDB, recherche, détail, absence de clé |
| `ReservationControllerTest` | MVC (`@WebMvcTest`) | 201, 400, 401, 403, 201 admin |
| `ReservationRepositoryTest` | JPA + MySQL | somme des places confirmées, recherche par intervalle |
| `ReservationIntegrationTest` | intégration + MySQL | migrations, médias de démo, réservation, mes réservations, 409, 503 |
| `ReservationConcurrencyTest` | concurrence + MySQL | deux threads, aucune surréservation |

29 tests au total. Les tests MySQL utilisent **Testcontainers** (`mysql:8.4`) et sont
ignorés sans Docker. Le test de concurrence n'est pas `@Transactional` : chaque thread
ouvre sa propre transaction, ce qui est indispensable pour éprouver le verrou.

## Sécurité

- HTTP Basic, sessions `STATELESS`, BCrypt, hiérarchie `ADMIN > PROGRAMMATEUR` et
  `ADMIN > CLIENT`.
- **CSRF désactivé** : il n'y a ni cookie de session ni jeton côté client, donc aucune
  requête ambiante à protéger ; l'authentification est portée par l'en-tête `Authorization`.
- Injections SQL : uniquement Spring Data / JPQL paramétré, aucune concaténation.
- Un CLIENT ne peut annuler que ses propres réservations (comparaison du
  `client_username`) ; un ADMIN peut annuler n'importe quel code.
- Actuator : seul `health` est exposé, sans détail.
- La SPA ne conserve **aucun identifiant dans `localStorage`** : l'en-tête Basic vit en
  mémoire et disparaît au rechargement. Aucun CDN de code, aucun script tiers non versionné.
- L'intégration TMDB passe exclusivement par le serveur (clé en variable d'environnement).

## Frontend

```bash
cd frontend
bun install
bun run dev      # http://localhost:5173, proxy /api vers :8080
bun run build    # génère src/main/resources/static, servi par Spring
bun run typecheck
```

- **Bun** pour toutes les commandes (installation, dev, build, typecheck). Aucun
  `package-lock.json`.
- React 19 + Vite + TypeScript, **Tailwind CSS v4**, **Heroicons**, TanStack Query.
- **Liquid glass officiel** : `liquid-glass.js` et `components.js` auto-hébergés dans
  `public/liquidglass/`, chargés après le premier rendu React. Les éléments `<lg-navbar>`,
  `<lg-panel>` et `<lg-button>` sont utilisés directement, thémés par les variables
  `--lg-*` (aucune surcouche de style).
- **Fond animé** : composant React Bits `GradientASCII` (WebGL2) copié dans
  `src/components/`, avec repli CSS et respect de `prefers-reduced-motion`.
- **Bande-annonce en fond de hero** : lue via `youtube-nocookie.com` avec les clés
  stockées en base, désactivée en mobile, en économie de données et en mouvement réduit.
- Affiches et bannières réelles (TMDB) ; dégradés générés en repli.
- Le formulaire d'ajout de film passe par la recherche TMDB : impossible de saisir un
  film qui n'existe pas. Les séances et les salles restent manuelles.
- Performance : routes en `lazy()`, CSS découpé, polices Manrope auto-hébergées, zéro CDN
  de code, squelettes, `prefers-reduced-motion` et `prefers-reduced-transparency`.
- Le build Maven ne dépend jamais de Bun ; les assets générés sont ignorés par Git.

## CI et déploiement

`.github/workflows/ci.yml` s'exécute sur chaque push et pull request :

1. **backend** : JDK 25, `./mvnw clean verify` (Testcontainers disponibles sur le runner),
   rapports Surefire et JAR en artefacts ;
2. **frontend** : Bun, `bun install --frozen-lockfile`, `bun run typecheck`, `bun run build`,
   SPA en artefact ;
3. **deploy** (uniquement `main`) : image Docker multi-stage poussée sur
   `ghcr.io/<repo>:latest` et `:sha`.

```bash
docker build -t billetterie-cinema .
docker run --rm -p 8080:8080 \
  -e DB_URL='jdbc:mysql://host.docker.internal:3306/billetterie' \
  billetterie-cinema
```

## Structure

```
src/main/java/fr/butinfo/r508/billetterie/
  config/       SecurityConfig, OpenApiConfig, MediaConfig, TmdbProperties
  domain/       Film, Salle, Seance, Reservation, StatutReservation
  repository/   Spring Data JPA (+ verrou pessimiste)
  service/      règles métier, transactions, concurrence, médias TMDB
  web/          contrôleurs REST + dto/ (records)
  error/        exceptions métier, ApiError, GlobalExceptionHandler
src/main/resources/db/migration/   V1 schéma, V2 données de démo
src/test/java/                     unitaire, MVC, JPA, intégration, concurrence
frontend/                          SPA Vite + React 19 + Tailwind + liquid glass
.github/workflows/ci.yml           backend, frontend, image GHCR
Dockerfile                         build Bun + Maven + runtime JRE 25
```

## Dépannage

- **Fichiers « 2 », « 3 »…** : le dépôt est dans un dossier synchronisé iCloud, qui peut
  créer des copies de conflit. Avant un build :
  `find src -name "* [0-9].*" -delete` puis `./mvnw clean verify`.
- **Testcontainers** : avec colima, exporter `DOCKER_HOST` et
  `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` (voir plus haut), sinon les tests MySQL sont
  ignorés.
- **Aucune affiche** : les 6 films de démo en ont une sans configuration. Pour en ajouter
  d'autres, `TMDB_API_KEY` est nécessaire.

## Bonus

Non implémentés (ETag, idempotence par clé client, métrique Micrometer) : le socle
demandé et les tests de concurrence ont été priorisés.
