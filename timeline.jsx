// Experience timeline — vertical, scroll-revealed, with depth/stagger.
const TIMELINE = [
  {
    metricVal: "2M+",
    metricLabel: "users served",
    year: "Jul 2025 · Present",
    role: "Software Development Engineer",
    org: "C3iHub, IIT Kanpur",
    note: "Built the backend India's national cyber-skills platform runs on — 10K+ live connections, one nine after the decimal. Designed a two-tier immutable S3/Glacier backup that makes ransomware a budget problem for someone else. Wired 15 services with OpenTelemetry end-to-end: when something breaks, engineers know in seconds, not hours.",
  },
  {
    metricVal: "500+",
    metricLabel: "live sessions",
    year: "Nov 2024 · Jun 2025",
    role: "Software Development Engineer",
    org: "Playpower Labs · Remote",
    note: "Cut page load nearly in half and built a semantic search engine that actually understands what students mean — not just keywords. The AI tutoring platform holds 500 live sessions simultaneously; the teacher never sees the lag.",
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
          <span style={{ color: "var(--fg-mute)" }}>// 2024 → present</span>
        </div>
        <div style={{ marginBottom: 80 }}>
          <h2 className="h2">Two roles, <em>one rule:</em><br/>build it like it's <em>your</em> pager.</h2>
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
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} className={`timeline-item ${on ? "on" : ""}`} style={{ transitionDelay: `${index * 0.1}s` }}>
      <div className="tl-left">
        <div className="tl-metric-val">{item.metricVal}</div>
        <div className="tl-metric-lbl">{item.metricLabel}</div>
      </div>
      <div className="tl-right">
        <div className="tl-year">{item.year}</div>
        <div className="tl-org">{item.org}</div>
        <div className="tl-role">{item.role}</div>
        <p className="tl-note">{item.note}</p>
      </div>
    </li>
  );
}

window.TimelineSection = TimelineSection;
