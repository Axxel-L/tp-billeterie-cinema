import { environnementDocker, executer, estWindows, mvnw } from "./_utils.mjs";
import { dossierFrontend } from "./_utils.mjs";

console.log("Typecheck du frontend…");
executer("bun", ["run", "typecheck"], { cwd: dossierFrontend });

console.log("Tests et packaging Maven…");
executer(mvnw, ["clean", "verify"], { shell: estWindows, env: environnementDocker() });

console.log("Vérification terminée.");
