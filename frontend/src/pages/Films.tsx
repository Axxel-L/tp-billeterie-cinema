import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState, type CSSProperties } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { api } from "../api/client";
import type { Film } from "../api/types";
import { AnimatedList } from "../components/AnimatedList";
import { FilmCard } from "../components/FilmCard";
import { FilmDialog } from "../components/FilmDialog";
import { CardSkeleton } from "../components/Skeleton";

export default function Films() {
  const [titre, setTitre] = useState("");
  const [genre, setGenre] = useState("");
  const [selection, setSelection] = useState<Film | null>(null);
  const titreDiffere = useDeferredValue(titre);

  const tous = useQuery({ queryKey: ["films", "tous"], queryFn: () => api.films() });
  const liste = useQuery({
    queryKey: ["films", titreDiffere, genre],
    queryFn: () =>
      api.films({
        titre: titreDiffere.trim() || undefined,
        genre: genre || undefined,
      }),
  });

  const genres = [...new Set(tous.data?.map((film) => film.genre) ?? [])].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Catalogue</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Films
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          {tous.data?.length ?? 0} films programmés. Filtrez par titre ou par genre : la recherche
          est faite côté serveur, pas dans le navigateur.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">Rechercher un film</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={titre}
            onChange={(evenement) => setTitre(evenement.target.value)}
            placeholder="Titre du film"
            className="input pl-12"
          />
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par genre">
          <button
            type="button"
            className="chip"
            aria-pressed={genre === ""}
            onClick={() => setGenre("")}
          >
            Tous
          </button>
          {genres.map((valeur) => (
            <button
              key={valeur}
              type="button"
              className="chip"
              aria-pressed={genre === valeur}
              onClick={() => setGenre(valeur)}
            >
              {valeur}
            </button>
          ))}
        </div>
      </div>

      {liste.isPending ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : liste.isError ? (
        <p className="mt-10 rounded-2xl border border-brand/30 bg-brand/10 p-5 text-sm text-brand-2" role="alert">
          Impossible de charger les films pour le moment.
        </p>
      ) : liste.data.length === 0 ? (
        <div className="surface mt-10 p-10 text-center">
          <p className="font-display text-xl font-bold">Aucun film ne correspond.</p>
          <p className="mt-2 text-sm text-mist">Essayez un autre titre ou retirez le filtre de genre.</p>
        </div>
      ) : (
        <AnimatedList className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liste.data.map((film, index) => (
            <div key={film.id} data-animate style={{ "--delay": `${index * 50}ms` } as CSSProperties}>
              <FilmCard film={film} index={index} onOuvrir={setSelection} />
            </div>
          ))}
        </AnimatedList>
      )}

      {selection ? <FilmDialog film={selection} onClose={() => setSelection(null)} /> : null}
    </div>
  );
}
