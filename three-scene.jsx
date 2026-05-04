// Three.js immersive landing — backend system architecture as 3D environment.
// Camera flies through a fog-lit lattice of nodes, streams, and orbiting rings.
// Scroll-driven: progress 0→1 maps to camera path through scene.

function ThreeScene({ accent = "#F4A93C", onProgressChange }) {
  const mountRef = React.useRef(null);
  const stateRef = React.useRef({
    scrollProgress: 0,
    targetProgress: 0,
    mouseX: 0, mouseY: 0,
    mouseTargetX: 0, mouseTargetY: 0,
  });

  React.useEffect(() => {
    if (!window.THREE) return;
    const mount = mountRef.current;
    if (!mount) return;
    const THREE = window.THREE;

    // ── renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── scene + fog (cinematic depth) ───────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0A0A0B, 0.022);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 400);
    camera.position.set(0, 4, 30);

    // ── lighting ────────────────────────────────────────────────────────────
    const amb = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(8, 20, 12);
    scene.add(key);
    const accentLight = new THREE.PointLight(new THREE.Color(accent), 4.0, 80);
    accentLight.position.set(0, 6, 0);
    scene.add(accentLight);
    const rimLight = new THREE.PointLight(0x4a90e2, 1.6, 60);
    rimLight.position.set(-12, 2, -10);
    scene.add(rimLight);

    // ── ground / horizon plane (a wireframe grid with custom shader feel) ───
    const gridGeo = new THREE.PlaneGeometry(400, 400, 80, 80);
    const gridMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAccent: { value: new THREE.Color(accent) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDist;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 p = position;
          float d = length(p.xy);
          p.z += sin(d * 0.18 - uTime * 0.6) * 0.4;
          vDist = d;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vDist;
        uniform float uTime;
        uniform vec3 uAccent;
        void main() {
          vec2 g = abs(fract(vUv * 60.0 - 0.5) - 0.5) / fwidth(vUv * 60.0);
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          float falloff = smoothstep(180.0, 20.0, vDist);
          float pulse = 0.3 + 0.7 * smoothstep(0.0, 1.0, sin(vDist * 0.05 - uTime * 0.4) * 0.5 + 0.5);
          vec3 col = mix(vec3(0.4, 0.42, 0.48), uAccent, pulse * 0.4);
          gl_FragColor = vec4(col, line * falloff * 0.55);
        }
      `,
      side: THREE.DoubleSide,
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -6;
    scene.add(grid);

    // ── system nodes (the core architecture) ────────────────────────────────
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeData = [
      { x: 0,    y: 2,    z: -5,  size: 1.4, kind: "core" },
      { x: -7,   y: 1,    z: -2,  size: 0.9, kind: "edge" },
      { x: 7,    y: 3,    z: -3,  size: 0.9, kind: "edge" },
      { x: -4,   y: 4.5,  z: -10, size: 0.7, kind: "service" },
      { x: 5,    y: 5,    z: -12, size: 0.7, kind: "service" },
      { x: 0,    y: 6,    z: -18, size: 1.0, kind: "core" },
      { x: -10,  y: 0,    z: -16, size: 0.6, kind: "service" },
      { x: 9,    y: 0.5,  z: -18, size: 0.6, kind: "service" },
      { x: -5,   y: -2,   z: -8,  size: 0.5, kind: "leaf" },
      { x: 4,    y: -2,   z: -7,  size: 0.5, kind: "leaf" },
      { x: 0,    y: 8,    z: -28, size: 0.8, kind: "core" },
      { x: -8,   y: 6,    z: -25, size: 0.6, kind: "service" },
      { x: 8,    y: 5,    z: -26, size: 0.6, kind: "service" },
      { x: 3,    y: 13,   z: -36, size: 0.7, kind: "service" },
      { x: -7,   y: 10,   z: -38, size: 0.6, kind: "service" },
      { x: 0,    y: 16,   z: -48, size: 1.1, kind: "core" },
      { x: -4,   y: 14,   z: -43, size: 0.5, kind: "leaf" },
      { x: 6,    y: 12,   z: -42, size: 0.5, kind: "leaf" },
    ];

    const nodes = [];
    nodeData.forEach((d, i) => {
      // outer glow ring
      const ringGeo = new THREE.RingGeometry(d.size * 1.4, d.size * 1.5, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true, opacity: 0.6, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);

      // core sphere — wireframe icosahedron
      const geo = new THREE.IcosahedronGeometry(d.size, d.kind === "core" ? 1 : 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x18181C,
        emissive: new THREE.Color(accent),
        emissiveIntensity: d.kind === "core" ? 0.5 : 0.18,
        metalness: 0.7, roughness: 0.25,
        wireframe: false,
      });
      const sphere = new THREE.Mesh(geo, mat);

      const wireGeo = new THREE.IcosahedronGeometry(d.size * 1.05, d.kind === "core" ? 1 : 0);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, wireframe: true,
        transparent: true, opacity: d.kind === "core" ? 0.35 : 0.18,
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);

      // additive glow halo — fake bloom without EffectComposer
      const haloGeo = new THREE.SphereGeometry(d.size * 4.5, 12, 12);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true, opacity: d.kind === "core" ? 0.055 : 0.024,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);

      const grp = new THREE.Group();
      grp.add(sphere); grp.add(wire); grp.add(ring); grp.add(halo);
      grp.position.set(d.x, d.y, d.z);
      grp.userData = { ...d, idx: i, baseY: d.y, ring };
      nodeGroup.add(grp);
      nodes.push(grp);
    });

    // ── stream lines (kafka-style flowing connections) ──────────────────────
    const streamGroup = new THREE.Group();
    scene.add(streamGroup);
    const links = [
      [0,1],[0,2],[0,3],[0,4],[1,8],[2,9],[3,5],[4,5],[5,6],[5,7],[5,10],[10,11],[10,12],[6,11],[7,12],[1,6],[2,6],
      [10,13],[11,14],[12,13],[13,15],[14,15],[15,16],[15,17],
    ];
    const streams = [];
    links.forEach(([a, b]) => {
      const A = nodeData[a], B = nodeData[b];
      const mid = new THREE.Vector3((A.x+B.x)/2, Math.max(A.y,B.y) + 1.4, (A.z+B.z)/2);
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(A.x, A.y, A.z),
        mid,
        new THREE.Vector3(B.x, B.y, B.z),
      );
      const tube = new THREE.TubeGeometry(curve, 32, 0.025, 6, false);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.12,
      });
      const mesh = new THREE.Mesh(tube, mat);
      streamGroup.add(mesh);

      // packet — small orb traveling the curve
      const packetGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent) });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      streamGroup.add(packet);
      streams.push({ curve, packet, t: Math.random(), speed: 0.18 + Math.random() * 0.22 });
    });

    // ── particle field (data dust) ──────────────────────────────────────────
    const pCount = 2400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    const accCol = new THREE.Color(accent);
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random() - 0.5) * 100;
      pPos[i*3+1] = (Math.random() - 0.5) * 30;
      pPos[i*3+2] = -Math.random() * 80 + 10;
      const isAcc = Math.random() < 0.18;
      const c = isAcc ? accCol : new THREE.Color(0xffffff);
      pCol[i*3] = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));

    // pre-compute morph formation: each particle assigned to a node cluster
    const formationPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const nd = nodeData[i % nodeData.length];
      const spread = nd.kind === "core" ? 2.8 : 1.6;
      formationPos[i*3]   = nd.x + (Math.random() - 0.5) * spread * 3.5;
      formationPos[i*3+1] = nd.y + (Math.random() - 0.5) * spread * 3.5;
      formationPos[i*3+2] = nd.z + (Math.random() - 0.5) * spread * 1.8;
    }
    const pMat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.85,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ── orbit ring around hero core ─────────────────────────────────────────
    const orbitGroup = new THREE.Group();
    [3.5, 5.0, 6.8].forEach((r, i) => {
      const oGeo = new THREE.TorusGeometry(r, 0.012, 8, 200);
      const oMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? accent : 0xffffff,
        transparent: true, opacity: i === 1 ? 0.5 : 0.18,
      });
      const torus = new THREE.Mesh(oGeo, oMat);
      torus.rotation.x = Math.PI / 2 + i * 0.3;
      torus.rotation.z = i * 0.5;
      orbitGroup.add(torus);
    });
    orbitGroup.position.set(0, 2, -5);
    scene.add(orbitGroup);

    // ── volumetric nebula — FBM noise planes give smoke/atmosphere behind nodes ──
    const nebulaMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uAccent: { value: new THREE.Color(accent) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying vec2 vUv; uniform float uTime; uniform vec3 uAccent;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
        float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.05;a*=0.48;}return v;}
        void main(){
          vec2 uv=vUv-0.5; float t=uTime*0.02;
          float f=fbm(uv*2.5+vec2(t,t*0.65));
          float f2=fbm(uv*4.8-vec2(t*0.4,t*1.2));
          float cloud=pow(max(0.0,f*f2*3.2),1.7);
          float edge=1.0-smoothstep(0.22,0.5,length(uv));
          vec3 col=mix(vec3(0.01,0.01,0.04),uAccent*0.5,cloud);
          float alpha=cloud*edge*0.16;
          gl_FragColor=vec4(col*alpha,alpha);
        }
      `,
    });
    const nebulaA = new THREE.Mesh(new THREE.PlaneGeometry(200, 100), nebulaMat);
    nebulaA.position.set(0, 6, -24); scene.add(nebulaA);

    const nebulaMat2 = nebulaMat.clone();
    nebulaMat2.uniforms = { uTime: { value: 60 }, uAccent: { value: new THREE.Color(accent) } };
    const nebulaB = new THREE.Mesh(new THREE.PlaneGeometry(180, 90), nebulaMat2);
    nebulaB.position.set(2, 12, -46); scene.add(nebulaB);

    // ── lens flare at accent light — billboard cross + soft core ──────────────
    const flareMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent), transparent: true, opacity: 0.07,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const flareCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accent), transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const flareGroup = new THREE.Group();
    flareGroup.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 0.07), flareMat));
    flareGroup.add(new THREE.Mesh(new THREE.PlaneGeometry(0.07, 16), flareMat));
    flareGroup.add(new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), flareCoreMat));
    flareGroup.position.copy(accentLight.position);
    scene.add(flareGroup);

    // ── volumetric god-ray cone descending from accent light ──────────────────
    const godRayMat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uAccent: { value: new THREE.Color(accent) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        varying vec2 vUv; uniform float uTime; uniform vec3 uAccent;
        void main(){
          float radial = max(0.0, 1.0 - length(vUv - vec2(0.5)) * 3.2);
          float height = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
          float flicker = 0.82 + 0.18 * sin(uTime * 2.1 + vUv.y * 5.0);
          float alpha = radial * height * flicker * 0.09;
          gl_FragColor = vec4(uAccent * alpha * 1.4, alpha);
        }
      `,
    });
    const godRay = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 9, 22, 32, 1, true), godRayMat);
    godRay.position.set(accentLight.position.x, accentLight.position.y - 11, accentLight.position.z);
    scene.add(godRay);

    // ── camera path (scroll-driven flythrough — 2.5× deeper for cinematic depth) ──
    const camCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,  4,  38),
      new THREE.Vector3(5,  3,  24),
      new THREE.Vector3(-6, 5.5, 12),
      new THREE.Vector3(1,  4,   0),
      new THREE.Vector3(-5, 6,  -14),
      new THREE.Vector3(4,  9,  -28),
      new THREE.Vector3(-3, 11, -42),
      new THREE.Vector3(0,  13, -54),
    ]);
    const camLook = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2,  -5),
      new THREE.Vector3(0, 2,  -10),
      new THREE.Vector3(0, 3,  -16),
      new THREE.Vector3(0, 5,  -24),
      new THREE.Vector3(0, 7,  -32),
      new THREE.Vector3(0, 10, -42),
      new THREE.Vector3(0, 12, -52),
      new THREE.Vector3(0, 14, -62),
    ]);

    // ── mouse parallax ──────────────────────────────────────────────────────
    function onMove(e) {
      const r = mount.getBoundingClientRect();
      stateRef.current.mouseTargetX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      stateRef.current.mouseTargetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMove);

    function onScroll() {
      const heroEl = document.getElementById("home");
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const total = heroEl.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      stateRef.current.targetProgress = p;
      onProgressChange && onProgressChange(p);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── resize ──────────────────────────────────────────────────────────────
    function onResize() {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      renderer.setSize(w2, h2);
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ── animation loop ──────────────────────────────────────────────────────
    let raf, t0 = performance.now();
    function tick() {
      const t = (performance.now() - t0) / 1000;
      const s = stateRef.current;
      s.scrollProgress += (s.targetProgress - s.scrollProgress) * 0.06;
      s.mouseX += (s.mouseTargetX - s.mouseX) * 0.05;
      s.mouseY += (s.mouseTargetY - s.mouseY) * 0.05;

      // camera follows curve with banking roll + mouse parallax
      const clampedP = Math.min(0.999, s.scrollProgress);
      const camPos = camCurve.getPointAt(clampedP);
      const lookAt = camLook.getPointAt(clampedP);
      const camTan = camCurve.getTangentAt(clampedP);
      camera.position.copy(camPos);
      camera.position.x += s.mouseX * 1.4;
      camera.position.y += -s.mouseY * 0.8;
      const roll = -camTan.x * 0.24;
      camera.up.set(Math.sin(roll) * 0.7, Math.cos(roll), 0);
      camera.lookAt(lookAt);

      // grid + nebula + god ray time
      gridMat.uniforms.uTime.value = t;
      nebulaMat.uniforms.uTime.value = t;
      nebulaMat2.uniforms.uTime.value = t + 60;
      godRayMat.uniforms.uTime.value = t;

      // node bobbing + ring billboarding
      nodes.forEach((n, i) => {
        n.position.y = n.userData.baseY + Math.sin(t * 0.7 + i * 0.9) * 0.18;
        n.rotation.y += 0.003 + (n.userData.kind === "core" ? 0.004 : 0);
        n.rotation.x += 0.001;
        n.userData.ring.lookAt(camera.position);
      });

      // stream packets travel curves
      streams.forEach((s2) => {
        s2.t += s2.speed * 0.005;
        if (s2.t > 1) s2.t = 0;
        const pt = s2.curve.getPointAt(s2.t);
        s2.packet.position.copy(pt);
      });

      // orbit rings
      orbitGroup.rotation.y = t * 0.15;
      orbitGroup.rotation.z = Math.sin(t * 0.2) * 0.1;

      // particle drift + morph toward node-cluster formation on scroll
      const pa = pGeo.attributes.position.array;
      const morphAmt = Math.max(0, Math.min(1, (s.scrollProgress - 0.22) / 0.38));
      for (let i = 0; i < pCount; i++) {
        pa[i*3+1] += Math.sin(t * 0.4 + i) * 0.0015;
        if (morphAmt > 0.005) {
          pa[i*3]   += (formationPos[i*3]   - pa[i*3])   * morphAmt * 0.028;
          pa[i*3+1] += (formationPos[i*3+1] - pa[i*3+1]) * morphAmt * 0.028;
          pa[i*3+2] += (formationPos[i*3+2] - pa[i*3+2]) * morphAmt * 0.028;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.01;

      // accent light pulse + flare billboard
      const lightPulse = 3.5 + Math.sin(t * 1.2) * 0.6;
      accentLight.intensity = lightPulse;
      flareGroup.lookAt(camera.position);
      const flarePulse = 0.82 + Math.sin(t * 1.9) * 0.18;
      flareMat.opacity = 0.065 * flarePulse;
      flareCoreMat.opacity = 0.13 * flarePulse;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [accent]);

  return <div ref={mountRef} className="three-mount" />;
}

window.ThreeScene = ThreeScene;
