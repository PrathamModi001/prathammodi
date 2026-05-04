// Live infrastructure topology — animated SVG with flowing dashes.
// Hovering a node reveals a tooltip describing what was built with it.

const TOPO_NODES = [
  { id: "edge",   label: "EDGE",      sub: "cdn / waf",    x: 8,  y: 50, group: "ingress" },
  { id: "lb",     label: "LB",        sub: "envoy",        x: 22, y: 50, group: "ingress" },
  { id: "api",    label: "API",       sub: "go / rust",    x: 38, y: 30, group: "compute" },
  { id: "wkr",    label: "WORKER",    sub: "queue / cron", x: 38, y: 70, group: "compute" },
  { id: "pg",     label: "PG",        sub: "postgres",     x: 60, y: 22, group: "storage" },
  { id: "redis",  label: "REDIS",     sub: "cache / pub",  x: 60, y: 50, group: "storage" },
  { id: "s3",     label: "S3",        sub: "object",       x: 60, y: 78, group: "storage" },
  { id: "k8s",    label: "K8S",       sub: "orchestration",x: 80, y: 30, group: "platform" },
  { id: "obs",    label: "OBS",       sub: "otel / loki",  x: 80, y: 70, group: "platform" },
  { id: "gh",     label: "CI",        sub: "actions",      x: 92, y: 50, group: "platform" },
];

const TOPO_EDGES = [
  ["edge","lb"], ["lb","api"], ["lb","wkr"],
  ["api","pg"], ["api","redis"], ["wkr","redis"], ["wkr","s3"], ["wkr","pg"],
  ["api","k8s"], ["wkr","k8s"], ["k8s","obs"], ["obs","gh"], ["k8s","gh"],
];

const TOPO_INFO = {
  edge:  { name: "Edge / WAF",            built: "Tiered cache + bot filter shaving 38% origin RPS at 1.2M req/min", scale: "p99 < 80ms global", stack: "cloudflare / fastly" },
  lb:    { name: "Load Balancer",          built: "Envoy filter chain for mTLS + auth — rolled across 6 regions",       scale: "12k rps / region",  stack: "envoy / haproxy" },
  api:   { name: "API Gateway",            built: "Go service mesh with rate-limit + circuit-break per consumer",       scale: "4 nines",           stack: "go · rust · grpc" },
  wkr:   { name: "Async Workers",          built: "Idempotent task runner over NATS — drained 22M backlog in 14m",      scale: "2.4k jobs/s",       stack: "go · nats · cron" },
  pg:    { name: "Postgres",               built: "Logical replication + pgvector for hybrid search on 120M rows",     scale: "2.1TB · sub-ms",    stack: "pg17 · pgbouncer" },
  redis: { name: "Redis Cluster",          built: "Pub/sub fan-out and rate buckets — 99.99% over 18 months",          scale: "18M ops/s peak",    stack: "redis · sentinel" },
  s3:    { name: "Object Store",           built: "Streaming uploads with resumable parts; lifecycle to glacier",      scale: "640TB",             stack: "s3 · minio" },
  k8s:   { name: "Kubernetes",             built: "Custom operator for blue/green of stateful services",               scale: "180 nodes",         stack: "k8s · helm · argo" },
  obs:   { name: "Observability",          built: "Tracing + log pipelines wired through OpenTelemetry collectors",     scale: "12B spans/day",     stack: "otel · loki · grafana" },
  gh:    { name: "CI / CD",                built: "Build matrix + canary promotion gates with synthetic checks",       scale: "12 min p50 ship",   stack: "actions · argocd" },
};

function Topology() {
  const wrapRef = React.useRef(null);
  const [tip, setTip] = React.useState(null);
  const [hovered, setHovered] = React.useState(null);

  const px = (n) => `${n.x}%`;
  const py = (n) => `${n.y}%`;

  const nodeMap = React.useMemo(() => Object.fromEntries(TOPO_NODES.map(n => [n.id, n])), []);

  return (
    <div className="topo-wrap" ref={wrapRef}>
      <div className="topo-grid" />
      <svg className="topo-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="topoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>
        {TOPO_EDGES.map(([a, b], i) => {
          const A = nodeMap[a], B = nodeMap[b];
          const lit = hovered && (hovered === a || hovered === b);
          return (
            <g key={i}>
              <path
                className="topo-edge"
                d={`M${A.x} ${A.y} C ${(A.x+B.x)/2} ${A.y}, ${(A.x+B.x)/2} ${B.y}, ${B.x} ${B.y}`}
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="topo-flow"
                d={`M${A.x} ${A.y} C ${(A.x+B.x)/2} ${A.y}, ${(A.x+B.x)/2} ${B.y}, ${B.x} ${B.y}`}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 6"
                style={{ opacity: lit ? 1 : 0.45, animation: `flow ${4 + (i%4)*0.5}s linear infinite` }}
              />
            </g>
          );
        })}
        <style>{`
          @keyframes flow { to { stroke-dashoffset: -80; } }
        `}</style>
      </svg>

      {TOPO_NODES.map((n) => (
        <div
          key={n.id}
          className={`topo-node ${hovered === n.id ? "lit" : ""}`}
          style={{ left: px(n), top: py(n) }}
          onMouseEnter={(e) => {
            setHovered(n.id);
            const r = wrapRef.current.getBoundingClientRect();
            setTip({ id: n.id, x: e.currentTarget.offsetLeft, y: e.currentTarget.offsetTop });
          }}
          onMouseLeave={() => { setHovered(null); setTip(null); }}
        >
          <div className="topo-node-dot">{n.label}</div>
          <div className="topo-node-sub">{n.sub}</div>
        </div>
      ))}

      {tip && (
        <div className="topo-tip on" style={{ left: tip.x, top: tip.y }}>
          <h5>{TOPO_INFO[tip.id].name}</h5>
          <div>{TOPO_INFO[tip.id].built}</div>
          <div className="tip-meta">{TOPO_INFO[tip.id].scale} · {TOPO_INFO[tip.id].stack}</div>
        </div>
      )}

      <div className="topo-legend">
        <span><i></i> link</span>
        <span><i className="flow"></i> live traffic</span>
      </div>
      <div className="topo-readout">
        <div>region · <b>iad · fra · sin</b></div>
        <div>uptime · <b>99.992%</b></div>
        <div>nodes · <b>{TOPO_NODES.length}</b></div>
      </div>
    </div>
  );
}

window.Topology = Topology;
