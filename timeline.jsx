// Experience timeline — vertical, scroll-revealed, with depth/stagger.
const TIMELINE = [
  {
    year: "2026 · Q1",
    role: "Principal Engineer",
    org: "Atlas Systems",
    note: "Owning the runtime that runs the runtime — multi-region mesh, blue/green for stateful services, custom k8s operators.",
    metric: "120k rps · 4 nines",
  },
  {
    year: "2024",
    role: "Staff Engineer · Platform",
    org: "Drift",
    note: "Built the tracing pipeline that cut log spend 64% while keeping span fidelity for 12B events/day.",
    metric: "12B spans / day",
  },
  {
    year: "2022",
    role: "Senior Backend",
    org: "Conduit",
    note: "Wrote the idempotent task runner that drained a 22M-task backlog in 14 minutes. Postmortem still on the wall.",
    metric: "2.4k jobs/s",
  },
  {
    year: "2020",
    role: "Backend Engineer",
    org: "Beacon",
    note: "Telemetry SDK with deterministic sampling and edge-buffered drop-off — shipped to 8M MAU across web and mobile.",
    metric: "8M MAU",
  },
  {
    year: "2018",
    role: "Engineer",
    org: "Forge",
    note: "Built CI promotion gates with synthetic checks. Median ship time dropped from 41 to 12 minutes.",
    metric: "12min p50 ship",
  },
];

function TimelineSection({ accent = "#F4A93C" }) {
  const ref = React.useRef(null);
  return (
    <section id="timeline" className="section-pad timeline-section" ref={ref}>
      <ParticleField density={0.3} accent={accent} />
      <div className="section-content">
        <div className="section-label">
          <span className="num">06</span>
          <span>experience</span>
          <span className="ln"></span>
          <span style={{ color: "var(--fg-mute)" }}>// 2018 → present</span>
        </div>
        <div style={{ marginBottom: 80 }}>
          <h2 className="h2">Eight years, <em>one rule:</em><br/>build it like it's <em>your</em> pager.</h2>
        </div>
        <ol className="timeline">
          <div className="timeline-rail"></div>
          {TIMELINE.map((t, i) => (
            <TimelineItem key={i} item={t} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TimelineItem({ item, index }) {
  const ref = React.useRef(null);
  return (
    <li ref={ref} className="timeline-item">
      <div className="timeline-dot"><span></span></div>
      <div className="timeline-card">
        <div className="timeline-year">{item.year}</div>
        <h3 className="timeline-role">{item.role}</h3>
        <div className="timeline-org">{item.org}</div>
        <p className="timeline-note">{item.note}</p>
        <div className="timeline-metric">{item.metric}</div>
      </div>
    </li>
  );
}

window.TimelineSection = TimelineSection;
