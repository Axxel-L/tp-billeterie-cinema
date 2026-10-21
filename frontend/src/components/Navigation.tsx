import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ShieldCheckIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../auth/AuthContext";
import { GlassButton, GlassPanel } from "./Glass";
import { Logo } from "./Logo";

const LIENS = [
  { to: "/", label: "Accueil" },
  { to: "/films", label: "Films" },
  { to: "/seances", label: "Séances" },
  { to: "/reservation", label: "Réserver" },
];

export function Navigation() {
  const { session, logout, openLogin, hasRole } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-ink via-ink/80 to-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3" aria-label="Billetterie, accueil">
            <Logo className="h-11 w-11 drop-shadow-[0_10px_24px_rgba(255,61,113,0.35)] transition group-hover:scale-105" />
            <span className="leading-none">
              <span className="block font-display text-lg font-extrabold tracking-tight">
                Billetterie
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.28em] text-mist">
                Cinéma
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex"
            aria-label="Navigation principale"
          >
            {LIENS.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white/10 text-white" : "text-mist hover:text-white"
                  }`
                }
              >
                {lien.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                {hasRole("ADMIN", "PROGRAMMATEUR") ? (
                  <Link
                    to="/admin"
                    className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-mist transition hover:border-white/25 hover:text-white sm:flex"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    Pilotage
                  </Link>
                ) : null}
                <span className="hidden text-right text-xs leading-tight text-mist lg:block">
                  <span className="block font-semibold text-white">{session.username}</span>
                  {session.roles.join(" · ")}
                </span>
                <GlassButton ariaLabel="Se déconnecter" onClick={logout}>
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </GlassButton>
              </>
            ) : (
              <GlassButton tone="tinted" onClick={openLogin}>
                <UserCircleIcon className="h-4 w-4" />
                Connexion
              </GlassButton>
            )}

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-white/25 md:hidden"
              onClick={() => setMenuOuvert((ouvert) => !ouvert)}
              aria-expanded={menuOuvert}
              aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOuvert ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOuvert ? (
        <div
          className="fixed inset-0 z-30 bg-ink/80 md:hidden"
          onClick={() => setMenuOuvert(false)}
          role="presentation"
        >
          <div
            className="mx-auto mt-24 max-w-sm px-4"
            onClick={(evenement) => evenement.stopPropagation()}
          >
            <GlassPanel radius="28" className="p-4">
              <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
                {LIENS.map((lien) => (
                  <NavLink
                    key={lien.to}
                    to={lien.to}
                    end={lien.to === "/"}
                    onClick={() => setMenuOuvert(false)}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-3 text-base font-semibold transition ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-mist hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {lien.label}
                  </NavLink>
                ))}
                {hasRole("ADMIN", "PROGRAMMATEUR") ? (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOuvert(false)}
                    className="rounded-2xl px-4 py-3 text-base font-semibold text-mist"
                  >
                    Pilotage
                  </Link>
                ) : null}
              </nav>
            </GlassPanel>
          </div>
        </div>
      ) : null}
    </>
  );
}
