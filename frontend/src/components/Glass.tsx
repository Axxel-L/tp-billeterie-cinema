import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

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
