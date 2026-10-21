import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { FilmIcon, BuildingOffice2Icon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { api, ApiException } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { GlassButton, GlassPanel } from "../components/Glass";
import { Skeleton } from "../components/Skeleton";
import { dateLocale, formatHeure, formatJour } from "../lib/format";

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
        <p className="mt-4 text-base leading-relaxed text-mist">
          Créez les films, les séances et les salles. Les formulaires suivent exactement les règles
          de validation du serveur.
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

      <div className="mt-6 max-w-2xl">
        {onglet === "film" ? <FormulaireFilm /> : null}
        {onglet === "seance" ? <FormulaireSeance /> : null}
        {onglet === "salle" && estAdmin ? <FormulaireSalle /> : null}
      </div>
    </div>
  );
}

function FormulaireFilm() {
  const clientRequetes = useQueryClient();
  const [titre, setTitre] = useState("");
  const [genre, setGenre] = useState("");
  const [duree, setDuree] = useState(120);
  const [dateSortie, setDateSortie] = useState(dateLocale(new Date()));
  const [retour, setRetour] = useState<Retour>(null);

  const creation = useMutation({
    mutationFn: api.creerFilm,
    onSuccess: (film) => {
      setRetour({ ton: "ok", texte: `« ${film.titre} » ajouté (id ${film.id}).` });
      setTitre("");
      setGenre("");
      void clientRequetes.invalidateQueries({ queryKey: ["films"] });
    },
    onError: (cause) => setRetour(messageErreur(cause, "Création du film impossible.")),
  });

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setRetour(null);
    creation.mutate({ titre, genre, dureeMinutes: duree, dateSortie });
  }

  return (
    <GlassPanel radius="26" className="p-6 sm:p-7">
      <h2 className="font-display text-xl font-extrabold tracking-tight">Nouveau film</h2>
      <form className="mt-5 space-y-4" onSubmit={soumettre}>
        <label className="block">
          <span className="field-label">Titre</span>
          <input
            className="input"
            value={titre}
            onChange={(evenement) => setTitre(evenement.target.value)}
            required
            maxLength={200}
          />
        </label>
        <label className="block">
          <span className="field-label">Genre</span>
          <input
            className="input"
            value={genre}
            onChange={(evenement) => setGenre(evenement.target.value)}
            required
            maxLength={80}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">Durée (min)</span>
            <input
              type="number"
              className="input"
              min={40}
              max={300}
              value={duree}
              onChange={(evenement) => setDuree(Number(evenement.target.value))}
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Date de sortie</span>
            <input
              type="date"
              className="input"
              value={dateSortie}
              onChange={(evenement) => setDateSortie(evenement.target.value)}
              required
            />
          </label>
        </div>
        <RetourMessage retour={retour} />
        <GlassButton type="submit" tone="tinted" disabled={creation.isPending}>
          {creation.isPending ? "Création…" : "Créer le film"}
        </GlassButton>
      </form>
    </GlassPanel>
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
        <RetourMessage retour={retour} />
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
        <RetourMessage retour={retour} />
        <GlassButton type="submit" tone="tinted" disabled={creation.isPending}>
          {creation.isPending ? "Création…" : "Créer la salle"}
        </GlassButton>
      </form>
    </GlassPanel>
  );
}

function RetourMessage({ retour }: { retour: Retour }) {
  if (!retour) {
    return null;
  }
  return (
    <p
      className={`rounded-xl border px-3 py-2 text-sm ${
        retour.ton === "ok"
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-brand/30 bg-brand/10 text-brand-2"
      }`}
      role={retour.ton === "erreur" ? "alert" : "status"}
    >
      {retour.texte}
    </p>
  );
}
