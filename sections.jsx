// Sections: Hero (3D), Identity Reveal, Architecture, About terminal, Projects, Timeline, Contact

const PROJECTS = [
  { n: "01", title: "Atlas", em: "Mesh", size: "size-l",
    blurb: "Multi-region service mesh with custom mTLS rotation, surfaced as a single typed RPC surface for 60+ services.",
    art: "iso", tags: ["go","envoy","grpc","postgres","kubernetes"],
    role: "Lead · Infra", year: "2025", scale: "120k rps · 4 nines" },
  { n: "02", title: "Drift", em: "OTel", size: "size-m",
    blurb: "Tracing pipeline that reduced log spend 64% while keeping span fidelity for 12B-events/day.",
    art: "spectrum", tags: ["rust","otel","loki","grafana"],
    role: "Solo", year: "2024", scale: "12B spans/day" },
  { n: "03", title: "Conduit", em: "Queue", size: "size-s",
    blurb: "Idempotent task runner over NATS — drained a 22M-task backlog in 14 minutes with zero double-execution.",
    art: "flow", tags: ["go","nats","redis","postgres"],
    role: "Architect", year: "2024", scale: "2.4k jobs/s" },
  { n: "04", title: "Beacon", em: "SDK", size: "size-s",
    blurb: "Client telemetry SDK for web + mobile with deterministic sampling and edge-buffered drop-off.",
    art: "concentric", tags: ["typescript","wasm","cloudflare"],
    role: "Lead", year: "2024", scale: "8M MAU" },
  { n: "05", title: "Forge", em: "CI", size: "size-w",
    blurb: "Build matrix and canary promotion gates with synthetic checks — cut median ship time from 41 to 12 minutes across 14 services.",
    art: "blueprint", tags: ["actions","argocd","docker","helm"],
    role: "Platform", year: "2025", scale: "12 min p50 ship" },
];

const ART_MAP = { iso: "ArtIsoMesh", flow: "ArtFlowGraph", spectrum: "ArtSpectrum", concentric: "ArtConcentric", blueprint: "ArtBlueprint" };

function ScrambleText({ text, active }) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/\\|<>{}";
  const [out, setOut] = React.useState(text.replace(/[^\s]/g, "█"));
  React.useEffect(() => {
    if (!active) return;
    let frame = 0, raf;
    function tick() {
      frame++;
      const revealed = Math.min(text.length, Math.floor((frame / 40) * text.length));
      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (/\s/.test(text[i])) { result += text[i]; continue; }
        result += i < revealed ? text[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(result);
      if (revealed < text.length) raf = requestAnimationFrame(tick);
      else setOut(text);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, text]);
  return <>{out}</>;
}

function AnimatedStat({ n, l, active, delay }) {
  const numRef = React.useRef(null);
  React.useEffect(() => {
    if (!active || !numRef.current) return;
    const gsap = window.gsap;
    if (!gsap) { numRef.current.textContent = n; return; }
    const match = n.match(/^([\d.]+)(.*)/);
    if (!match) { numRef.current.textContent = n; return; }
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const isInt = !n.includes(".");
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2.4, delay: delay || 0, ease: "power3.out",
      onUpdate() { if (numRef.current) numRef.current.textContent = (isInt ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix; },
      onComplete() { if (numRef.current) numRef.current.textContent = n; },
    });
  }, [active]);
  return (
    <div className={`stat ${active ? "on" : ""}`} style={{ transitionDelay: `${delay || 0}s` }}>
      <div className="stat-num"><em ref={numRef}>{n}</em></div>
      <div className="stat-label">{l}</div>
    </div>
  );
}

const MARQUEE_ITEMS = [
  { text: "AVAILABLE · 2026", accent: true },
  { text: "IIT Kanpur" },
  { text: "BACKEND SYSTEMS" },
  { text: "120K RPS" , accent: true },
  { text: "DISTRIBUTED INFRA" },
  { text: "4 NINES SLA", accent: true },
  { text: "OPEN TO WORK" },
  { text: "OBSERVABILITY" },
  { text: "KAFKA · REDIS · POSTGRES" },
  { text: "NODE.JS · PYTHON · GO", accent: true },
];

function MarqueeSection() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]; // duplicate for seamless loop
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {items.map((it, i) => (
          <span key={i} className="marquee-item">
            <span className="m-dot"></span>
            <span className={it.accent ? "m-accent" : ""}>{it.text}</span>
            <span style={{ width: 40, display: "inline-block" }}></span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ accent }) {
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    const onLoaded = () => setReady(true);
    window.addEventListener("__loader_done", onLoaded);
    return () => { clearTimeout(t); window.removeEventListener("__loader_done", onLoaded); };
  }, []);

  // hero parallax: center text drifts slower than scroll (depth illusion)
  React.useEffect(() => {
    if (!ready) return;
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);
    const hero = document.getElementById("home");
    if (!hero) return;
    const ctx = gsap.context(() => {
      gsap.to(".hero-center", {
        yPercent: -14, scale: 0.97, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "80% top", scrub: 1.2 },
      });
      gsap.to(".hero-eyebrow", {
        yPercent: -22, opacity: 0, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "50% top", scrub: 1 },
      });
      gsap.to(".hero-foot", {
        yPercent: 18, opacity: 0, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "50% top", scrub: 1 },
      });
    });
    return () => ctx.revert();
  }, [ready]);

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
            <span>ENTERING SYSTEM · v2.0</span>
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
              <span><b>120k</b> RPS · <b>4</b> NINES</span>
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
      <ParticleField density={0.35} accent={accent} />
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
          <div className="identity-card-tilt"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const mx = (e.clientX - r.left) / r.width - 0.5;
              const my = (e.clientY - r.top) / r.height - 0.5;
              e.currentTarget.style.setProperty("--rx", (my * -16) + "deg");
              e.currentTarget.style.setProperty("--ry", (mx * 16) + "deg");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--rx", "0deg");
              e.currentTarget.style.setProperty("--ry", "0deg");
            }}>
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
        </div>
        <div className="stat-row">
          <AnimatedStat n="120k" l="peak rps shipped"       active={on} delay={0.60} />
          <AnimatedStat n="12B"  l="spans / day pipeline"   active={on} delay={0.72} />
          <AnimatedStat n="9"    l="years in production"    active={on} delay={0.84} />
          <AnimatedStat n="4"    l="nines, sustained"       active={on} delay={0.96} />
        </div>
      </div>
    </section>
  );
}

const STACK_GROUPS = [
  { label: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "SQL"] },
  { label: "Backend", items: ["Node.js", "FastAPI", "Express.js"] },
  { label: "Frontend", items: ["React", "Next.js"] },
  { label: "Cloud · Infra", items: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Ansible"] },
  { label: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Supabase"] },
  { label: "Queues", items: ["BullMQ", "Redis Queue", "Event-Driven"] },
  { label: "Observability", items: ["OpenTelemetry", "Prometheus", "Grafana", "LGTM"] },
  { label: "AI · ML", items: ["RAG", "Vector DBs", "Multi-Agent", "NLP"] },
];

function ArchitectureSection({ accent = "#F4A93C" }) {
  const ref = React.useRef(null);
  const on = useRevealOnView(ref, 0.05);
  return (
    <section id="stack" className="arch-section" ref={ref} data-screen-label="03 Architecture">
      <ParticleField density={0.3} accent={accent} />
      <div className="section-content">
        <div className="section-label">
          <span className="num">03</span>
          <span>system architecture · live</span>
          <span className="ln"></span>
          <span style={{ color: "var(--fg-mute)" }}>// hover any node</span>
        </div>
        <div style={{ marginBottom: 56, opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(20px)", transition: "opacity 1s var(--ease-out), transform 1s var(--ease-blade)" }}>
          <h2 className="h2"><ScrambleText text="Backend, made " active={on} /><em>visible</em>.</h2>
          <p style={{ marginTop: 24, fontFamily: "var(--serif)", fontSize: 22, color: "var(--fg-dim)", maxWidth: 720, lineHeight: 1.5 }}>
            Edge to gateway to services. Streams to caches to stores. Every node below is something I've run in production.
          </p>
        </div>
        <div style={{ opacity: on ? 1 : 0, transition: "opacity 1.2s var(--ease-out) 0.3s" }}>
          <ArchitectureStage />
        </div>
        <div className="stack-grid" style={{ opacity: on ? 1 : 0, transition: "opacity 1s var(--ease-out) 0.5s" }}>
          {STACK_GROUPS.map((g) => (
            <div key={g.label} className="stack-group">
              <div className="stack-group-label">{g.label}</div>
              <div className="stack-group-items">
                {g.items.map((it) => <span key={it} className="stack-chip">{it}</span>)}
              </div>
            </div>
          ))}
        </div>
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
        <div>
          <AnimatedTerminal />
          <LiveMetrics />
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ onOpen, accent }) {
  const outerRef = React.useRef(null);
  const headerOn = useRevealOnView(outerRef, 0.05);

  function handleMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    e.currentTarget.style.setProperty("--mx", mx + "%");
    e.currentTarget.style.setProperty("--my", my + "%");
    e.currentTarget.style.setProperty("--rx", (((my / 100) - 0.5) * -18) + "deg");
    e.currentTarget.style.setProperty("--ry", (((mx / 100) - 0.5) * 18) + "deg");
  }

  function handleMouseLeave(e) {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  }

  return (
    <section id="work" className="projects-outer" ref={outerRef} data-screen-label="05 Projects">
      <div className="section-label">
        <span className="num">05</span>
        <span>selected work</span>
        <span className="ln"></span>
        <span style={{ color: "var(--fg-mute)" }}>// 2024 → 2026</span>
      </div>
      <div style={{ marginBottom: 64, opacity: headerOn ? 1 : 0, transform: headerOn ? "translateY(0)" : "translateY(20px)", transition: "opacity 1s var(--ease-out), transform 1s var(--ease-blade)" }}>
        <h2 className="h2"><ScrambleText text="Things I shipped, " active={headerOn} /><em>quietly</em>.</h2>
      </div>
      <div className="projects-grid">
        {PROJECTS.map((p, i) => {
          const Art = window[ART_MAP[p.art]];
          return (
            <article
              key={p.n}
              className={`project ${p.size}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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
          <a href="mailto:hello@modi.dev">say&nbsp;hello&nbsp;→</a>
        </h2>
        <div className="contact-meta">
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>EMAIL</div><b>hello@modi.dev</b></div>
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>SOCIAL</div>
            <a href="#">github / modi</a> · <a href="#">x / prathamodi</a> · <a href="#">linkedin</a>
          </div>
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>STATUS</div><b style={{ color: "var(--accent)" }}>● open · q3 2026</b></div>
          <div><div style={{ color: "var(--fg-mute)", marginBottom: 4 }}>SIGNAL</div><b>pgp · 0xA1F4 9C2D</b></div>
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
window.MarqueeSection = MarqueeSection;
window.AnimatedStat = AnimatedStat;
window.PROJECTS = PROJECTS;
window.ART_MAP = ART_MAP;
