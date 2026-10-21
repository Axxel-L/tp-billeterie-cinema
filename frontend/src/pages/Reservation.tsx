import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircleIcon, TicketIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { api, ApiException } from "../api/client";
import type { Reservation } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { GlassButton, GlassPanel } from "../components/Glass";
import { Skeleton } from "../components/Skeleton";
import { formatHeure, formatJour, formatPrix, plageParDefaut } from "../lib/format";

export default function ReservationPage() {
  const [parametres] = useSearchParams();
  const { session, openLogin } = useAuth();
  const clientRequetes = useQueryClient();
  const seanceInitiale = Number(parametres.get("seance")) || null;

  const [seanceId, setSeanceId] = useState<number | null>(seanceInitiale);
  const [email, setEmail] = useState("");
  const [places, setPlaces] = useState(2);
  const [codeAnnulation, setCodeAnnulation] = useState("");
  const [message, setMessage] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [ticket, setTicket] = useState<Reservation | null>(null);

  const plage = useMemo(() => plageParDefaut(60), []);
  const seances = useQuery({
    queryKey: ["seances", "reservation", plage.du, plage.au],
    queryFn: () => api.seances(plage),
  });

  useEffect(() => {
    if (seanceId === null && seances.data && seances.data.length > 0) {
      setSeanceId(seances.data[0]!.id);
    }
  }, [seanceId, seances.data]);

  const selection = seances.data?.find((seance) => seance.id === seanceId) ?? null;
  const montant = selection ? selection.prixUnitaire * places : 0;

  const creation = useMutation({
    mutationFn: api.reserver,
    onSuccess: (reservation) => {
      setTicket(reservation);
      setMessage({ ton: "ok", texte: "Réservation confirmée. Conservez votre code." });
      setPlaces(1);
      void seances.refetch();
      void clientRequetes.invalidateQueries({ queryKey: ["mes-reservations"] });
    },
    onError: (erreur) => {
      setMessage({
        ton: "erreur",
        texte: erreur instanceof ApiException ? erreur.message : "Réservation impossible.",
      });
    },
  });

  const annulation = useMutation({
    mutationFn: api.annuler,
    onSuccess: () => {
      setMessage({
        ton: "ok",
        texte: `Réservation ${codeAnnulation} annulée, les places sont libérées.`,
      });
      setCodeAnnulation("");
      setTicket(null);
      void seances.refetch();
      void clientRequetes.invalidateQueries({ queryKey: ["mes-reservations"] });
    },
    onError: (erreur) => {
      setMessage({
        ton: "erreur",
        texte: erreur instanceof ApiException ? erreur.message : "Annulation impossible.",
      });
    },
  });

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    setMessage(null);
    if (!session) {
      openLogin();
      return;
    }
    if (!seanceId) {
      setMessage({ ton: "erreur", texte: "Choisissez une séance." });
      return;
    }
    creation.mutate({ seanceId, emailClient: email.trim(), nombrePlaces: places });
  }

  function annuler(evenement: FormEvent) {
    evenement.preventDefault();
    setMessage(null);
    if (!session) {
      openLogin();
      return;
    }
    if (!codeAnnulation.trim()) {
      setMessage({ ton: "erreur", texte: "Saisissez le code de la réservation." });
      return;
    }
    annulation.mutate(codeAnnulation.trim().toUpperCase());
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Billetterie</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Réserver
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Le code et le montant sont calculés par le serveur. Une réservation ne peut jamais
          dépasser la capacité de la salle, même en cas de demandes simultanées.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <GlassPanel radius="26" className="p-6 sm:p-7">
          {!session ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-gold">
              <span>Connectez-vous pour confirmer une réservation.</span>
              <GlassButton tone="light" onClick={openLogin}>
                Connexion
              </GlassButton>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={soumettre}>
            <label className="block">
              <span className="field-label">Séance</span>
              {seances.isPending ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <select
                  className="select"
                  value={seanceId ?? ""}
                  onChange={(evenement) => setSeanceId(Number(evenement.target.value))}
                  required
                >
                  <option value="" disabled>
                    Choisir une séance
                  </option>
                  {seances.data?.map((seance) => (
                    <option key={seance.id} value={seance.id}>
                      {formatJour(seance.debut)} · {formatHeure(seance.debut)} · {seance.filmTitre} (
                      {seance.placesRestantes} places)
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="block">
              <span className="field-label">Adresse e-mail</span>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(evenement) => setEmail(evenement.target.value)}
                placeholder="vous@example.test"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="field-label">Nombre de places (1 à 8)</span>
              <input
                type="number"
                className="input"
                min={1}
                max={8}
                value={places}
                onChange={(evenement) => setPlaces(Number(evenement.target.value))}
                required
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/[0.08] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
                Montant total
              </span>
              <span className="font-display text-2xl font-extrabold text-gold">
                {formatPrix(montant)}
              </span>
            </div>

            {message ? (
              <p
                className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                  message.ton === "ok"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-brand/30 bg-brand/10 text-brand-2"
                }`}
                role={message.ton === "erreur" ? "alert" : "status"}
              >
                {message.ton === "ok" ? (
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {message.texte}
              </p>
            ) : null}

            <GlassButton
              type="submit"
              tone="tinted"
              disabled={creation.isPending}
              className="w-full [&>button]:w-full"
            >
              <TicketIcon className="h-4 w-4" />
              {creation.isPending ? "Réservation…" : "Confirmer la réservation"}
            </GlassButton>
          </form>
        </GlassPanel>

        <div className="space-y-6">
          {ticket ? (
            <GlassPanel radius="26" className="p-6 sm:p-7">
              <p className="eyebrow">Votre billet</p>
              <p className="mt-3 break-all font-mono text-2xl font-bold tracking-wider text-gold">
                {ticket.code}
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-mist">Statut</dt>
                  <dd className="mt-1 text-sm font-bold">{ticket.statut}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-mist">Places</dt>
                  <dd className="mt-1 text-sm font-bold">{ticket.nombrePlaces}</dd>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-mist">Montant</dt>
                  <dd className="mt-1 text-sm font-bold text-gold">
                    {formatPrix(ticket.montantTotal)}
                  </dd>
                </div>
              </dl>
              <div className="mt-5">
                <GlassButton
                  onClick={() => {
                    setCodeAnnulation(ticket.code);
                    setMessage(null);
                  }}
                >
                  Utiliser ce code pour annuler
                </GlassButton>
              </div>
            </GlassPanel>
          ) : (
            <GlassPanel radius="26" className="p-6 sm:p-7">
              <h2 className="font-display text-xl font-extrabold tracking-tight">Comment ça marche</h2>
              <ol className="mt-4 space-y-3 text-sm text-mist">
                <li className="flex gap-3">
                  <span className="font-mono text-brand-2">01</span>
                  Choisissez une séance et le nombre de places.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-brand-2">02</span>
                  Le serveur verrouille la séance, vérifie la capacité et calcule le montant.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-brand-2">03</span>
                  Conservez le code : il sert à annuler et à libérer les places.
                </li>
              </ol>
            </GlassPanel>
          )}

          <GlassPanel radius="26" className="p-6 sm:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Annuler une réservation
            </h2>
            <form className="mt-4 space-y-4" onSubmit={annuler}>
              <label className="block">
                <span className="field-label">Code de réservation</span>
                <input
                  className="input font-mono uppercase tracking-wider"
                  value={codeAnnulation}
                  onChange={(evenement) => setCodeAnnulation(evenement.target.value)}
                  placeholder="RES-XXXXXXXXXXXX"
                />
              </label>
              <GlassButton
                type="submit"
                disabled={annulation.isPending}
                className="w-full [&>button]:w-full"
              >
                {annulation.isPending ? "Annulation…" : "Annuler la réservation"}
              </GlassButton>
            </form>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
