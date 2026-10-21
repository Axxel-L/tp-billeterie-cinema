import { executer, estWindows, mvnw } from "./_utils.mjs";
import { dossierFrontend } from "./_utils.mjs";

console.log("Build de la SPA…");
executer("bun", ["run", "build"], { cwd: dossierFrontend });

console.log("Build du JAR…");
executer(mvnw, ["clean", "package", "-DskipTests"], { shell: estWindows });

console.log(`
JAR prêt : target/billetterie-cinema-1.0.0.jar
Lancement : bun run start
`);
