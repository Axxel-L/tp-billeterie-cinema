import { PlayIcon, StarIcon } from "@heroicons/react/24/solid";
import type { Film } from "../api/types";
import { initiales } from "../lib/format";
import { SmartImage, tmdbSrcSet } from "./SmartImage";

interface Props {
  film: Film;
  index: number;
  onOuvrir: (film: Film) => void;
}

const DEGRADES = [
  "linear-gradient(150deg,#ff3d71 0%,#7a1d3a 52%,#0a0710 100%)",
  "linear-gradient(150deg,#7dd3fc 0%,#1d4a7a 52%,#070c12 100%)",
  "linear-gradient(150deg,#ffc46b 0%,#7a4a1d 52%,#120c07 100%)",
  "linear-gradient(150deg,#a78bfa 0%,#3b2a7a 52%,#0a0712 100%)",
];

export function FilmCard({ film, index, onOuvrir }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOuvrir(film)}
      className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-2 text-left shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] transition duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_40px_100px_-40px_rgba(255,61,113,0.35)]"
      aria-label={`Voir la fiche de ${film.titre}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center p-6"
          style={{ background: DEGRADES[index % DEGRADES.length] }}
        >
          <span className="font-display text-6xl font-black tracking-tighter text-white/90 drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
            {initiales(film.titre)}
          </span>
        </div>

        <SmartImage
          src={film.afficheUrl}
          srcSet={tmdbSrcSet(film.afficheUrl)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          alt={`Affiche de ${film.titre}`}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          eager={index < 4}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />

        {film.note ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs font-bold text-gold">
            <StarIcon className="h-3.5 w-3.5" />
            {film.note.toFixed(1)}
          </span>
        ) : null}

        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/35 opacity-0 transition duration-300 group-hover:opacity-100">
          <PlayIcon className="ml-0.5 h-6 w-6 text-white" />
        </span>

        <div className="absolute inset-x-0 bottom-0 z-20 p-4">
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight">
            {film.titre}
          </h3>
          <p className="mt-1 text-xs font-medium text-mist">
            {film.genre} · {film.dureeMinutes} min
          </p>
        </div>
      </div>
    </button>
  );
}
