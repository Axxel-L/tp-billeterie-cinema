import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type CSSProperties } from "react";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { api } from "../api/client";
import type { Seance } from "../api/types";
import { AnimatedList } from "../components/AnimatedList";
import { GlassPanel } from "../components/Glass";
import { GlassLink } from "../components/GlassLink";
import { Skeleton } from "../components/Skeleton";
import { formatHeure, formatJour, formatPrix, plageParDefaut } from "../lib/format";

function grouperParJour(seances: Seance[]): [string, Seance[]][] {
  const groupes = new Map<string, Seance[]>();
  for (const seance of seances) {
    const cle = seance.debut.slice(0, 10);
    const existant = groupes.get(cle);
    if (existant) {
      existant.push(seance);
    } else {
      groupes.set(cle, [seance]);
    }
  }
  return [...groupes.entries()];
}

export default function Seances() {
  const [plage, setPlage] = useState(() => plageParDefaut(14));

  const requete = useQuery({
    queryKey: ["seances", plage.du, plage.au],
    queryFn: () => api.seances(plage),
  });

  const groupes = useMemo(() => grouperParJour(requete.data ?? []), [requete.data]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Agenda</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Séances
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist">
          Les places restantes sont calculées à partir des réservations confirmées, jamais d'un
          compteur local.
        </p>
      </header>

      <GlassPanel radius="22" className="mt-8 block">
        <div className="flex flex-wrap items-end gap-4 p-5">
          <label className="block min-w-40 flex-1">
            <span className="field-label">Du</span>
            <input
              type="date"
              className="input"
              value={plage.du}
              onChange={(evenement) => setPlage((actuel) => ({ ...actuel, du: evenement.target.value }))}
            />
          </label>
          <label className="block min-w-40 flex-1">
            <span className="field-label">Au</span>
            <input
              type="date"
              className="input"
              value={plage.au}
              onChange={(evenement) => setPlage((actuel) => ({ ...actuel, au: evenement.target.value }))}
            />
          </label>
          <p className="flex items-center gap-2 pb-3 text-xs text-mist">
            <CalendarDaysIcon className="h-4 w-4" />
            {requete.data?.length ?? 0} séance(s) sur la période
          </p>
        </div>
      </GlassPanel>

      {requete.isPending ? (
        <div className="mt-10 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : requete.isError ? (
        <p className="mt-10 rounded-2xl border border-brand/30 bg-brand/10 p-5 text-sm text-brand-2" role="alert">
          Impossible de charger les séances pour le moment.
        </p>
      ) : groupes.length === 0 ? (
        <div className="surface mt-10 p-10 text-center">
          <p className="font-display text-xl font-bold">Aucune séance sur cette période.</p>
          <p className="mt-2 text-sm text-mist">Élargissez les dates pour voir la programmation.</p>
        </div>
      ) : (
        <AnimatedList className="mt-10 space-y-8">
          {groupes.map(([jour, seances], index) => (
            <section key={jour} data-animate style={{ "--delay": `${index * 60}ms` } as CSSProperties}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-2">
                  {formatJour(`${jour}T12:00:00`)}
                </h2>
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-mist">{seances.length} séance(s)</span>
              </div>

              <div className="surface divide-y divide-white/10 overflow-hidden">
                {seances.map((seance) => (
                  <div
                    key={seance.id}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 transition hover:bg-white/[0.025] sm:p-5"
                  >
                    <span className="w-20 font-display text-3xl font-extrabold tracking-tight text-brand-2">
                      {formatHeure(seance.debut)}
                    </span>

                    <div className="min-w-52 flex-1">
                      <h3 className="font-display text-lg font-bold tracking-tight">
                        {seance.filmTitre}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-mist">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4" />
                          {seance.salleNom}
                        </span>
                        <span>{formatPrix(seance.prixUnitaire)}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-xl font-extrabold">{seance.placesRestantes}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-mist">places</p>
                    </div>

                    {seance.placesRestantes > 0 ? (
                      <GlassLink to={`/reservation?seance=${seance.id}`} tone="tinted">
                        Réserver
                      </GlassLink>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-mist">
                        Complet
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </AnimatedList>
      )}
    </div>
  );
}
