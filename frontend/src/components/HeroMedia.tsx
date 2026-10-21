import { useEffect, useState } from "react";
import { urlVideo } from "../lib/video";

interface Props {
  image?: string;
  site?: string;
  cle?: string;
  titre: string;
}

export function HeroMedia({ image, site, cle, titre }: Props) {
  const [video, setVideo] = useState(false);
  const [videoPrete, setVideoPrete] = useState(false);

  useEffect(() => {
    if (!cle || (site ?? "").toLowerCase().includes("youtube")) {
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

  const source = video ? urlVideo(site, cle, { autoplay: true, muted: true, background: true }) : undefined;

  return (
    <div className="hero-media">
      {image ? (
        <img
          id="hero-media"
          src={image}
          alt={`Visuel de ${titre}`}
          className={`kenburns ${videoPrete ? "opacity-40" : "opacity-100"}`}
          fetchPriority="high"
          decoding="async"
        />
      ) : (
        <div id="hero-media" className="hero-ambient absolute inset-0" />
      )}

      {source ? (
        <iframe
          title={`Bande-annonce de ${titre}`}
          src={source}
          allow="autoplay; fullscreen; picture-in-picture"
          onLoad={() => setVideoPrete(true)}
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
