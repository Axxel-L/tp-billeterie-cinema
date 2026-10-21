import { useEffect, useRef, useState, type FormEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ApiException } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { GlassButton, GlassPanel } from "./Glass";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LoginDialog({ open, onClose }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("client123");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const premierChamp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    premierChamp.current?.focus();
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  async function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      await login(username.trim(), password);
      onClose();
    } catch (cause) {
      setErreur(cause instanceof ApiException ? cause.message : "Connexion impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/85 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <GlassPanel
        radius="28"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-connexion"
        className="w-full max-w-md p-6 sm:p-8"
        onMouseDown={(evenement) => evenement.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Espace personnel</p>
            <h2 id="titre-connexion" className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              Connexion
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={soumettre}>
          <label className="block">
            <span className="field-label">Identifiant</span>
            <input
              ref={premierChamp}
              className="input"
              value={username}
              onChange={(evenement) => setUsername(evenement.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Mot de passe</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(evenement) => setPassword(evenement.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {erreur ? (
            <p className="rounded-xl border border-brand/30 bg-brand/10 px-3 py-2 text-sm text-brand-2" role="alert">
              {erreur}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <GlassButton
              type="submit"
              tone="tinted"
              disabled={enCours}
              className="[&>button]:min-w-40"
            >
              {enCours ? "Connexion…" : "Se connecter"}
            </GlassButton>
            <GlassButton onClick={onClose}>Annuler</GlassButton>
          </div>
        </form>

        <p className="mt-6 text-xs leading-relaxed text-mist">
          Démonstration : <code className="code">client / client123</code>,{" "}
          <code className="code">programmateur / programmateur123</code>,{" "}
          <code className="code">admin / admin123</code>.
        </p>
      </GlassPanel>
    </div>
  );
}
