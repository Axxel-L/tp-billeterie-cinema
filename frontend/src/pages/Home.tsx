import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type CSSProperties } from "react";
import { TicketIcon } from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { api } from "../api/client";
import type { Film } from "../api/types";
import { AnimatedList } from "../components/AnimatedList";
import { CountUp } from "../components/CountUp";
import { FilmCard } from "../components/FilmCard";
import { FilmDialog } from "../components/FilmDialog";
import { GlassButton } from "../components/Glass";
import { GlassLink } from "../components/GlassLink";
import { HeroMedia } from "../components/HeroMedia";
import { PageGate } from "../components/LoadingScreen";
import { formatHeure, formatJour, formatPrix, plageParDefaut } from "../lib/format";
import { useImagesReady } from "../lib/useImagesReady";

export default function Home() {
  const plage = useMemo(() => plageParDefaut(7), []);
  const [selection, setSelection] = useState<Film | null>(null);
  const [autoTrailer, setAutoTrailer] = useState(false);

  const films = useQuery({ queryKey: ["films", "accueil"], queryFn: () => api.films() });
  const seances = useQuery({
    queryKey: ["seances", "accueil", plage.du, plage.au],
    queryFn: () => api.seances(plage),
  });

  const prochaine = seances.data?.[0];
  const vedette = films.data?.find((film) => film.id === prochaine?.filmId) ?? films.data?.[0];
  const heroImage = vedette?.bandeauUrl ?? vedette?.afficheUrl;
  const imagesPretes = useImagesReady([
    heroImage,
    ...(films.data?.slice(0, 6).map((film) => film.afficheUrl) ?? []),
  ]);
  const chargement = films.isPending || seances.isPending || !imagesPretes;

  const places = seances.data?.reduce((total, seance) => total + seance.placesRestantes, 0) ?? 0;

  return (
    <PageGate loading={chargement} label="Chargement de la programmation…">
    <div>
      <section className="relative isolate min-h-[92svh] overflow-hidden">
        <HeroMedia
          image={heroImage}
          site={vedette?.bandeAnnonceSite}
          cle={vedette?.bandeAnnonceCle}
          titre={vedette?.titre ?? "Cinéma"}
        />
        <div className="hero-fade absolute inset-0" />

        <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col justify-end px-4 pb-14 pt-40 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">À l'affiche · Prochaine séance</p>
            <h1 className="mt-4 font-display text-[clamp(3.2rem,8vw,6.5rem)] font-black leading-[0.9] tracking-[-0.05em]">
              {vedette?.titre ?? "Billetterie Cinéma"}
            </h1>

            {vedette ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/75">
                <span>{vedette.dateSortie.slice(0, 4)}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>
                  {Math.floor(vedette.dureeMinutes / 60)}h
                  {String(vedette.dureeMinutes % 60).padStart(2, "0")}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>{vedette.genre}</span>
                {vedette.note ? (
                  <span className="text-gold">★ {vedette.note.toFixed(1)}</span>
                ) : null}
                <span className="rounded border border-white/25 px-1.5 py-0.5 text-[10px] font-bold tracking-widest">
                  HD
                </span>
              </div>
            ) : null}

            <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {vedette?.synopsis ??
                "Films, séances et places en temps réel. La capacité est verrouillée côté serveur et votre code suffit pour annuler."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <GlassLink
                to={prochaine ? `/reservation?seance=${prochaine.id}` : "/seances"}
                tone="tinted"
              >
                <TicketIcon className="h-4 w-4" />
                Réserver
              </GlassLink>
              {vedette?.bandeAnnonceCle ? (
                <GlassButton
                  onClick={() => {
                    setSelection(vedette);
                    setAutoTrailer(true);
                  }}
                >
                  <PlayIcon className="h-4 w-4" />
                  Bande-annonce
                </GlassButton>
              ) : null}
              {vedette ? (
                <GlassButton
                  onClick={() => {
                    setSelection(vedette);
                    setAutoTrailer(false);
                  }}
                >
                  Plus d'infos
                </GlassButton>
              ) : null}
            </div>

            {prochaine ? (
              <div className="mt-8 inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[22px] border border-white/20 bg-ink/55 px-4 py-3 text-xs text-white/75">
                <span className="font-semibold text-white">Prochaine séance</span>
                <span>
                  {formatJour(prochaine.debut)} · {formatHeure(prochaine.debut)}
                </span>
                <span>{prochaine.salleNom}</span>
                <span className="text-gold">{formatPrix(prochaine.prixUnitaire)}</span>
                <span>{prochaine.placesRestantes} places</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Cette semaine</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              À l'affiche
            </h2>
          </div>
          <GlassLink to="/films">Tout le catalogue</GlassLink>
        </div>

        <AnimatedList className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {films.data?.slice(0, 6).map((film, index) => (
            <div
              key={film.id}
              data-animate
              style={{ "--delay": `${index * 70}ms` } as CSSProperties}
            >
              <FilmCard
                film={film}
                index={index}
                onOuvrir={(filmSelectionne) => {
                  setSelection(filmSelectionne);
                  setAutoTrailer(false);
                }}
              />
            </div>
          ))}
        </AnimatedList>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="surface overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Prochaines séances
              </h2>
            </div>
            <GlassLink to="/seances">Voir tout l'agenda</GlassLink>
          </div>

          <div className="mt-6 divide-y divide-white/10">
            {seances.data?.slice(0, 5).map((seance) => (
                  <div
                    key={seance.id}
                    className="flex flex-wrap items-center gap-4 py-4 transition hover:bg-white/[0.02]"
                  >
                    <span className="w-16 font-display text-2xl font-extrabold tracking-tight text-brand-2">
                      {formatHeure(seance.debut)}
                    </span>
                    <div className="min-w-40 flex-1">
                      <p className="font-semibold">{seance.filmTitre}</p>
                      <p className="text-xs text-mist">
                        {formatJour(seance.debut)} · {seance.salleNom}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gold">
                      {formatPrix(seance.prixUnitaire)}
                    </span>
                    <span className="text-xs text-mist">{seance.placesRestantes} places</span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Films au catalogue", valeur: films.data?.length ?? 0 },
            { label: "Séances à venir", valeur: seances.data?.length ?? 0 },
            { label: "Places disponibles", valeur: places },
          ].map((stat) => (
            <div key={stat.label} className="surface p-6">
              <p className="font-display text-4xl font-black tracking-tight text-white">
                <CountUp value={stat.valeur} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-mist">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {selection ? (
        <FilmDialog
          film={selection}
          lancerBandeAnnonce={autoTrailer}
          onClose={() => {
            setSelection(null);
            setAutoTrailer(false);
          }}
        />
      ) : null}
    </div>
    </PageGate>
  );
}
