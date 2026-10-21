import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  FilmIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { api, ApiException } from "../api/client";
import type { FilmRecherche } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { GlassButton, GlassPanel } from "../components/Glass";
import { Skeleton } from "../components/Skeleton";
import { formatHeure, formatJour, initiales } from "../lib/format";

type Onglet = "film" | "seance" | "salle";
type Retour = { ton: "ok" | "erreur"; texte: string } | null;

function messageErreur(cause: unknown, defaut: string): Retour {
  return { ton: "erreur", texte: cause instanceof ApiException ? cause.message : defaut };
}

export default function Admin() {
  const { session, hasRole, openLogin } = useAuth();
  const estAdmin = hasRole("ADMIN");
  const peutProgrammer = hasRole("ADMIN", "PROGRAMMATEUR");
  const [onglet, setOnglet] = useState<Onglet>("film");

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-40 sm:px-6">
        <GlassPanel radius="28" className="p-8 text-center sm:p-12">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Espace de pilotage</h1>
          <p className="mt-3 text-sm text-mist">
            Connectez-vous avec un compte programmateur ou administrateur.
          </p>
          <div className="mt-6 flex justify-center">
            <GlassButton tone="tinted" onClick={openLogin}>
              Se connecter
            </GlassButton>
          </div>
        </GlassPanel>
      </div>
    );
  }

  if (!peutProgrammer) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-40 sm:px-6">
        <GlassPanel radius="28" className="p-8 text-center sm:p-12">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Accès refusé</h1>
          <p className="mt-3 text-sm text-mist">
            Le compte {session.username} n'a pas les droits nécessaires.
          </p>
        </GlassPanel>
      </div>
    );
  }

  const onglets: { cle: Onglet; libelle: string; icone: typeof FilmIcon; visible: boolean }[] = [
    { cle: "film", libelle: "Films", icone: FilmIcon, visible: true },
    { cle: "seance", libelle: "Séances", icone: CalendarDaysIcon, visible: true },
    { cle: "salle", libelle: "Salles", icone: BuildingOffice2Icon, visible: estAdmin },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Programmation</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Pilotage
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Les films sont ajoutés depuis le catalogue TMDB : seules de vraies fiches peuvent
          entrer en base. Les séances et les salles restent saisies à la main.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Type de ressource">
        {onglets
          .filter((element) => element.visible)
          .map((element) => {
            const Icone = element.icone;
            return (
              <button
                key={element.cle}
                type="button"
                role="tab"
                aria-selected={onglet === element.cle}
                className="chip"
                onClick={() => setOnglet(element.cle)}
              >
                <Icone className="h-4 w-4" />
                {element.libelle}
              </button>
            );
          })}
      </div>

      <div className="mt-6 max-w-3xl">
        {onglet === "film" ? <RechercheFilm /> : null}
        {onglet === "seance" ? <FormulaireSeance /> : null}
        {onglet === "salle" && estAdmin ? <FormulaireSalle /> : null}
      </div>
    </div>
  );
}

function RechercheFilm() {
  const clientRequetes = useQueryClient();
  const [saisie, setSaisie] = useState("");
  const [requete, setRequete] = useState("");
  const [retour, setRetour] = useState<Retour>(null);

  const resultats = useQuery({
    queryKey: ["recherche-films", requete],
    queryFn: () => api.rechercherFilms(requete),
    enabled: requete.length >= 2,
    retry: false,
  });

  const ajout = useMutation({
    mutationFn: api.creerFilmDepuisTmdb,
    onSuccess: (film) => {
      setRetour({ ton: "ok", texte: `« ${film.titre} » ajouté (id ${film.id}).` });
      void clientRequetes.invalidateQueries({ queryKey: ["films"] });
    },
    onError: (cause) => setRetour(messageErreur(cause, "Ajout du film impossible.")),
  });

  function chercher(evenement: FormEvent) {
    evenement.preventDefault();
    const propre = saisie.trim();
    if (propre.length < 2) {
      setRetour({ ton: "erreur", texte: "Saisissez au moins deux caractères." });
      return;
    }
    setRetour(null);
    setRequete(propre);
  }

  const erreur = resultats.error instanceof ApiException ? resultats.error : null;

  return (
    <GlassPanel radius="26" className="p-6 sm:p-7">
      <h2 className="font-display text-xl font-extrabold tracking-tight">Ajouter un film</h2>
      <p className="mt-1 text-sm text-mist">
        Recherche dans TMDB, puis import des métadonnées et du visuel par le serveur.
      </p>

      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={chercher}>
        <label className="block min-w-56 flex-1">
          <span className="field-label">Titre du film</span>
          <input
            className="input"
            value={saisie}
            onChange={(evenement) => setSaisie(evenement.target.value)}
            placeholder="Dune, Parasite, Interstellar…"
            required
          />
        </label>
        <GlassButton type="submit" tone="tinted">
          <MagnifyingGlassIcon className="h-4 w-4" />
          Rechercher
        </GlassButton>
      </form>

      {erreur ? (
        <p
          className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold"
          role="alert"
        >
          {erreur.status === 503
            ? "TMDB n'est pas configuré : définissez TMDB_API_KEY puis redémarrez l'API."
            : erreur.message}
        </p>
      ) : null}

      {retour ? (
        <p
          className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${
            retour.ton === "ok"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-brand/30 bg-brand/10 text-brand-2"
          }`}
          role={retour.ton === "erreur" ? "alert" : "status"}
        >
          {retour.texte}
        </p>
      ) : null}

      {resultats.isFetching ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {resultats.data && resultats.data.length === 0 && !resultats.isFetching ? (
        <p className="mt-5 text-sm text-mist">Aucun film trouvé pour « {requete} ».</p>
      ) : null}

      {resultats.data && resultats.data.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {resultats.data.map((film) => (
            <LigneResultat
              key={film.tmdbId}
              film={film}
              enCours={ajout.isPending && ajout.variables === film.tmdbId}
              onAjouter={() => {
                setRetour(null);
                ajout.mutate(film.tmdbId);
              }}
            />
          ))}
        </ul>
      ) : null}
    </GlassPanel>
  );
}

function LigneResultat({
  film,
  enCours,
  onAjouter,
}: {
  film: FilmRecherche;
  enCours: boolean;
  onAjouter: () => void;
}) {
  return (
    <li className="flex gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-ink-2">
        {film.afficheUrl ? (
          <img
            src={film.afficheUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="hero-ambient flex h-full items-center justify-center text-sm font-bold text-white/80">
            {initiales(film.titre)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-bold leading-tight">
          {film.titre}
          {film.annee ? <span className="ml-2 text-xs font-medium text-mist">{film.annee}</span> : null}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-mist">
          {film.synopsis ?? "Synopsis indisponible."}
        </p>
      </div>
      <div className="self-center">
        <button
          type="button"
          className="chip"
          onClick={onAjouter}
          disabled={enCours}
          aria-label={`Ajouter ${film.titre}`}
        >
          <PlusIcon className="h-4 w-4" />
          {enCours ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </li>
  );
}

function FormulaireSeance() {
  const clientRequetes = useQueryClient();
  const films = useQuery({ queryKey: ["films", "admin"], queryFn: () => api.films() });
  const salles = useQuery({ queryKey: ["salles"], queryFn: () => api.salles() });
  const [filmId, setFilmId] = useState<number | "">("");
  const [salleId, setSalleId] = useState<number | "">("");
  const [debut, setDebut] = useState("");
  const [prix, setPrix] = useState(9.9);
  const [retour, setRetour] = useState<Retour>(null);

  const creation = useMutation({
    mutationFn: api.creerSeance,
    onSuccess: (seance) => {
      setRetour({
        ton: "ok",
        texte: `Séance ${seance.filmTitre} le ${formatJour(seance.debut)} à ${formatHeure(seance.debut)} créée.`,
      });
      setDebut("");
      void clientRequetes.invalidateQueries({ queryKey: ["seances"] });
    },
    onError: (cause) => setRetour(messageErreur(cause, "Création de la séance impossible.")),
  });

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setRetour(null);
    if (!filmId || !salleId || !debut) {
      setRetour({ ton: "erreur", texte: "Film, salle et date sont obligatoires." });
      return;
    }
    creation.mutate({
      filmId: Number(filmId),
      salleId: Number(salleId),
      debut: debut.length === 16 ? `${debut}:00` : debut,
      prixUnitaire: prix,
    });
  }

  return (
    <GlassPanel radius="26" className="p-6 sm:p-7">
      <h2 className="font-display text-xl font-extrabold tracking-tight">Nouvelle séance</h2>
      <form className="mt-5 space-y-4" onSubmit={soumettre}>
        <label className="block">
          <span className="field-label">Film</span>
          {films.isPending ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <select
              className="select"
              value={filmId}
              onChange={(evenement) => setFilmId(Number(evenement.target.value))}
              required
            >
              <option value="" disabled>
                Choisir un film
              </option>
              {films.data?.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.titre}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="block">
          <span className="field-label">Salle</span>
          {salles.isPending ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <select
              className="select"
              value={salleId}
              onChange={(evenement) => setSalleId(Number(evenement.target.value))}
              required
            >
              <option value="" disabled>
                Choisir une salle
              </option>
              {salles.data?.map((salle) => (
                <option key={salle.id} value={salle.id}>
                  {salle.nom} ({salle.capacite} places)
                </option>
              ))}
            </select>
          )}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Début</span>
            <input
              type="datetime-local"
              className="input"
              value={debut}
              onChange={(evenement) => setDebut(evenement.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Prix unitaire</span>
            <input
              type="number"
              className="input"
              min={0.01}
              step={0.01}
              value={prix}
              onChange={(evenement) => setPrix(Number(evenement.target.value))}
              required
            />
          </label>
        </div>
        {retour ? (
          <p
            className={`rounded-2xl border px-3 py-2 text-sm ${
              retour.ton === "ok"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-brand/30 bg-brand/10 text-brand-2"
            }`}
            role={retour.ton === "erreur" ? "alert" : "status"}
          >
            {retour.texte}
          </p>
        ) : null}
        <GlassButton type="submit" tone="tinted" disabled={creation.isPending}>
          {creation.isPending ? "Création…" : "Créer la séance"}
        </GlassButton>
      </form>
    </GlassPanel>
  );
}

function FormulaireSalle() {
  const clientRequetes = useQueryClient();
  const [nom, setNom] = useState("");
  const [capacite, setCapacite] = useState(80);
  const [retour, setRetour] = useState<Retour>(null);

  const creation = useMutation({
    mutationFn: api.creerSalle,
    onSuccess: (salle) => {
      setRetour({ ton: "ok", texte: `Salle « ${salle.nom} » créée (${salle.capacite} places).` });
      setNom("");
      void clientRequetes.invalidateQueries({ queryKey: ["salles"] });
    },
    onError: (cause) => setRetour(messageErreur(cause, "Création de la salle impossible.")),
  });

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setRetour(null);
    creation.mutate({ nom, capacite });
  }

  return (
    <GlassPanel radius="26" className="p-6 sm:p-7">
      <h2 className="font-display text-xl font-extrabold tracking-tight">Nouvelle salle</h2>
      <form className="mt-5 space-y-4" onSubmit={soumettre}>
        <label className="block">
          <span className="field-label">Nom</span>
          <input
            className="input"
            value={nom}
            onChange={(evenement) => setNom(evenement.target.value)}
            required
            maxLength={120}
          />
        </label>
        <label className="block">
          <span className="field-label">Capacité (20 à 500)</span>
          <input
            type="number"
            className="input"
            min={20}
            max={500}
            value={capacite}
            onChange={(evenement) => setCapacite(Number(evenement.target.value))}
            required
          />
        </label>
        {retour ? (
          <p
            className={`rounded-2xl border px-3 py-2 text-sm ${
              retour.ton === "ok"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-brand/30 bg-brand/10 text-brand-2"
            }`}
            role={retour.ton === "erreur" ? "alert" : "status"}
          >
            {retour.texte}
          </p>
        ) : null}
        <GlassButton type="submit" tone="tinted" disabled={creation.isPending}>
          {creation.isPending ? "Création…" : "Créer la salle"}
        </GlassButton>
      </form>
    </GlassPanel>
  );
}
