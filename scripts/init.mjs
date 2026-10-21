import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  commande,
  commandeDocker,
  dossierFrontend,
  racine,
} from "./_utils.mjs";

console.log("Billetterie cinéma · initialisation\n");

const bun = commande("bun", ["--version"], { stdio: "ignore" });
if (bun.status !== 0) {
  console.error("Bun est requis : https://bun.sh");
  process.exit(1);
}

const java = commande("java", ["-version"], { stdio: "pipe", encoding: "utf8" });
const versionJava = `${java.stderr ?? ""}${java.stdout ?? ""}`.match(/version "(\d+)/)?.[1];
if (java.status !== 0) {
  console.error("Java est requis (JDK 25) : https://adoptium.net");
  process.exit(1);
}
if (versionJava !== "25") {
  console.warn(`JDK ${versionJava} détecté. Le sujet attend Java 25 ; le build cible release 25.`);
}

const fichierEnv = path.join(racine, ".env");
if (!existsSync(fichierEnv)) {
  copyFileSync(path.join(racine, ".env.example"), fichierEnv);
  console.log("Fichier .env créé depuis .env.example (TMDB_API_KEY facultative).");
}

console.log("Démarrage de MySQL…");
const compose = commandeDocker(["up", "-d"]);
if (compose.status !== 0) {
  console.error("Impossible de démarrer MySQL. Vérifier Docker (ou colima start).");
  process.exit(1);
}

console.log("Installation des dépendances frontend…");
const installation = commande("bun", ["install", "--frozen-lockfile"], {
  cwd: dossierFrontend,
});
if (installation.status !== 0) {
  process.exit(installation.status ?? 1);
}

console.log(`
Prêt :
  bun run dev      Spring Boot :8080 + Vite :5173
  bun run verify   typecheck frontend + ./mvnw clean verify
  bun run build    SPA + JAR exécutable
  bun run start    java -jar target/billetterie-cinema-1.0.0.jar
`);
