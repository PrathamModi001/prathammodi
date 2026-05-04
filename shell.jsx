// Loader, blade transitions, custom cursor, project detail.

const LOAD_STAGES = [
  { p: 0,   label: "boot · kernel" },
  { p: 25,  label: "shaders · compiled" },
  { p: 55,  label: "particles · seeded" },
  { p: 78,  label: "topology · linked" },
  { p: 95,  label: "ready" },
];
const LOAD_STORY = [
  "warming the wire…",
  "compiling reality…",
  "wiring node fabric…",
  "calibrating fog and light…",
  "press scroll to enter the system.",
];

function Loader({ onDone }) {
  const [pct, setPct] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 2400;
    function tick(t) {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 2.4);
      setPct(Math.floor(eased * 100));
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setExiting(true);
          // chromatic aberration flash on blade reveal
          document.body.style.filter = "url(#chroma-ab)";
          setTimeout(() => { document.body.style.filter = ""; }, 420);
          setTimeout(() => {
            onDone();
            window.dispatchEvent(new Event("__loader_done"));
          }, 1100);
        }, 360);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const storyIdx = Math.min(LOAD_STORY.length - 1, Math.floor(pct / 22));
  const blades = 6;

  return (
    <>
      <div className="loader" style={{ opacity: exiting ? 0 : 1, transition: "opacity 0.2s" }}>
        <div className="loader-inner">
          <div className="loader-row">
            <span>MODI · v2.0 · ENTERING SYSTEM</span>
            <span>{pct < 100 ? "stand by" : "ready"}</span>
          </div>
          <div className="loader-pct">
            {String(pct).padStart(3, "0")}<span className="pct-mark">%</span>
          </div>
          <div className="loader-bar" style={{ "--p": pct + "%" }}></div>
          <div className="loader-stages">
            {LOAD_STAGES.map((s) => (
              <span key={s.p} className={pct >= s.p ? "on" : ""}>{s.label}</span>
            ))}
          </div>
          <div className="loader-story">{LOAD_STORY[storyIdx]}</div>
        </div>
      </div>
      {exiting && (
        <div className="blade-stage">
          {Array.from({ length: blades }).map((_, i) => (
            <div key={i} className="blade exit"
              style={{ top: `${(i / blades) * 100}%`, animationDelay: `${i * 60}ms` }}/>
          ))}
        </div>
      )}
    </>
  );
}

function Cursor() {
  const dotRef = React.useRef(null);
  const ringRef = React.useRef(null);
  React.useEffect(() => {
    const dot = dotRef.current, ring = ringRef.current;
    if (!dot || !ring) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    function move(e) { x = e.clientX; y = e.clientY; }
    function down() { ring.classList.add("click"); }
    function up() { ring.classList.remove("click"); }
    function over(e) {
      const t = e.target.closest("a, button, .project, .arch-node, .vnav-item");
      if (t) ring.classList.add("hover");
    }
    function out(e) {
      const t = e.target.closest("a, button, .project, .arch-node, .vnav-item");
      if (t) ring.classList.remove("hover");
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    let raf;
    function tick() {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);
  return (<><div className="cursor-dot" ref={dotRef}></div><div className="cursor-ring" ref={ringRef}></div></>);
}

function ProjectDetail({ project, onClose, accent }) {
  const [enter, setEnter] = React.useState(false);
  const [bladesIn, setBladesIn] = React.useState(true);
  const [bladesOut, setBladesOut] = React.useState(false);
  React.useEffect(() => {
    if (project) {
      setBladesIn(true); setEnter(false);
      const t1 = setTimeout(() => setEnter(true), 700);
      const t2 = setTimeout(() => setBladesIn(false), 1100);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [project]);
  function handleClose() {
    setBladesOut(true);
    setTimeout(() => { setEnter(false); onClose(); setBladesOut(false); }, 1000);
  }
  if (!project) return null;
  const Art = window[ART_MAP[project.art]];
  const blades = 6;
  return (
    <>
      <div className={`detail ${enter ? "on" : ""}`}>
        <div className="detail-art">
          <Art accent={accent} />
          <button className="detail-close" onClick={handleClose}>esc</button>
          <h2 className="detail-title" style={{ position: "absolute", left: 0, right: 0, bottom: 24, padding: "0 36px" }}>
            {project.title} <em>{project.em}</em>
          </h2>
        </div>
        <div className="detail-meta">
          <div><h6>role</h6><b>{project.role}</b></div>
          <div><h6>year</h6><b>{project.year}</b></div>
          <div><h6>scale</h6><b>{project.scale}</b></div>
          <div><h6>stack</h6>{project.tags.join(" · ")}</div>
        </div>
      </div>
      {(bladesIn || bladesOut) && (
        <div className="blade-stage">
          {Array.from({ length: blades }).map((_, i) => (
            <div key={i} className={`blade ${bladesOut ? "exit" : "enter"}`}
              style={{ top: `${(i / blades) * 100}%`,
                animationDelay: bladesOut ? `${(blades - 1 - i) * 60}ms` : `${i * 60}ms` }}/>
          ))}
        </div>
      )}
    </>
  );
}

window.Loader = Loader;
window.Cursor = Cursor;
window.ProjectDetail = ProjectDetail;
