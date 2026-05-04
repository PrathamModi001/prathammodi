// Architecture stage — animated microservices diagram with kafka-style streams,
// redis cache layer, and live API request/response packets traveling the wires.

const ARCH_NODES = [
  // [id, label, sub, x%, y%, layer]
  { id: "client",  label: "CLIENT",  sub: "web · mobile",  x: 6,  y: 50, layer: "edge" },
  { id: "edge",    label: "EDGE",    sub: "cdn · waf",     x: 18, y: 50, layer: "edge" },
  { id: "gw",      label: "GATEWAY", sub: "auth · rate",   x: 32, y: 50, layer: "edge" },
  { id: "svc-a",   label: "AUTH",    sub: "go",            x: 48, y: 22, layer: "service" },
  { id: "svc-b",   label: "ORDER",   sub: "go",            x: 48, y: 50, layer: "service" },
  { id: "svc-c",   label: "BILL",    sub: "rust",          x: 48, y: 78, layer: "service" },
  { id: "kafka",   label: "STREAM",  sub: "kafka · 12 part",x: 64, y: 50, layer: "stream" },
  { id: "redis",   label: "CACHE",   sub: "redis cluster", x: 78, y: 22, layer: "store" },
  { id: "pg",      label: "PG",      sub: "primary · 2.1tb",x: 78, y: 50, layer: "store" },
  { id: "wkr",     label: "WORKER",  sub: "consumer pool", x: 78, y: 78, layer: "service" },
  { id: "s3",      label: "S3",      sub: "object · 640tb",x: 92, y: 78, layer: "store" },
  { id: "obs",     label: "OBS",     sub: "otel · 12b/d",  x: 92, y: 22, layer: "platform" },
];

// directed flows — each becomes a flowing dashed line + traveling packet
const ARCH_FLOWS = [
  { from: "client", to: "edge",   kind: "req" },
  { from: "edge",   to: "gw",     kind: "req" },
  { from: "gw",     to: "svc-a",  kind: "req" },
  { from: "gw",     to: "svc-b",  kind: "req" },
  { from: "gw",     to: "svc-c",  kind: "req" },
  { from: "svc-b",  to: "redis",  kind: "cache" },
  { from: "svc-b",  to: "pg",     kind: "db" },
  { from: "svc-b",  to: "kafka",  kind: "stream" },
  { from: "svc-c",  to: "kafka",  kind: "stream" },
  { from: "svc-a",  to: "redis",  kind: "cache" },
  { from: "kafka",  to: "wkr",    kind: "stream" },
  { from: "wkr",    to: "pg",     kind: "db" },
  { from: "wkr",    to: "s3",     kind: "db" },
  { from: "svc-b",  to: "obs",    kind: "trace" },
  { from: "svc-c",  to: "obs",    kind: "trace" },
  { from: "wkr",    to: "obs",    kind: "trace" },
];

const FLOW_COLORS = {
  req:    "var(--accent)",
  cache:  "#9ec5ff",
  db:     "#8af1c6",
  stream: "#ffb86b",
  trace:  "rgba(245,245,244,0.5)",
};

function ArchitectureStage() {
  const wrapRef = React.useRef(null);
  const [hover, setHover] = React.useState(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let raf;
    let t0 = performance.now();
    function loop() {
      setTick((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nodeMap = React.useMemo(() => Object.fromEntries(ARCH_NODES.map(n => [n.id, n])), []);

  function pathFor(a, b) {
    const A = nodeMap[a], B = nodeMap[b];
    const dx = B.x - A.x;
    // bezier with horizontal-leaning control points
    const c1x = A.x + dx * 0.5;
    const c2x = A.x + dx * 0.5;
    return `M ${A.x} ${A.y} C ${c1x} ${A.y} ${c2x} ${B.y} ${B.x} ${B.y}`;
  }

  function pointAlong(a, b, t) {
    const A = nodeMap[a], B = nodeMap[b];
    const c1x = A.x + (B.x - A.x) * 0.5, c1y = A.y;
    const c2x = A.x + (B.x - A.x) * 0.5, c2y = B.y;
    // cubic bezier
    const u = 1 - t;
    const x = u*u*u*A.x + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*B.x;
    const y = u*u*u*A.y + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*B.y;
    return { x, y };
  }

  return (
    <div className="arch-wrap" ref={wrapRef}>
      <div className="arch-grid"></div>

      <svg className="arch-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="archGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* layer dividers */}
        {[27, 45, 70, 86].map((x, i) => (
          <line key={i} x1={x} y1="6" x2={x} y2="94" stroke="rgba(255,255,255,0.04)" strokeWidth="0.1" strokeDasharray="0.4 0.6" vectorEffect="non-scaling-stroke" />
        ))}

        {/* base flow lines */}
        {ARCH_FLOWS.map((f, i) => {
          const lit = hover && (hover === f.from || hover === f.to);
          return (
            <g key={i}>
              <path
                d={pathFor(f.from, f.to)}
                stroke={lit ? FLOW_COLORS[f.kind] : "rgba(255,255,255,0.10)"}
                strokeWidth={lit ? 0.25 : 0.15}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={pathFor(f.from, f.to)}
                stroke={FLOW_COLORS[f.kind]}
                strokeWidth="0.18"
                fill="none"
                strokeDasharray="1.2 4"
                strokeDashoffset={-tick * (f.kind === "stream" ? 8 : 5)}
                opacity={lit ? 1 : 0.5}
                vectorEffect="non-scaling-stroke"
                style={{ filter: "drop-shadow(0 0 1px " + FLOW_COLORS[f.kind] + ")" }}
              />
            </g>
          );
        })}

        {/* traveling packets */}
        {ARCH_FLOWS.map((f, i) => {
          const period = f.kind === "stream" ? 2.4 : f.kind === "trace" ? 5 : 3.4;
          const offset = (i * 0.27) % 1;
          const t = ((tick / period) + offset) % 1;
          const p = pointAlong(f.from, f.to, t);
          return (
            <circle
              key={"pk" + i}
              cx={p.x} cy={p.y}
              r={f.kind === "stream" ? 0.55 : 0.4}
              fill={FLOW_COLORS[f.kind]}
              opacity={0.95}
              style={{ filter: "drop-shadow(0 0 1.2px " + FLOW_COLORS[f.kind] + ")" }}
            />
          );
        })}
      </svg>

      {/* node chips */}
      {ARCH_NODES.map((n) => (
        <div
          key={n.id}
          className={`arch-node lyr-${n.layer} ${hover === n.id ? "lit" : ""}`}
          style={{ left: n.x + "%", top: n.y + "%" }}
          onMouseEnter={() => setHover(n.id)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="arch-node-chip">
            <span className="arch-node-label">{n.label}</span>
            <span className="arch-node-sub">{n.sub}</span>
          </div>
        </div>
      ))}

      {/* layer labels */}
      <div className="arch-layer-labels">
        <span style={{ left: "12%" }}>edge</span>
        <span style={{ left: "40%" }}>services</span>
        <span style={{ left: "64%" }}>stream</span>
        <span style={{ left: "85%" }}>storage · obs</span>
      </div>

      {/* live metrics readout */}
      <div className="arch-metrics">
        <div><b>{Math.floor(120 + Math.sin(tick) * 8)}k</b><span>req/s</span></div>
        <div><b>{(11 + Math.sin(tick * 1.4) * 1.2).toFixed(1)}ms</b><span>p50</span></div>
        <div><b>{(64 + Math.sin(tick * 0.7) * 4).toFixed(0)}ms</b><span>p99</span></div>
        <div><b className="ok">99.992%</b><span>uptime</span></div>
      </div>
    </div>
  );
}

window.ArchitectureStage = ArchitectureStage;
