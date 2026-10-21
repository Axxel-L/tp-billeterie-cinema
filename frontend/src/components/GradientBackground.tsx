import GradientASCII from "./GradientASCII";

export function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-70">
        <GradientASCII
          colors={["#ff3d71", "#ff8aa5", "#7dd3fc", "#ffc46b"]}
          shape="horizon"
          characters=" .:-=+*#%@"
          cellSize={18}
          density={0.42}
          glyphOpacity={0.5}
          glow={0.4}
          softness={0.75}
          flow={0.7}
          speed={0.3}
          gradientOpacity={0.85}
          grain={0.06}
          variation={2.4}
          mouseInteraction
          scrambleRadius={0.12}
          clickEffect="wave"
          intro
        />
      </div>
      <div className="absolute inset-0 bg-ink/20" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_20%,transparent_0%,rgba(5,6,10,0.45)_70%,#05060a_100%)]" />
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-ink/85 via-ink/35 to-transparent" />
    </div>
  );
}
