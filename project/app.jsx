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

  const accent = accentHex[tweaks.accent] || accentHex.amber;

  return (
    <>
      <Cursor />
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {tweaks.grain && <div className="grain" />}
      <div className="vignette" />

      <a href="#home" className="brand-fixed">
        <svg className="brand-mark" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="3.5" r="2.5" fill="currentColor"/>
          <circle cx="3" cy="20.5" r="2.5" fill="currentColor" opacity="0.5"/>
          <circle cx="21" cy="20.5" r="2.5" fill="currentColor" opacity="0.5"/>
          <line x1="12" y1="6" x2="4.2" y2="18.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5"/>
          <line x1="12" y1="6" x2="19.8" y2="18.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3"/>
          <line x1="5.5" y1="20.5" x2="18.5" y2="20.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3"/>
        </svg>
        <span>MODI</span>
      </a>

      <VerticalNav />

      <div className="status-fixed">
        <div><span className="pulse"></span><b>SYSTEM · LIVE</b></div>
        <div>IIT KANPUR · IST</div>
      </div>

      <main>
        <HeroSection accent={accent} />
        <IdentityReveal accent={accent} />
        <ArchitectureSection />
        <AboutTerminalSection />
        <ProjectsSection onOpen={(p) => setOpenProject(p)} accent={accent} />
        <TimelineSection />
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
