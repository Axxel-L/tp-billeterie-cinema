import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode } from "react";

type PanelProps = ComponentPropsWithoutRef<"div"> & {
  radius?: string | number;
  tone?: "clear" | "light";
  backdrop?: string;
};

/**
 * Enveloppe structurelle : un seul enfant stable est exposé au custom element.
 * Les elements liquid glass deplacent leurs enfants dans un noeud interne ;
 * sans cet enfant unique, React tenterait de retirer des noeuds deplaces.
 */
export function GlassPanel({ radius, tone, backdrop, className, children, ...rest }: PanelProps) {
  return (
    <lg-panel radius={radius} tone={tone} backdrop={backdrop} className={className} {...rest}>
      <div className="contents">{children}</div>
    </lg-panel>
  );
}

interface ButtonProps {
  children: ReactNode;
  tone?: "clear" | "tinted" | "light";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  href?: string;
  className?: string;
  ariaLabel?: string;
}

export function GlassButton({
  children,
  tone,
  type,
  disabled,
  onClick,
  href,
  className,
  ariaLabel,
}: ButtonProps) {
  return (
    <lg-button
      tone={tone}
      type={type}
      disabled={disabled}
      onClick={onClick}
      href={href}
      className={className}
      aria-label={ariaLabel}
    >
      <span className="contents">{children}</span>
    </lg-button>
  );
}
