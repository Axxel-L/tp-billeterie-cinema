import { useEffect, useState } from "react";
import { ClockIcon, PlayIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Film } from "../api/types";
import { formatDateCourte, initiales } from "../lib/format";
import { urlVideo } from "../lib/video";
import { GlassButton, GlassPanel } from "./Glass";
import { GlassLink } from "./GlassLink";
import { SmartImage, tmdbSrcSet } from "./SmartImage";

interface Props {
  film: Film;
  onClose: () => void;
  lancerBandeAnnonce?: boolean;
}

export function FilmDialog({ film, onClose, lancerBandeAnnonce = false }: Props) {
  const [bandeAnnonce, setBandeAnnonce] = useState(lancerBandeAnnonce);
  const [videoChargee, setVideoChargee] = useState(false);

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

  const cle = film.bandeAnnonceCle;
  const sourceVideo = bandeAnnonce
    ? urlVideo(film.bandeAnnonceSite ?? "YouTube", cle, { autoplay: true, muted: false })
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/85 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <GlassPanel
        radius="30"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-film"
        className="relative w-full max-w-3xl overflow-hidden"
        onMouseDown={(evenement) => evenement.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-white/15"
          aria-label="Fermer la fiche"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-[240px_1fr]">
          <div className="relative aspect-[2/3] overflow-hidden bg-ink-2 md:aspect-auto md:min-h-[360px]">
            <div className="hero-ambient absolute inset-0 flex items-center justify-center p-6">
              <span className="font-display text-6xl font-black tracking-tighter text-white/90">
                {initiales(film.titre)}
              </span>
            </div>
            <SmartImage
              src={film.afficheUrl}
              srcSet={tmdbSrcSet(film.afficheUrl)}
              sizes="(max-width: 768px) 100vw, 240px"
              alt={`Affiche de ${film.titre}`}
              className="absolute inset-0 h-full w-full object-cover"
              eager
            />
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
              <h2
                id="titre-film"
                className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                {film.titre}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-mist">
                <span>{formatDateCourte(film.dateSortie)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  {film.dureeMinutes} min
                </span>
                {film.note ? (
                  <span className="inline-flex items-center gap-1.5 text-gold">
                    <StarIcon className="h-4 w-4" />
                    {film.note.toFixed(1)} / 10
                  </span>
                ) : null}
              </div>
            </div>

            <p className="max-w-prose text-sm leading-relaxed text-mist">
              {film.synopsis ?? "Synopsis indisponible pour le moment."}
            </p>

            <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                { label: "Genre", valeur: film.genre },
                { label: "Durée", valeur: `${film.dureeMinutes} min` },
                { label: "Sortie", valeur: formatDateCourte(film.dateSortie) },
                {
                  label: "Note",
                  valeur: film.note ? `${film.note.toFixed(1)} / 10` : "—",
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

            {sourceVideo ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
                {!videoChargee ? (
                  <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-[0.2em] text-mist">
                    Chargement de la bande-annonce…
                  </div>
                ) : null}
                <iframe
                  title={`Bande-annonce de ${film.titre}`}
                  src={sourceVideo}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setVideoChargee(true)}
                  className="relative h-full w-full"
                />
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap gap-3">
              <GlassLink to="/seances" tone="tinted">
                Voir les séances
              </GlassLink>
              {cle ? (
                <GlassButton
                  onClick={() => {
                    setVideoChargee(false);
                    setBandeAnnonce((actif) => !actif);
                  }}
                >
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
