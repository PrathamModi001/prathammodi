// Sections: Hero (3D), Identity Reveal, Architecture, About terminal, Projects, Timeline, Contact

const PROJECTS = [
  { n: "01", title: "DeployMind", em: "GitOps", size: "size-l",
    blurb: "GitOps platform that eliminates manual deploys — GitHub to EC2/Kubernetes with zero-downtime strategies and auto-rollback.",
    art: "blueprint", tags: ["node.js","kubernetes","redis","docker","aws"],
    role: "Personal · Lead", year: "2025", scale: "canary · zero downtime",
    link: "https://github.com/PrathamModi001/DeployMind",
    problem: "Manual deployments to EC2 and Kubernetes are error-prone, environment-inconsistent, and impossible to audit. One bad push breaks production — with no rollback in sight.",
    architecture: [
      "HMAC-verified GitHub webhooks feed a Redis BRPOPLPUSH FIFO queue — no push is lost or processed twice",
      "Sequential Security → Build → Deploy agent pipeline with distributed SET NX PX + Lua locks prevents race conditions across concurrent environments",
      "Canary shifts traffic 10% → 50% → 100% with error-rate auto-rollback; Blue-Green swaps via health-check gate with zero idle downtime",
      "Multi-stage Dockerfiles (non-root hardening, distroless) + Trivy security gating + HPA/PDB/topology spread for production-grade k8s",
    ],
    impact: ["zero-downtime deploys", "200+ unit/integration tests", "EKS + GKE support"],
  },
  { n: "02", title: "Apex", em: "Invoice", size: "size-m",
    blurb: "Event-driven invoice processor ingesting from Gmail, WhatsApp, and Drive — exactly-once, fault-tolerant, fully audited.",
    art: "flow", tags: ["kafka","redis","fastapi","node.js","postgres"],
    role: "Hackathon Winner", year: "2024", scale: "exactly-once · fault tolerant",
    link: "https://github.com/PrathamModi001/apex",
    problem: "Finance teams drown in invoices scattered across email, WhatsApp, and cloud storage — processed manually, rife with duplicates, and with zero audit trail.",
    architecture: [
      "Multi-source ingestion (Gmail API, WhatsApp Business API, Google Drive) feeds Kafka/Redis Streams with consumer groups and backpressure control",
      "Exactly-once guarantee via content hashing + transactional DB writes + concurrency-safe duplicate detection under parallel uploads",
      "Dead-letter queues, schema validation, and retry/backoff policies prevent silent data loss at every stage",
      "RBAC human-review workflow with structured audit logging and metrics-driven observability across throughput, latency, and error rate",
    ],
    impact: ["hackathon winner", "exactly-once delivery", "3-source ingestion"],
  },
  { n: "03", title: "ContextBridge", em: "AI Dev", size: "size-w",
    blurb: "Live codebase state server that stops AI assistants from generating code against stale repo context during parallel development.",
    art: "iso", tags: ["typescript","tree-sitter","websocket","ast","rest"],
    role: "Personal · Solo", year: "2025", scale: "real-time · semantic diff",
    link: "https://github.com/PrathamModi001/ContextBridge",
    problem: "AI coding assistants hallucinate against stale repo snapshots. In parallel development, two assistants editing the same interface simultaneously produce silent contract breaks that surface only at merge time.",
    architecture: [
      "WebSocket server synchronizes every working-tree change across the team in real time — no polling, no stale state, no lag",
      "Tree-sitter AST parser builds a live cross-file dependency graph tracking function signatures, types, and exports",
      "Contract-level change detection flags when a signature or type export changes — not just file-level modifications",
      "REST + WebSocket APIs expose the current live state of any interface so AI assistants query before generating code",
    ],
    impact: ["real-time AST diffing", "semantic conflict prevention", "AI-assistant native API"],
  },
];

const ART_MAP = { iso: "ArtIsoMesh", flow: "ArtFlowGraph", spectrum: "ArtSpectrum", concentric: "ArtConcentric", blueprint: "ArtBlueprint" };

function HeroSection({ accent }) {
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    const onLoaded = () => setReady(true);
    window.addEventListener("__loader_done", onLoaded);
    return () => { clearTimeout(t); window.removeEventListener("__loader_done", onLoaded); };
  }, []);

  const lines = [
    [{ t: "Pratham", italic: false }],
    [{ t: "Modi", italic: true }, { t: ".", italic: false }],
  ];
  let charIdx = 0;
  const renderLine = (line) => (
    <span className="line">
      {line.map((w, wi) => (
        <span className="word" key={wi}>
          {[...w.t].map((ch, ci) => {
            const i = charIdx++;
            return (
              <span key={ci} className={`ch ${w.italic ? "italic" : ""}`}
                style={{ animationDelay: `${0.3 + i * 0.045}s` }}>{ch}</span>
            );
          })}
          {wi < line.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );

  return (
    <section id="home" className={`hero ${ready ? "hero-revealed" : ""}`} data-screen-label="01 Entry">
      <div className="hero-sticky">
        <ThreeScene accent={accent} onProgressChange={setProgress} />
        <div className="hero-overlay">
          <div className="hero-eyebrow">
            <span className="dot"></span>
            <span>ENTERING SYSTEM</span>
            <span style={{ color: "var(--fg-mute)" }}>·</span>
            <span>RUNTIME / READY</span>
          </div>
          <div className="hero-center">
            <h1 className="hero-title" aria-label="Pratham Modi.">
              {renderLine(lines[0])}
              {renderLine(lines[1])}
            </h1>
            <div className="hero-strap">
              <span className="bracket">[</span>
              <span>backend-focused full-stack</span>
              <span className="bracket">]</span>
              <em>building systems people don't have to think about.</em>
            </div>
          </div>
          <div className="hero-foot">
            <div className="col">
              <span><b>26.19 N · 80.23 E</b></span>
              <span>IIT KANPUR · IST</span>
              <span style={{ color: "var(--accent)" }}>● AVAILABLE Q3 · 2026</span>
            </div>
            <div className="col col-r">
              <span>scroll · transition</span>
              <span><b>2M+</b> USERS · <b>99.9%</b> UPTIME</span>
              <span>last deploy · {new Date().toISOString().slice(0,10)}</span>
            </div>
          </div>
        </div>
        <div className="hero-progress">
          <span>{String(Math.round(progress*100)).padStart(2,"0")}%</span>
          <span className="bar" style={{ "--p": (progress*100) + "%" }}></span>
          <span>flythrough</span>
        </div>
      </div>
    </section>
  );
}

function useRevealOnView(ref, threshold = 0.2) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

function IdentityReveal({ accent }) {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.2);
  return (
    <section id="identity" className="identity" ref={ref} data-screen-label="02 Identity">
      <div className="identity-inner">
        <div className="section-label">
          <span className="num">02</span>
          <span>identity</span>
          <span className="ln"></span>
          <span style={{ color: "var(--fg-mute)" }}>// who · why · what</span>
        </div>
        <div className={`identity-stage ${on ? "on" : ""}`}>
          <div className={`identity-text ${on ? "on" : ""}`}>
            <span className="blk"><span className="blk-inner" style={{ transitionDelay: "0.05s" }}>I'm a backend engineer</span></span>
            <span className="blk"><span className="blk-inner" style={{ transitionDelay: "0.18s" }}>who learned <em>frontend</em> hard</span></span>
            <span className="blk"><span className="blk-inner" style={{ transitionDelay: "0.31s" }}>so the systems I love</span></span>
            <span className="blk"><span className="blk-inner" style={{ transitionDelay: "0.44s" }}>get <em>interfaces</em></span></span>
            <span className="blk"><span className="blk-inner" style={{ transitionDelay: "0.57s" }}>that don't apologize.</span></span>
          </div>
          <div className="identity-card">
            <div className="identity-card-art"><ArtConcentric accent={accent} /></div>
            <div className="identity-card-meta">
              <div><h6>BASED</h6><b>IIT KANPUR · IN</b></div>
              <div><h6>UPTIME</h6><b>2 yrs · curious</b></div>
              <div><h6>FOCUS</h6><b>distributed systems</b></div>
              <div><h6>STATUS</h6><b style={{ color: "var(--accent)" }}>● open Q3 26</b></div>
            </div>
          </div>
        </div>
        <div className="stat-row">
          {[
            { n: "2M+", l: "users served" },
            { n: "500K+", l: "daily notifications" },
            { n: "2", l: "yrs in production" },
            { n: "99.9%", l: "uptime sustained" },
          ].map((s, i) => (
            <div key={i} className={`stat ${on ? "on" : ""}`} style={{ transitionDelay: `${0.6 + i * 0.12}s` }}>
              <div className="stat-num"><em>{s.n}</em></div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.05);
  return (
    <section id="stack" className="arch-section" ref={ref} data-screen-label="03 Architecture">
      <div className="section-label">
        <span className="num">03</span>
        <span>system architecture · live</span>
        <span className="ln"></span>
        <span style={{ color: "var(--fg-mute)" }}>// hover any node</span>
      </div>
      <div style={{ marginBottom: 56, opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transition: "opacity 1s var(--ease-out), transform 1s var(--ease-blade)" }}>
        <h2 className="h2">Backend, made <em>visible</em>.</h2>
        <p style={{ marginTop: 24, fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg-dim)", maxWidth: 720, lineHeight: 1.5 }}>
          Edge to gateway to services. Streams to caches to stores. The packets are real — watch them flow.
        </p>
      </div>
      <div style={{ opacity: on ? 1 : 0, transition: "opacity 1.2s var(--ease-out) 0.3s" }}>
        <ArchitectureStage />
      </div>
      <div style={{ display: "flex", gap: 32, marginTop: 32, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--fg-mute)" }}>
        <span><i style={{ display: "inline-block", width: 14, height: 1.5, background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }}></i>request</span>
        <span><i style={{ display: "inline-block", width: 14, height: 1.5, background: "#9ec5ff", marginRight: 8, verticalAlign: "middle" }}></i>cache hit</span>
        <span><i style={{ display: "inline-block", width: 14, height: 1.5, background: "#8af1c6", marginRight: 8, verticalAlign: "middle" }}></i>db write</span>
        <span><i style={{ display: "inline-block", width: 14, height: 1.5, background: "#ffb86b", marginRight: 8, verticalAlign: "middle" }}></i>kafka stream</span>
        <span><i style={{ display: "inline-block", width: 14, height: 1.5, background: "rgba(245,245,244,0.5)", marginRight: 8, verticalAlign: "middle" }}></i>otel trace</span>
      </div>
    </section>
  );
}

function AboutTerminalSection() {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.15);
  const copy = "I work where the diagrams turn into pagers. Backends I trust, infra that scales calmly, and the ten thousand details between a request and a response. This site is the side of me that learned frontend hard, on purpose.";
  const words = copy.split(" ");
  return (
    <section id="about" className="section-pad" ref={ref} data-screen-label="04 About">
      <div className="section-label">
        <span className="num">04</span>
        <span>about</span>
        <span className="ln"></span>
        <span style={{ color: "var(--fg-mute)" }}>// the human behind the cluster</span>
      </div>
      <div className="about-grid">
        <div className="about-copy">
          <p>{words.map((w, i) => (
            <span key={i} className={`reveal-word ${on ? "on" : ""}`} style={{ transitionDelay: `${i * 25}ms` }}>
              {w === "frontend" || w === "backends" ? <em>{w}</em> : w}{" "}
            </span>
          ))}</p>
        </div>
        <AnimatedTerminal />
      </div>
    </section>
  );
}

function ProjectsSection({ onOpen, accent }) {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.05);
  return (
    <section id="work" className="section-pad" ref={ref} data-screen-label="05 Projects">
      <div className="section-label">
        <span className="num">05</span>
        <span>selected work</span>
        <span className="ln"></span>
        <span style={{ color: "var(--fg-mute)" }}>// 2024 → 2026</span>
      </div>
      <div style={{ marginBottom: 80, opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transition: "opacity 1s var(--ease-out), transform 1s var(--ease-blade)" }}>
        <h2 className="h2">Things I shipped, <em>quietly</em>.</h2>
      </div>
      <div className="projects">
        {PROJECTS.map((p, i) => {
          const Art = window[ART_MAP[p.art]];
          return (
            <article
              key={p.n}
              className={`project ${p.size}`}
              style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(40px)",
                       transition: `opacity 1s var(--ease-out) ${0.15 + i * 0.08}s, transform 1.1s var(--ease-blade) ${0.15 + i * 0.08}s, border-color 0.5s var(--ease-out)` }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const mx = ((e.clientX - r.left) / r.width) * 100;
                const my = ((e.clientY - r.top) / r.height) * 100;
                e.currentTarget.style.setProperty("--mx", mx + "%");
                e.currentTarget.style.setProperty("--my", my + "%");
              }}
              onClick={() => onOpen(p)}>
              <div className="project-art"><Art accent={accent} /></div>
              <div className="project-vignette"></div>
              <div className="project-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <span className="project-num">{p.n} / 0{PROJECTS.length}</span>
                  <span className="project-num">{p.year}</span>
                </div>
                <div>
                  <h3 className="project-title">{p.title} <em>{p.em}</em></h3>
                  <p style={{ marginTop: 18, fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, color: "var(--fg-dim)", maxWidth: 520, letterSpacing: "0.01em" }}>{p.blurb}</p>
                </div>
                <div className="project-meta">
                  <div className="project-tags">
                    {p.tags.map((t) => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                  <div className="project-arrow">
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11 L11 3 M5 3 L11 3 L11 9" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({ accent }) {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.1);
  return (
    <section id="contact" className="contact" ref={ref} data-screen-label="07 Contact">
      <ParticleField density={0.6} accent={accent} />
      <div className="contact-inner">
        <div className="section-label">
          <span className="num">07</span>
          <span>contact</span>
          <span className="ln"></span>
          <span style={{ color: "var(--fg-mute)" }}>// the wire is open</span>
        </div>
        <h2 className="contact-line" style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(30px)", transition: "opacity 1.2s var(--ease-out), transform 1.4s var(--ease-blade)" }}>
          Got a system that <em>misbehaves?</em><br/>
          <a href="mailto:prathammodi001@gmail.com">say&nbsp;hello&nbsp;→</a>
        </h2>
        <div className="contact-meta">
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>EMAIL</div><b>prathammodi001@gmail.com</b></div>
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>SOCIAL</div>
            <a href="https://github.com/PrathamModi001" target="_blank" rel="noopener noreferrer">github.com/PrathamModi001</a> · <a href="https://x.com/PrathamModii" target="_blank" rel="noopener noreferrer">x / PrathamModii</a> · <a href="https://www.linkedin.com/in/prathammodii001/" target="_blank" rel="noopener noreferrer">linkedin</a>
          </div>
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>STATUS</div><b style={{ color: "var(--accent)" }}>● open · q3 2026</b></div>
        </div>
      </div>
    </section>
  );
}

function VerticalNav() {
  const items = [
    { id: "home",      num: "01", label: "entry" },
    { id: "identity",  num: "02", label: "identity" },
    { id: "stack",     num: "03", label: "architecture" },
    { id: "about",     num: "04", label: "about" },
    { id: "work",      num: "05", label: "projects" },
    { id: "timeline",  num: "06", label: "experience" },
    { id: "contact",   num: "07", label: "contact" },
  ];
  const [active, setActive] = React.useState("home");
  React.useEffect(() => {
    function update() {
      const mid = window.innerHeight / 2;
      let best = items[0].id, bestDist = Infinity;
      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = (r.top + r.bottom) / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) { bestDist = d; best = id; }
      });
      setActive(best);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return (
    <>
      <div className="vnav-rail"></div>
      <nav className="vnav">
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`} className={`vnav-item ${active === it.id ? "active" : ""}`}>
            <span className="vnav-label">{it.label}</span>
            <span className="vnav-tick"></span>
            <span className="vnav-num">{it.num}</span>
          </a>
        ))}
      </nav>
    </>
  );
}

window.HeroSection = HeroSection;
window.IdentityReveal = IdentityReveal;
window.ArchitectureSection = ArchitectureSection;
window.AboutTerminalSection = AboutTerminalSection;
window.ProjectsSection = ProjectsSection;
window.ContactSection = ContactSection;
window.VerticalNav = VerticalNav;
window.PROJECTS = PROJECTS;
window.ART_MAP = ART_MAP;
