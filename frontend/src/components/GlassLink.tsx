import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "./Glass";

interface Props {
  to: string;
  children: ReactNode;
  tone?: "clear" | "tinted" | "light";
  className?: string;
  ariaLabel?: string;
}

export function GlassLink({ to, children, tone, className, ariaLabel }: Props) {
  const navigate = useNavigate();

  function suivre(evenement: MouseEvent<HTMLElement>) {
    if (
      evenement.defaultPrevented ||
      evenement.button !== 0 ||
      evenement.metaKey ||
      evenement.ctrlKey ||
      evenement.shiftKey ||
      evenement.altKey
    ) {
      return;
    }
    evenement.preventDefault();
    navigate(to);
  }

  return (
    <GlassButton href={to} tone={tone} className={className} aria-label={ariaLabel} onClick={suivre}>
      {children}
    </GlassButton>
  );
}
