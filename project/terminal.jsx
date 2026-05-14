// Animated terminal — types out an "about" sequence on a loop with realistic pauses.
const TERM_SCRIPT = [
  { t: "prompt", v: "modi@infra ~ $ " },
  { t: "type",   v: "whoami --verbose" },
  { t: "out",    v: "name        Pratham Modi" },
  { t: "out",    v: "alias       modi" },
  { t: "out",    v: "title       Software Development Engineer" },
  { t: "out",    v: "based       IIT KANPUR, IN  ·  remote" },
  { t: "out",    v: "uptime      2y · still curious" },
  { t: "blank" },
  { t: "prompt", v: "modi@infra ~ $ " },
  { t: "type",   v: "cat focus.md" },
  { t: "out",    v: "# things I think about" },
  { t: "out",    v: "- distributed systems that don't lie about consistency" },
  { t: "out",    v: "- p99 latency budgets · cache hierarchies · backpressure" },
  { t: "out",    v: "- observability so good debugging feels like reading" },
  { t: "out",    v: "- frontend that proves backend people can ship pixels" },
  { t: "blank" },
  { t: "prompt", v: "modi@infra ~ $ " },
  { t: "type",   v: "uptime --metrics" },
  { t: "out",    v: "served      2M+ users · 99.9% uptime · IIT Kanpur" },
  { t: "out",    v: "processed   500K+ daily notifications · 99.5% delivery" },
  { t: "out",    v: "optimized   DB 450ms → 135ms  ·  70% improvement" },
  { t: "out",    v: "broke       prod once  ·  postmortem on request" },
  { t: "out",    v: "published   IEEE · DES/AES/RSA/DHKE analysis" },
  { t: "out",    v: "awarded     Winner · Decentralized AI Buildathon 2024" },
  { t: "out",    v: "finalist    Smart India Hackathon 2023" },
  { t: "blank" },
  { t: "prompt", v: "modi@infra ~ $ " },
  { t: "type",   v: "echo \"this site is the proof\"" },
  { t: "out",    v: "this site is the proof" },
  { t: "blank" },
  { t: "prompt", v: "modi@infra ~ $ " },
  { t: "caret" },
];

function AnimatedTerminal() {
  const [lines, setLines] = React.useState([]);
  const [typing, setTyping] = React.useState("");
  const idxRef = React.useRef(0);
  const charRef = React.useRef(0);
  const aliveRef = React.useRef(true);

  React.useEffect(() => {
    aliveRef.current = true;
    let timeout;

    function step() {
      if (!aliveRef.current) return;
      const i = idxRef.current;
      if (i >= TERM_SCRIPT.length) {
        // restart loop after a beat
        timeout = setTimeout(() => {
          if (!aliveRef.current) return;
          idxRef.current = 0;
          charRef.current = 0;
          setLines([]);
          setTyping("");
          step();
        }, 3200);
        return;
      }
      const node = TERM_SCRIPT[i];
      if (node.t === "type") {
        const c = charRef.current;
        if (c <= node.v.length) {
          setTyping(node.v.slice(0, c));
          charRef.current = c + 1;
          timeout = setTimeout(step, 22 + Math.random() * 50);
        } else {
          setLines((L) => [...L, { t: "typed", v: node.v, prompt: TERM_SCRIPT[i - 1]?.v || "" }]);
          setTyping("");
          charRef.current = 0;
          idxRef.current = i + 1;
          timeout = setTimeout(step, 240);
        }
      } else if (node.t === "prompt") {
        // prompts are paired with the following type — skip displaying alone
        idxRef.current = i + 1;
        step();
      } else if (node.t === "out") {
        setLines((L) => [...L, node]);
        idxRef.current = i + 1;
        timeout = setTimeout(step, 30 + Math.random() * 50);
      } else if (node.t === "blank") {
        setLines((L) => [...L, node]);
        idxRef.current = i + 1;
        timeout = setTimeout(step, 180);
      } else if (node.t === "caret") {
        setLines((L) => [...L, node]);
        idxRef.current = i + 1;
        // sit on caret, then will loop on next step
        timeout = setTimeout(step, 1200);
      }
    }
    timeout = setTimeout(step, 700);
    return () => { aliveRef.current = false; clearTimeout(timeout); };
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
        <span className="title">modi@infra · ~ · zsh</span>
        <span className="pulse">live</span>
      </div>
      <div className="terminal-body">
        {lines.map((l, i) => {
          if (l.t === "blank") return <span className="terminal-line" key={i}>&nbsp;</span>;
          if (l.t === "typed") return (
            <span className="terminal-line" key={i}>
              <span className="term-prompt">{l.prompt}</span>
              <span className="term-key">{l.v}</span>
            </span>
          );
          if (l.t === "out") return <span className="terminal-line term-out" key={i}>{l.v}</span>;
          if (l.t === "caret") return <span className="terminal-line" key={i}><span className="term-prompt">modi@infra ~ $ </span><span className="term-caret"></span></span>;
          return null;
        })}
        {typing && (
          <span className="terminal-line">
            <span className="term-prompt">modi@infra ~ $ </span>
            <span className="term-key">{typing}</span>
            <span className="term-caret"></span>
          </span>
        )}
      </div>
    </div>
  );
}

window.AnimatedTerminal = AnimatedTerminal;
