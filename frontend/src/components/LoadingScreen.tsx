import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function LoadingScreen({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__grid" aria-hidden="true" />
      <div className="loading-screen__inner">
        <Logo className="h-14 w-14" />
        <p className="loading-screen__label">{label}</p>
        <span className="loading-screen__bar" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}

export function PageGate({
  loading,
  label,
  children,
}: {
  loading: boolean;
  label: string;
  children: ReactNode;
}) {
  if (loading) {
    return <LoadingScreen label={label} />;
  }
  return <>{children}</>;
}
