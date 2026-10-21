import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";

type PanelProps = ComponentPropsWithoutRef<"div"> & {
  radius?: string | number;
  tone?: "clear" | "light";
};

export function GlassPanel({
  radius = 22,
  tone = "clear",
  className,
  style,
  children,
  ...rest
}: PanelProps) {
  const variables = {
    ...style,
    borderRadius: typeof radius === "number" ? `${radius}px` : radius,
  } as CSSProperties;

  return (
    <div
      className={`glass-panel${tone === "light" ? " glass-panel--light" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={variables}
      {...rest}
    >
      {children}
    </div>
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
  tone = "clear",
  type = "button",
  disabled,
  onClick,
  href,
  className,
  ariaLabel,
}: ButtonProps) {
  const classes = `glass-button glass-button--${tone}${className ? ` ${className}` : ""}`;

  if (href) {
    return (
      <Link
        to={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick as unknown as MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
