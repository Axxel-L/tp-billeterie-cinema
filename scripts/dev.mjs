import { spawn } from "node:child_process";
import {
  commandeDocker,
  dossierFrontend,
  environnementDocker,
  estWindows,
  mvnw,
  racine,
} from "./_utils.mjs";

console.log("Démarrage de MySQL…");
commandeDocker(["up", "-d"]);

const env = environnementDocker();
const backend = spawn(mvnw, ["spring-boot:run"], {
  cwd: racine,
  stdio: "inherit",
  env,
  shell: estWindows,
});
const frontend = spawn("bun", ["run", "dev"], {
  cwd: dossierFrontend,
  stdio: "inherit",
  env,
  shell: estWindows,
});

let arrete = false;
function arreter(code = 0) {
  if (arrete) {
    return;
  }
  arrete = true;
  backend.kill("SIGINT");
  frontend.kill("SIGINT");
  setTimeout(() => process.exit(code), 400);
}

process.on("SIGINT", () => arreter(0));
process.on("SIGTERM", () => arreter(0));
backend.on("exit", (code) => arreter(code ?? 0));
frontend.on("exit", (code) => arreter(code ?? 0));

console.log("API http://localhost:8080 · SPA http://localhost:5173");
