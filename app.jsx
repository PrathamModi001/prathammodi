function App() {
  const [loaded, setLoaded] = React.useState(false);
  const [openProject, setOpenProject] = React.useState(null);
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "accent": "amber",
    "grain": true
  }/*EDITMODE-END*/);

  const accentMap = {
    amber: "oklch(0.78 0.16 75)",
    cyan:  "oklch(0.82 0.16 200)",
    green: "oklch(0.82 0.21 140)",
    rose:  "oklch(0.74 0.18 18)",
  };
  const accentHex = {
    amber: "#F4A93C", cyan: "#3CDCE5", green: "#5DE56A", rose: "#F26B5E",
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentMap[tweaks.accent] || accentMap.amber);
  }, [tweaks.accent]);

  React.useEffect(() => {
    if (openProject) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [openProject]);

  // global h2 clip-path wipe-reveal via GSAP ScrollTrigger
  React.useEffect(() => {
    if (!loaded) return;
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    gsap.registerPlugin(ST);
    const tid = setTimeout(() => {
      // h2 clip-path wipe reveal
      document.querySelectorAll(".h2").forEach(el => {
        el.style.clipPath = "inset(0 102% 0 0)";
        gsap.to(el, {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.4, ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        });
      });

      // section-label: staggered children reveal
      document.querySelectorAll(".section-label").forEach(el => {
        gsap.fromTo(Array.from(el.children),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" },
          }
        );
      });

      // timeline items: smooth individual reveal, no IO conflict
      const tlItems = document.querySelectorAll(".timeline-item");
      tlItems.forEach((item, i) => {
        gsap.set(item, { opacity: 0, x: -20, y: 16 });
        gsap.to(item, {
          opacity: 1, x: 0, y: 0,
          duration: 1.6, ease: "expo.out",
          delay: i * 0.06,
          scrollTrigger: { trigger: item, start: "top 88%", toggleActions: "play none none none" },
        });
      });
    }, 300);
    return () => clearTimeout(tid);
  }, [loaded]);

  const accent = accentHex[tweaks.accent] || accentHex.amber;

  return (
    <>
      <Cursor accent={accent} />
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {tweaks.grain && <div className="grain" />}
      <div className="vignette" />

      <a href="#home" className="brand-fixed">
        <span className="brand-mark"></span>
        <span>MODI · v2.0</span>
      </a>

      <VerticalNav />

      <div className="status-fixed">
        <div><span className="pulse"></span><b>SYSTEM · LIVE</b></div>
        <div>BENGALURU · IST</div>
      </div>

      <main>
        <HeroSection accent={accent} />
        <MarqueeSection />
        <IdentityReveal accent={accent} />
        <ArchitectureSection accent={accent} />
        <AboutTerminalSection />
        <ProjectsSection onOpen={(p) => setOpenProject(p)} accent={accent} />
        <TimelineSection accent={accent} />
        <ContactSection accent={accent} />
        <footer className="foot">
          <span>© 2026 · pratham modi</span>
          <span>built · not assembled</span>
          <span>last deploy · {new Date().toISOString().slice(0,10)}</span>
        </footer>
      </main>

      <ProjectDetail
        project={openProject}
        onClose={() => setOpenProject(null)}
        accent={accent}
      />

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakRadio
          label="hue" value={tweaks.accent}
          onChange={(v) => setTweak("accent", v)}
          options={["amber","cyan","green","rose"]}
        />
        <TweakSection label="Atmosphere" />
        <TweakToggle label="film grain" value={tweaks.grain} onChange={(v) => setTweak("grain", v)} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
