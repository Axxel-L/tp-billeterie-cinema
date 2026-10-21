import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const estWindows = process.platform === "win32";
export const mvnw = estWindows ? "mvnw.cmd" : "./mvnw";
export const dossierFrontend = path.join(racine, "frontend");

export function environnementDocker() {
  const env = { ...process.env };
  const socket = path.join(os.homedir(), ".colima", "default", "docker.sock");
  if (!env.DOCKER_HOST && existsSync(socket)) {
    env.DOCKER_HOST = `unix://${socket}`;
    env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE ??= "/var/run/docker.sock";

    // Évite le helper de credentials Docker Desktop quand on utilise colima.
    const configDir = path.join(os.tmpdir(), "billetterie-docker-config");
    try {
      mkdirSync(configDir, { recursive: true });
      writeFileSync(path.join(configDir, "config.json"), "{}\n");
      env.DOCKER_CONFIG ??= configDir;
    } catch {
      // Le build reste utilisable avec la configuration Docker par défaut.
    }
  }
  return env;
}

export function commande(nom, args, options = {}) {
  return spawnSync(nom, args, {
    cwd: racine,
    stdio: "inherit",
    shell: estWindows,
    ...options,
  });
}

export function commandeDocker(args) {
  const env = environnementDocker();
  const plugin = spawnSync("docker", ["compose", "version"], {
    stdio: "ignore",
    env,
  });
  const nom = plugin.status === 0 ? "docker" : "docker-compose";
  const argumentsCommande = plugin.status === 0 ? ["compose", ...args] : args;
  return spawnSync(nom, argumentsCommande, {
    cwd: racine,
    stdio: "inherit",
    env,
  });
}

export function executer(nom, args, options = {}) {
  const resultat = commande(nom, args, options);
  if (resultat.status !== 0) {
    process.exit(resultat.status ?? 1);
  }
  return resultat;
}
