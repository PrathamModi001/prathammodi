// Fluid-feeling particle field — Canvas2D, GPU-friendly, works everywhere.
// Curl-noise approximation drives drift; each particle leaves a short trail.

function ParticleField({ density = 1, accent = "#F4A93C", interactive = true }) {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({ particles: [], mouse: { x: -9999, y: -9999, active: false }, t: 0, raf: 0 });

  React.useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d", { alpha: true });
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    function resize() {
      const rect = cvs.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      cvs.width = W * dpr; cvs.height = H * dpr;
      cvs.style.width = W + "px"; cvs.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.floor((W * H) / 7000 * density);
      const cur = stateRef.current.particles;
      while (cur.length < target) {
        cur.push({
          x: Math.random() * W,
          y: Math.random() * H,
          px: 0, py: 0,
          vx: 0, vy: 0,
          life: Math.random() * 200,
          size: Math.random() * 1.4 + 0.4,
          hue: Math.random() < 0.18 ? 1 : 0, // 18% accent
        });
        cur[cur.length - 1].px = cur[cur.length - 1].x;
        cur[cur.length - 1].py = cur[cur.length - 1].y;
      }
      while (cur.length > target) cur.pop();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cvs.parentElement);

    function onMove(e) {
      const r = cvs.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - r.left;
      stateRef.current.mouse.y = e.clientY - r.top;
      stateRef.current.mouse.active = true;
    }
    function onLeave() { stateRef.current.mouse.active = false; }
    if (interactive) {
      window.addEventListener("mousemove", onMove);
      cvs.addEventListener("mouseleave", onLeave);
    }

    // pseudo curl-noise from sine fields
    function field(x, y, t) {
      const s = 0.0018;
      const a = Math.sin(x * s + t * 0.0004) + Math.cos(y * s * 1.3 - t * 0.0003);
      const b = Math.cos(x * s * 0.7 - t * 0.0005) + Math.sin(y * s * 0.9 + t * 0.0004);
      return { fx: a * 0.35, fy: b * 0.35 };
    }

    function tick() {
      const s = stateRef.current;
      s.t += 16;
      // trail fade
      ctx.fillStyle = "rgba(10,10,11,0.18)";
      ctx.fillRect(0, 0, W, H);

      const ps = s.particles;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const f = field(p.x, p.y, s.t);
        p.vx = p.vx * 0.94 + f.fx * 0.18;
        p.vy = p.vy * 0.94 + f.fy * 0.18;

        if (s.mouse.active) {
          const dx = p.x - s.mouse.x, dy = p.y - s.mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 24000) {
            const force = (24000 - d2) / 24000;
            const d = Math.sqrt(d2) || 1;
            p.vx += (dx / d) * force * 0.9;
            p.vy += (dy / d) * force * 0.9;
          }
        }

        p.px = p.x; p.py = p.y;
        p.x += p.vx; p.y += p.vy;
        p.life += 1;

        if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10 || p.life > 600) {
          p.x = Math.random() * W; p.y = Math.random() * H;
          p.px = p.x; p.py = p.y;
          p.vx = 0; p.vy = 0; p.life = 0;
        }

        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = p.size;
        if (p.hue) {
          ctx.strokeStyle = accent;
          ctx.shadowBlur = 8;
          ctx.shadowColor = accent;
        } else {
          ctx.strokeStyle = "rgba(245,245,244,0.55)";
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      s.raf = requestAnimationFrame(tick);
    }
    stateRef.current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", onMove);
        cvs.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [density, accent, interactive]);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

window.ParticleField = ParticleField;
