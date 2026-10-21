import { useState } from "react";

interface Props {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
  srcSet?: string;
}

export function SmartImage({ src, alt, className = "", eager = false, sizes, srcSet }: Props) {
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState(false);

  if (!src || erreur) {
    return null;
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onLoad={() => setCharge(true)}
      onError={() => setErreur(true)}
      className={`${className} transition-opacity duration-500 ${
        charge ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export function tmdbSrcSet(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }
  const correspondance = url.match(/^(https:\/\/image\.tmdb\.org\/t\/p)\/w\d+(\/.+)$/);
  if (!correspondance) {
    return undefined;
  }
  const [, prefixe, chemin] = correspondance;
  return `${prefixe}/w342${chemin} 342w, ${prefixe}/w500${chemin} 500w, ${prefixe}/w780${chemin} 780w`;
}
