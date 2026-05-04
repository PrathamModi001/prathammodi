// Original SVG project artworks — no stock logos, no AI imagery.
// Each is a generative-feeling abstraction tied to the project's domain.

function ArtIsoMesh({ accent = "#F4A93C" }) {
  // isometric mesh of nodes — feels like a distributed system map
  const cells = 12, rows = 8;
  const points = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cells; c++) {
      const x = (c / (cells - 1)) * 100;
      const y = 8 + (r / (rows - 1)) * 84;
      points.push({ x, y, r, c });
    }
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="mr1" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="60%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="#0E0E11" />
      <rect width="100" height="100" fill="url(#mr1)" />
      {points.map((p, i) => (
        <g key={i}>
          {p.c < cells - 1 && <line x1={p.x} y1={p.y} x2={p.x + 100/(cells-1)} y2={p.y + Math.sin((p.r+p.c)/3)*0.7} stroke="rgba(255,255,255,0.06)" strokeWidth="0.15" />}
          {p.r < rows - 1 && <line x1={p.x} y1={p.y} x2={p.x + Math.sin((p.r+p.c)/4)*0.7} y2={p.y + 84/(rows-1)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.15" />}
        </g>
      ))}
      {points.filter((_, i) => i % 7 === 0).map((p, i) => (
        <circle key={"d"+i} cx={p.x} cy={p.y} r="0.45" fill={accent} opacity={0.7}>
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${3 + (i%5)*0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <circle cx="68" cy="42" r="14" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="0.2" />
      <circle cx="68" cy="42" r="22" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="0.2" />
    </svg>
  );
}

function ArtFlowGraph({ accent = "#F4A93C" }) {
  // flowing pipeline — bezier highways
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="100" height="60" fill="#0C0C0F" />
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 8 + i * 4.4;
        return (
          <path key={i}
            d={`M -2 ${y} C 25 ${y - 6 + (i%3)*3}, 60 ${y + 4 - (i%2)*5}, 102 ${y - 2 + (i%4)}`}
            stroke={i % 4 === 0 ? accent : "rgba(255,255,255,0.10)"}
            strokeWidth={i % 4 === 0 ? 0.35 : 0.2}
            fill="none"
            opacity={i % 4 === 0 ? 0.85 : 1}
          >
            {i % 4 === 0 && <animate attributeName="stroke-dashoffset" from="0" to="-40" dur={`${5 + i*0.4}s`} repeatCount="indefinite" />}
          </path>
        );
      })}
      <g style={{ filter: "blur(0.4px)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <circle key={i} cx={20 + i * 22} cy={28 + (i%2)*4} r="0.7" fill={accent}>
            <animate attributeName="cx" from="-5" to="105" dur={`${6 + i*1.1}s`} repeatCount="indefinite" begin={`${i*0.6}s`} />
          </circle>
        ))}
      </g>
    </svg>
  );
}

function ArtSpectrum({ accent = "#F4A93C" }) {
  // observability spectrum — stacked sparkline
  const bars = 64;
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="100" height="60" fill="#0B0B0E" />
      {Array.from({ length: bars }).map((_, i) => {
        const x = (i / bars) * 100;
        const h = 6 + Math.abs(Math.sin(i * 0.6) * 18) + Math.abs(Math.cos(i * 0.21) * 12);
        return (
          <rect key={i} x={x} y={60 - h} width={100/bars - 0.3} height={h}
            fill={i % 9 === 0 ? accent : "rgba(255,255,255,0.10)"}
            opacity={i % 9 === 0 ? 0.85 : 0.7}>
            <animate attributeName="height" values={`${h};${h*0.6};${h*1.1};${h}`} dur={`${4 + (i%5)}s`} repeatCount="indefinite" />
            <animate attributeName="y" values={`${60-h};${60-h*0.6};${60-h*1.1};${60-h}`} dur={`${4 + (i%5)}s`} repeatCount="indefinite" />
          </rect>
        );
      })}
      <line x1="0" y1="48" x2="100" y2="48" stroke="rgba(255,255,255,0.08)" strokeDasharray="0.5 1" strokeWidth="0.15" />
      <text x="3" y="6" fill={accent} fontFamily="ui-monospace,monospace" fontSize="2.2" letterSpacing="0.3">P99 · LATENCY</text>
    </svg>
  );
}

function ArtConcentric({ accent = "#F4A93C" }) {
  // concentric rings — feels like a service mesh radar
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="100" height="100" fill="#0E0E11" />
      <g transform="translate(50 55)">
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} r={6 + i * 5.5} fill="none" stroke={i === 4 ? accent : "rgba(255,255,255,0.08)"} strokeWidth={i === 4 ? "0.3" : "0.15"}>
            {i === 4 && <animate attributeName="r" values="26;30;26" dur="6s" repeatCount="indefinite" />}
          </circle>
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={"l"+i} x1={Math.cos(a)*8} y1={Math.sin(a)*8} x2={Math.cos(a)*55} y2={Math.sin(a)*55} stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />;
        })}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2 + 0.4;
          const r = 18 + i * 4;
          return <circle key={"p"+i} cx={Math.cos(a)*r} cy={Math.sin(a)*r} r="0.7" fill={accent}>
            <animate attributeName="opacity" values="1;0.2;1" dur={`${2 + i*0.3}s`} repeatCount="indefinite" />
          </circle>;
        })}
      </g>
    </svg>
  );
}

function ArtBlueprint({ accent = "#F4A93C" }) {
  // hand-drawn blueprint feel — schematic boxes + annotations
  return (
    <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="120" height="70" fill="#0C0C0F" />
      <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.15" fill="none">
        <rect x="8" y="10" width="22" height="14" />
        <rect x="40" y="6" width="28" height="22" />
        <rect x="78" y="14" width="34" height="14" />
        <rect x="14" y="36" width="40" height="20" />
        <rect x="64" y="40" width="46" height="16" />
        <line x1="30" y1="17" x2="40" y2="17" />
        <line x1="68" y1="17" x2="78" y2="17" />
        <line x1="34" y1="46" x2="64" y2="48" />
        <line x1="54" y1="46" x2="78" y2="28" />
      </g>
      <g stroke={accent} strokeWidth="0.3" fill="none">
        <rect x="40" y="6" width="28" height="22" />
        <circle cx="54" cy="17" r="2" />
      </g>
      <g fill={accent} fontFamily="ui-monospace,monospace" fontSize="1.6" letterSpacing="0.2">
        <text x="9" y="8">SVC.A</text>
        <text x="41" y="4.5">CORE / GATEWAY</text>
        <text x="79" y="12">SVC.B</text>
        <text x="15" y="34">QUEUE</text>
        <text x="65" y="38">STORE</text>
      </g>
      <g fill="rgba(255,255,255,0.4)" fontFamily="ui-monospace,monospace" fontSize="1.3">
        <text x="14" y="64">↳ p50 12ms · p99 64ms · drift &lt; 0.4%</text>
      </g>
    </svg>
  );
}

window.ArtIsoMesh = ArtIsoMesh;
window.ArtFlowGraph = ArtFlowGraph;
window.ArtSpectrum = ArtSpectrum;
window.ArtConcentric = ArtConcentric;
window.ArtBlueprint = ArtBlueprint;
