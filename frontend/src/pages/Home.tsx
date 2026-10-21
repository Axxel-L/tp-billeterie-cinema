import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRightIcon, CalendarDaysIcon, TicketIcon } from "@heroicons/react/24/outline";
import { api } from "../api/client";
import type { Film } from "../api/types";
import { AnimatedList } from "../components/AnimatedList";
import { CountUp } from "../components/CountUp";
import { FilmCard } from "../components/FilmCard";
import { FilmDialog } from "../components/FilmDialog";
import { GlassPanel } from "../components/Glass";
import { GlassLink } from "../components/GlassLink";
import { HeroMedia } from "../components/HeroMedia";
import { CardSkeleton, Skeleton } from "../components/Skeleton";
import { formatHeure, formatJour, formatPrix, initiales, plageParDefaut } from "../lib/format";

export default function Home() {
  const plage = useMemo(() => plageParDefaut(7), []);
  const [selection, setSelection] = useState<Film | null>(null);

  const films = useQuery({ queryKey: ["films", "accueil"], queryFn: () => api.films() });
  const seances = useQuery({
    queryKey: ["seances", "accueil", plage.du, plage.au],
    queryFn: () => api.seances(plage),
  });

  const prochaine = seances.data?.[0];
  const vedette = films.data?.find((film) => film.id === prochaine?.filmId) ?? films.data?.[0];

  const media = useQuery({
    queryKey: ["media", vedette?.id],
    queryFn: () => api.filmMedia(vedette!.id),
    enabled: Boolean(vedette),
    staleTime: 60 * 60 * 1000,
  });

  const places = seances.data?.reduce((total, seance) => total + seance.placesRestantes, 0) ?? 0;

  return (
    <div>
      <section className="relative isolate min-h-[100svh] overflow-hidden" data-lg-backdrop="#hero-media">
        <HeroMedia media={media.data} titre={vedette?.titre ?? "Cinéma"} />
        <div className="hero-fade absolute inset-0" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pb-12 pt-40 sm:px-6 lg:px-8">
          {vedette ? (
            <div className="pointer-events-none absolute right-6 top-28 hidden w-[300px] xl:block">
              <div className="absolute inset-0 translate-x-7 translate-y-7 rotate-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand/50 to-ink opacity-50" />
              <div className="relative aspect-[2/3] rotate-3 overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_50px_140px_-30px_rgba(255,61,113,0.55)]">
                {media.data?.afficheUrl ? (
                  <img
                    id="hero-poster"
                    src={media.data.afficheUrl}
                    alt={`Affiche de ${vedette.titre}`}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="hero-ambient flex h-full w-full items-center justify-center">
                    <span className="font-display text-7xl font-black tracking-tighter text-white/85">
                      {initiales(vedette.titre)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                {media.data?.afficheUrl ? (
                  <GlassPanel radius="18" backdrop="#hero-poster" className="absolute inset-x-3 bottom-3 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-2">
                      {vedette.genre}
                    </p>
                    <p className="mt-1 font-display text-sm font-bold leading-tight">
                      {vedette.titre}
                    </p>
                  </GlassPanel>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="max-w-3xl">
            <p className="eyebrow">Billetterie · Programmation</p>
            <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7rem)] font-black leading-[0.88] tracking-[-0.05em]">
              Le grand écran,
              <br />
              <span className="bg-gradient-to-r from-brand via-brand-2 to-gold bg-clip-text text-transparent">
                sans la file d'attente.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Films, séances et places en temps réel. La capacité est verrouillée côté serveur,
              le montant est calculé avant confirmation, et votre code de réservation suffit pour annuler.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GlassLink to="/seances" tone="tinted">
                <TicketIcon className="h-4 w-4" />
                Choisir une séance
              </GlassLink>
              <GlassLink to="/films">
                Explorer le catalogue
                <ArrowRightIcon className="h-4 w-4" />
              </GlassLink>
            </div>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <GlassPanel radius="26" backdrop="#hero-media" className="max-w-2xl p-5 sm:p-6">
              <p className="eyebrow">Prochaine séance</p>
              {seances.isPending ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : prochaine ? (
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {prochaine.filmTitre}
                    </h2>
                    <p className="mt-1 text-sm text-white/65">
                      {formatJour(prochaine.debut)} · {formatHeure(prochaine.debut)} ·{" "}
                      {prochaine.salleNom}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold text-gold">
                        {formatPrix(prochaine.prixUnitaire)}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                        {prochaine.placesRestantes} places
                      </p>
                    </div>
                    <GlassLink to={`/reservation?seance=${prochaine.id}`} tone="tinted">
                      Réserver
                    </GlassLink>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/65">
                  Aucune séance dans les sept prochains jours.
                </p>
              )}
            </GlassPanel>

            <div className="hidden flex-wrap gap-6 pb-2 text-xs text-white/55 lg:flex">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Capacité vérifiée sous verrou
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4" />
                {seances.data?.length ?? 0} séances à venir
              </span>
            </div>
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

        {films.isPending ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <AnimatedList className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {films.data?.slice(0, 6).map((film, index) => (
              <div
                key={film.id}
                data-animate
                style={{ "--delay": `${index * 70}ms` } as CSSProperties}
              >
                <FilmCard film={film} index={index} onOuvrir={setSelection} />
              </div>
            ))}
          </AnimatedList>
        )}
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
            {seances.isPending
              ? [0, 1, 2].map((cle) => <Skeleton key={cle} className="my-3 h-16" />)
              : seances.data?.slice(0, 5).map((seance) => (
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

      {selection ? <FilmDialog film={selection} onClose={() => setSelection(null)} /> : null}
    </div>
  );
}
