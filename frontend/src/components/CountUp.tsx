import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  suffix?: string;
}

export function CountUp({ value, suffix = "" }: Props) {
  const [affiche, setAffiche] = useState(value);
  const precedent = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAffiche(value);
      return;
    }
    const depart = precedent.current;
    const debut = performance.now();
    const duree = 700;
    let frame = 0;

    const animer = (maintenant: number) => {
      const avancement = Math.min(1, (maintenant - debut) / duree);
      const adouci = 1 - Math.pow(1 - avancement, 3);
      setAffiche(Math.round(depart + (value - depart) * adouci));
      if (avancement < 1) {
        frame = requestAnimationFrame(animer);
      }
    };

    frame = requestAnimationFrame(animer);
    precedent.current = value;
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {affiche}
      {suffix}
    </span>
  );
}
