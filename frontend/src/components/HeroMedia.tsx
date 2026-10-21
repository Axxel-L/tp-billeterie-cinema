import { useEffect, useState } from "react";
import type { FilmMedia } from "../api/types";

interface Props {
  media?: FilmMedia;
  titre: string;
}

export function HeroMedia({ media, titre }: Props) {
  const [video, setVideo] = useState(false);
  const cle = media?.bandeAnnonceCle;

  useEffect(() => {
    if (!cle) {
      return undefined;
    }
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connexion = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    const economie = connexion?.saveData === true || connexion?.effectiveType === "2g";
    if (mouvementReduit || economie || window.innerWidth < 768) {
      return undefined;
    }
    const minuteur = window.setTimeout(() => setVideo(true), 1400);
    return () => window.clearTimeout(minuteur);
  }, [cle]);

  const bandeau = media?.bandeauUrl;

  return (
    <div className="hero-media">
      {bandeau ? (
        <img
          id="hero-media"
          src={bandeau}
          alt=""
          className="kenburns object-cover opacity-80"
          fetchPriority="high"
          decoding="async"
        />
      ) : (
        <div id="hero-media" className="hero-ambient absolute inset-0" />
      )}

      {video && cle ? (
        <iframe
          title={`Bande-annonce de ${titre}`}
          src={`https://www.youtube-nocookie.com/embed/${cle}?autoplay=1&mute=1&controls=0&loop=1&playlist=${cle}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3`}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
