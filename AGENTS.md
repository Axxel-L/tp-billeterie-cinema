# AGENTS.md — Billetterie cinéma

## Contexte

Application de billetterie (BUT Info 3, R5.08) : back-end Spring Boot + SPA React.
Le sujet impose la stack et le barème ; toute modification doit préserver
`./mvnw clean verify` sur un clone propre.

## Stack verrouillée

- Java **25** (`maven.compiler.release=25`, jamais `source`/`target`)
- Spring Boot **4.1.1** (parent Maven, ne pas changer de version)
- Maven Wrapper versionné (`mvnw`, `mvnw.cmd`, `.mvn/`)
- MySQL 8 (Docker Compose), Flyway, Hibernate `ddl-auto=validate`
- springdoc-openapi **3.1.1**
- Frontend : Vite + React 19 + TypeScript, isolé dans `frontend/`

Ne pas ajouter de dépendance sans nécessité absolue (pas de Lombok, MapStruct,
Redis, Kafka, JWT, paiement). Les versions gérées par le parent ne se répètent pas.

## Commandes

```bash
docker compose up -d                 # MySQL local (8.4)
cp .env.example .env                 # TMDB_API_KEY=... (ignoré par Git)
./mvnw clean verify                  # build + tests : la référence
./mvnw spring-boot:run               # API sur :8080
java -jar target/billetterie-cinema-1.0.0.jar

bun run init                         # .env + MySQL + dépendances frontend
bun run dev                          # backend :8080 + Vite :5173
bun run build                        # SPA puis JAR
bun run verify                       # typecheck + clean verify
bun run start                        # exécute le JAR

cd frontend
bun install                          # jamais npm / pnpm / yarn
bun run dev                          # Vite :5173, proxy /api -> :8080
bun run typecheck
bun run build                        # build vers src/main/resources/static
```

`application.yml` importe `./.env` (`spring.config.import`) ; ne jamais committer `.env`.
Une variable d'environnement exportée reste prioritaire.

Le backend utilise Maven et le frontend **Bun** exclusivement (installation,
scripts, build). Ne pas régénérer `package-lock.json`.

Avec colima (macOS), Testcontainers a besoin de :

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```

Sans Docker, les tests Testcontainers sont **ignorés** (`disabledWithoutDocker`),
les autres doivent rester verts.

## Règles d'architecture

- Contrôleurs fins, règles métier dans `service`, accès données dans `repository`.
- DTO = `record` immuables dans `web/dto` ; ne jamais exposer une entité JPA.
- Validation Jakarta sur les entrées, avant l'appel métier.
- Erreurs centralisées dans `error/GlobalExceptionHandler` → corps `ApiError`,
  jamais de stack trace ni de SQL dans la réponse.
- Nommage métier en français (`Film`, `Salle`, `Seance`, `Reservation`),
  technique en anglais (`Service`, `Repository`, `Controller`).

## Invariants à ne pas casser

- `somme(places CONFIRMEE) <= salle.capacite`, y compris en concurrence.
- Création de réservation : `@Transactional(isolation = READ_COMMITTED)` +
  `SeanceRepository.findByIdForUpdate` (`PESSIMISTIC_WRITE`). Aucun verrou mémoire.
- Annulation : idempotente, ne peut que libérer de la capacité.
- HTTP Basic + rôles `CLIENT`, `PROGRAMMATEUR`, `ADMIN` (ADMIN hérite des deux).
- Lectures publiques : films, séances, salles, santé, OpenAPI, assets SPA.
- Aucun secret réel ; les comptes de démo sont documentés dans le README.
- Frontend : aucun token ni mot de passe dans `localStorage`, pas de CDN,
  assets auto-hébergés, effets respectant `prefers-reduced-motion`.

## Performance frontend

- Pas de WebGL. Le moteur liquid glass (filtres SVG + `backdrop-filter`) est limité à
  `lg-navbar` et `lg-button` ; les panneaux restent en verre CSS. Ne pas l'étendre aux cartes.
- Le fond `GridScan` est en CSS (transform/opacity uniquement), sans shader plein écran.
- Les médias des films arrivent avec `GET /api/films` : ne pas réintroduire une requête
  par carte. Utiliser `srcset` (w342/w500/w780), `loading="lazy"` et `SmartImage`.
- Chaque page doit rester derrière `PageGate` tant que ses données et ses images visibles
  ne sont pas prêtes (timeout 3 s).
- La vidéo du hero est un trailer muet en autoplay sur desktop ; elle est désactivée sur
  mobile, en `prefers-reduced-motion` et en économie de données. Le son reste à la demande.

## Pièges connus

- `@DataJpaTest` remplace la DataSource : garder `@AutoConfigureTestDatabase(replace = NONE)`.
- MySQL est en `REPEATABLE READ` par défaut : l'isolation de la réservation est explicite.
- `spring-boot-starter-webmvc-test`, `-data-jpa-test`, `-security-test` ont des
  packages de test dédiés en Boot 4 (ex. `org.springframework.boot.webmvc.test.autoconfigure`).
- Le build Maven ne doit jamais dépendre de Node/Bun.
- `RestClient.Builder` n'est pas auto-configuré : construire le client dans `MediaConfig`.
- Le dépôt est dans un dossier synchronisé iCloud : des copies « fichier 2.java » peuvent
  apparaître. Les supprimer avant de builder :
  `find -E . -path ./.git -prune -o -type f -regex '.* [0-9]+(\.[^/]*)?$' -delete` ;
  `.gitignore` ignore ces suffixes.

## Médias et catalogue

- `GET /api/films/{id}/media` renvoie affiche, bannière, clé YouTube, synopsis et note.
  `GET /api/films` expose aussi ces champs pour éviter le N+1 côté SPA.
- Les 6 films de démonstration (V3) embarquent leurs URLs TMDB et leur clé YouTube :
  les affiches et la bande-annonce fonctionnent **sans clé**.
- Un film ajouté via `POST /api/programmation/films/depuis-tmdb` stocke ses médias
  en base ; la clé `TMDB_API_KEY` n'est nécessaire qu'au moment de la recherche/import.
- La clé vient uniquement de `TMDB_API_KEY` (v3 ou jeton v4) : jamais dans le frontend,
  jamais dans un fichier versionné.
- Cache mémoire 12 h ; un échec est mis en cache 10 min pour ne pas marteler TMDB.

## Réservations client

- `reservation.client_username` identifie le propriétaire (V3).
- `GET /api/reservations/mes-reservations` retourne les réservations confirmées à venir
  du compte connecté (CLIENT ou ADMIN).
- Un CLIENT ne peut annuler que ses propres réservations ; ADMIN peut tout annuler.

## CI et image

- `.github/workflows/ci.yml` : Maven (backend), Bun (frontend), puis image GHCR sur `main`.
- `Dockerfile` multi-stage : SPA compilée avec Bun, JAR compilé avec Maven, runtime JRE 25.
- Le job de déploiement ne s'exécute que sur `main` et pousse `ghcr.io/<repo>:latest` + SHA.

## Commits

- Messages **en français**, préfixés : `feat:`, `fix:`, `perf:`, `chore:` (infra/outillage,
  parfois noté `core:`), `docs:`, `test:`, `refactor:`.
- Sujet à l'impératif, ≤ 72 caractères, puis un corps qui explique le **pourquoi**
  et l'impact (barème, sécurité, concurrence, perf).
- Un commit = un changement cohérent. Ne pas mélanger backend, frontend et CI.
