export function GridScan() {
  return (
    <div className="grid-scan" aria-hidden="true">
      <div className="grid-scan__glow" />
      <div className="grid-scan__room">
        <div className="grid-scan__floor" />
        <div className="grid-scan__wall grid-scan__wall--left" />
        <div className="grid-scan__wall grid-scan__wall--right" />
      </div>
      <div className="grid-scan__beam" />
      <div className="grid-scan__vignette" />
    </div>
  );
}
