import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { GlassLink } from "./components/GlassLink";
import { GridScan } from "./components/GridScan";
import { LoadingScreen } from "./components/LoadingScreen";
import { Logo } from "./components/Logo";
import { Navigation } from "./components/Navigation";

const Home = lazy(() => import("./pages/Home"));
const Films = lazy(() => import("./pages/Films"));
const Seances = lazy(() => import("./pages/Seances"));
const ReservationPage = lazy(() => import("./pages/Reservation"));
const Admin = lazy(() => import("./pages/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Introuvable() {
  return (
    <div className="mx-auto grid min-h-[70svh] w-full max-w-3xl place-items-center px-4 pt-32 text-center">
      <div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.04em] sm:text-6xl">
          Page introuvable
        </h1>
        <p className="mt-4 text-mist">Cette adresse ne correspond à aucune page.</p>
        <div className="mt-8 flex justify-center">
          <GlassLink to="/" tone="tinted">
            Retour à l'accueil
          </GlassLink>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
      >
        Aller au contenu
      </a>

      <GridScan />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navigation />
        <main id="contenu" className="flex-1">
          <Suspense fallback={<LoadingScreen label="Chargement de la page…" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/films" element={<Films />} />
              <Route path="/seances" element={<Seances />} />
              <Route path="/reservation" element={<ReservationPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Introuvable />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="border-t border-white/10 bg-ink/80">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-9" />
              <div>
                <p className="font-display text-sm font-extrabold tracking-tight">
                  Billetterie de cinéma
                </p>
                <p className="text-xs text-mist">BUT Info 3 · R5.08 · Spring Boot + React</p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-5 text-xs text-mist" aria-label="Liens techniques">
              <a className="link-quiet" href="/swagger-ui.html">
                API
              </a>
              <a className="link-quiet" href="/actuator/health">
                Santé
              </a>
              <a className="link-quiet" href="/v3/api-docs">
                OpenAPI
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
