interface Props {
  className?: string;
}

export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Logo Billetterie Cinéma"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="4" y1="2" x2="44" y2="46">
          <stop stopColor="#ff3d71" />
          <stop offset="0.55" stopColor="#ff8aa5" />
          <stop offset="1" stopColor="#ffc46b" />
        </linearGradient>
        <linearGradient id="logo-shine" x1="10" y1="4" x2="30" y2="30">
          <stop stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logo-gradient)" />
      <rect x="2.5" y="2.5" width="43" height="43" rx="13.5" fill="url(#logo-shine)" />
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="13.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
      />

      <circle cx="24" cy="24" r="10.5" fill="#0a0c13" fillOpacity="0.22" />
      <circle cx="24" cy="24" r="10.5" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <path
        d="M24 13.5l4.4 6.4M34.5 24h-8M24 34.5l-4.4-6.4M24 24l8.6-3.2M24 24l-8.6-3.2M24 24l2.4 8.8"
        stroke="#ffffff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <circle cx="24" cy="24" r="3" fill="#ffffff" />
      <path
        d="M36.5 11.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
    </svg>
  );
}
