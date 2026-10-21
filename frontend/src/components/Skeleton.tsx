interface Props {
  className?: string;
}

export function Skeleton({ className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-xl bg-white/[0.07] ${className}`}
    />
  );
}
