import { useEffect, useState } from "react";

export function useImagesReady(urls: Array<string | undefined>, timeoutMs = 3000): boolean {
  const liste = urls.filter((url): url is string => Boolean(url));
  const signature = liste.join("|");
  const [pretes, setPretes] = useState(liste.length === 0);

  useEffect(() => {
    if (!signature) {
      setPretes(true);
      return undefined;
    }

    let annule = false;
    let restants = signature.split("|").length;
    setPretes(false);

    const fin = () => {
      restants -= 1;
      if (restants <= 0 && !annule) {
        setPretes(true);
      }
    };

    const images = signature.split("|").map((src) => {
      const image = new Image();
      image.onload = fin;
      image.onerror = fin;
      image.src = src;
      return image;
    });

    const minuteur = window.setTimeout(() => {
      if (!annule) {
        setPretes(true);
      }
    }, timeoutMs);

    return () => {
      annule = true;
      window.clearTimeout(minuteur);
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [signature, timeoutMs]);

  return pretes;
}
