import { useEffect, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClockIcon, PlayIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { api } from "../api/client";
import type { Film } from "../api/types";
import { formatDateCourte, initiales } from "../lib/format";
import { GlassButton, GlassPanel } from "./Glass";
import { GlassLink } from "./GlassLink";

interface Props {
  film: Film;
  onClose: () => void;
}

export function FilmDialog({ film, onClose }: Props) {
  const [bandeAnnonce, setBandeAnnonce] = useState(false);
  const media = useQuery({
    queryKey: ["media", film.id],
    queryFn: () => api.filmMedia(film.id),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", surTouche);
    const ancien = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = ancien;
    };
  }, [onClose]);

  const cle = media.data?.bandeAnnonceCle;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-lg"
      role="presentation"
      onMouseDown={onClose}
    >
      <GlassPanel
        radius="30"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-film"
        className="relative w-full max-w-3xl overflow-hidden"
        style={{ "--lg-tint": "rgb(8 10 18 / 0.35)" } as CSSProperties}
        onMouseDown={(evenement) => evenement.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-white/15"
          aria-label="Fermer la fiche"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-[240px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden md:aspect-auto md:min-h-[360px]">
            {media.data?.afficheUrl ? (
              <img
                id="fiche-affiche"
                src={media.data.afficheUrl}
                alt={`Affiche de ${film.titre}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="hero-ambient flex h-full min-h-[280px] w-full items-center justify-center p-6">
                <span className="font-display text-6xl font-black tracking-tighter text-white/90">
                  {initiales(film.titre)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent md:bg-gradient-to-r" />
          </div>

          <div
            className="relative flex flex-col gap-5 p-6 sm:p-8"
            style={{
              background:
                "radial-gradient(130% 120% at 0% 0%, rgba(255,61,113,0.16), transparent 55%)",
            }}
          >
            <div>
              <p className="eyebrow">{film.genre}</p>
              <h2 id="titre-film" className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {film.titre}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-mist">
                <span>{formatDateCourte(film.dateSortie)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  {film.dureeMinutes} min
                </span>
                {media.data?.note ? (
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <StarIcon className="h-4 w-4" />
                    {media.data.note.toFixed(1)} / 10
                  </span>
                ) : null}
              </div>
            </div>

            <p className="max-w-prose text-sm leading-relaxed text-mist">
              {media.data?.synopsis ?? "Synopsis indisponible pour le moment."}
            </p>

            <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                { label: "Genre", valeur: film.genre },
                { label: "Durée", valeur: `${film.dureeMinutes} min` },
                { label: "Sortie", valeur: formatDateCourte(film.dateSortie) },
                {
                  label: "Note",
                  valeur: media.data?.note ? `${media.data.note.toFixed(1)} / 10` : "—",
                },
              ].map((element) => (
                <div
                  key={element.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-mist">
                    {element.label}
                  </dt>
                  <dd className="mt-1 font-semibold text-white">{element.valeur}</dd>
                </div>
              ))}
            </dl>

            {bandeAnnonce && cle ? (
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                <iframe
                  title={`Bande-annonce de ${film.titre}`}
                  src={`https://www.youtube-nocookie.com/embed/${cle}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap gap-3">
              <GlassLink to="/seances" tone="tinted">
                Voir les séances
              </GlassLink>
              {cle ? (
                <GlassButton onClick={() => setBandeAnnonce((actif) => !actif)}>
                  <PlayIcon className="h-4 w-4" />
                  {bandeAnnonce ? "Masquer la bande-annonce" : "Bande-annonce"}
                </GlassButton>
              ) : null}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
