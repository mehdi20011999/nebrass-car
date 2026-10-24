/* =========================================================
   Nebrass Car — Voiture 3D de l'accueil (Three.js, WebGL)
   - Voiture modélisée en code (pas de fichier 3D externe)
   - Plateau tournant, reflets, rotation à la souris / au doigt
   - Si WebGL n'est pas disponible, l'illustration 2D reste affichée
   ========================================================= */
import * as THREE from "./vendor/three.module.min.js";

const stage  = document.getElementById("stage");
const canvas = document.getElementById("car3d");

/* ---------- Réglages faciles ---------- */
const CAR_COLOR   = 0xfbf5ef;   // couleur de la carrosserie
const ACCENT      = 0xffb347;   // anneau lumineux du plateau
const AUTO_SPEED  = 0.35;       // vitesse de rotation automatique
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  renderer = null;
}

if (renderer && stage) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  /* ---------- Environnement pour les reflets ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(buildEnvScene(), 0.04).texture;

  /* ---------- Lumières ---------- */
  scene.add(new THREE.HemisphereLight(0xffe2b8, 0x24112f, 0.8));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc879b0, 2.2);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  /* Lumière de la lanterne (au-dessus de la voiture) */
  const lantern = new THREE.PointLight(0xffb347, 16, 14, 1.6);
  lantern.position.set(0, 4.2, 0);
  scene.add(lantern);

  /* ---------- Plateau + voiture ---------- */
  const turntable = new THREE.Group();
  scene.add(turntable);
  turntable.add(buildPlatform());
  const car = buildCar();
  car.position.y = 0.12;
  car.scale.setScalar(1.18);
  turntable.add(car);
  turntable.rotation.y = -0.65;

  /* ---------- Taille et caméra ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = camera.aspect < 1 ? 12.5 / camera.aspect * 0.85 : 12.5;
    camera.position.set(dist * 0.64, dist * 0.27, dist * 0.72);
    camera.lookAt(0, 0.55, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ---------- Rotation à la souris / au doigt ---------- */
  let dragging = false, lastX = 0, velocity = 0;
  canvas.addEventListener("pointerdown", e => {
    dragging = true; lastX = e.clientX; velocity = 0;
    canvas.setPointerCapture(e.pointerId);
    stage.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    const dir = document.documentElement.dir === "rtl" ? -1 : 1;
    velocity = dx * 0.012 * dir;
    turntable.rotation.y += velocity;
  });
  const stop = () => { dragging = false; stage.classList.remove("dragging"); };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.style.touchAction = "pan-y";

  /* ---------- Boucle d'animation (en pause hors écran) ---------- */
  let visible = true, last = performance.now(), t = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (visible && !document.hidden) {
      t += dt;
      if (!dragging) {
        velocity *= 0.94;
        turntable.rotation.y += velocity + (reduceMotion ? 0 : AUTO_SPEED * dt);
      }
      lantern.intensity = 16 + (reduceMotion ? 0 : Math.sin(t * 7) * 1.2 + Math.sin(t * 13.3) * 0.8);
      car.position.y = 0.12 + (reduceMotion ? 0 : Math.sin(t * 1.6) * 0.015);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
  }
  renderer.render(scene, camera);
  stage.classList.add("is-3d");
  requestAnimationFrame(frame);
}

/* =========================================================
   Construction de la voiture
   ========================================================= */
function buildCar() {
  const car = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: CAR_COLOR, metalness: 0.35, roughness: 0.28,
    clearcoat: 1, clearcoatRoughness: 0.06
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x1a0b23, metalness: 0.4, roughness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.92
  });
  const trim   = new THREE.MeshStandardMaterial({ color: 0x1a0b23, metalness: 0.5, roughness: 0.45 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xf3e3c9, metalness: 1, roughness: 0.18 });
  const tire   = new THREE.MeshStandardMaterial({ color: 0x111317, metalness: 0, roughness: 0.85 });
  const head   = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1d6, emissiveIntensity: 2.2 });
  const tail   = new THREE.MeshStandardMaterial({ color: 0xff3344, emissive: 0xff1f33, emissiveIntensity: 1.8 });

  /* Bas de caisse (profil latéral extrudé) */
  const body = new THREE.Shape();
  body.moveTo(-2.05, 0.30);
  body.quadraticCurveTo(-2.16, 0.42, -2.12, 0.62);
  body.quadraticCurveTo(-2.10, 0.86, -1.92, 0.93);
  body.lineTo(-1.20, 0.99);
  body.lineTo(1.00, 0.99);
  body.quadraticCurveTo(1.70, 0.94, 1.95, 0.84);
  body.quadraticCurveTo(2.16, 0.76, 2.15, 0.56);
  body.quadraticCurveTo(2.14, 0.36, 2.02, 0.30);
  body.lineTo(1.85, 0.30);
  body.absarc(1.35, 0.30, 0.50, 0, Math.PI, false);
  body.lineTo(-0.85, 0.30);
  body.absarc(-1.35, 0.30, 0.50, 0, Math.PI, false);
  body.lineTo(-2.05, 0.30);
  car.add(extrude(body, 1.62, paint, { bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 8 }));

  /* Habitacle vitré */
  const cabin = new THREE.Shape();
  cabin.moveTo(-1.62, 0.97);
  cabin.quadraticCurveTo(-1.30, 1.30, -0.95, 1.40);
  cabin.lineTo(0.25, 1.42);
  cabin.quadraticCurveTo(0.62, 1.30, 1.12, 0.97);
  cabin.lineTo(-1.62, 0.97);
  car.add(extrude(cabin, 1.38, glass, { bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 5 }));

  /* Toit */
  const roof = new THREE.Shape();
  roof.moveTo(-1.02, 1.38);
  roof.quadraticCurveTo(-0.95, 1.47, -0.80, 1.48);
  roof.lineTo(0.18, 1.49);
  roof.quadraticCurveTo(0.34, 1.47, 0.36, 1.38);
  roof.lineTo(-1.02, 1.38);
  car.add(extrude(roof, 1.30, paint, { bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 5 }));

  /* Montant central */
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.44, 1.52), paint);
  pillar.position.set(-0.30, 1.19, 0);
  car.add(pillar);

  /* Phares, feux, calandre, rétroviseurs, poignées */
  for (const z of [-0.56, 0.56]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.42), head);
    hl.position.set(2.21, 0.70, z); car.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.46), tail);
    tl.position.set(-2.18, 0.76, z); car.add(tl);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.12), trim);
    mirror.position.set(0.95, 1.06, z > 0 ? 0.95 : -0.95); car.add(mirror);
    for (const x of [0.15, -0.85]) {
      const hd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.03), chrome);
      hd.position.set(x, 0.86, z > 0 ? 0.905 : -0.905); car.add(hd);
    }
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.9), trim);
  grille.position.set(2.2, 0.47, 0); car.add(grille);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.84), trim);
  skirt.position.set(0, 0.29, 0); car.add(skirt);

  /* Roues */
  for (const x of [-1.35, 1.35]) for (const z of [-0.76, 0.76]) {
    const wheel = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.3, 48), tire);
    t.rotation.x = Math.PI / 2; wheel.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 40), chrome);
    rim.rotation.x = Math.PI / 2; wheel.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.34, 20), trim);
    hub.rotation.x = Math.PI / 2; wheel.add(hub);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.04), trim);
      spoke.rotation.z = (i / 5) * Math.PI * 2;
      spoke.position.z = z > 0 ? 0.165 : -0.165;
      wheel.add(spoke);
    }
    wheel.position.set(x, 0.30, z);
    car.add(wheel);
  }
  return car;
}

function extrude(shape, depth, material, bevel) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, curveSegments: 28, bevelEnabled: true, ...bevel
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

/* =========================================================
   Plateau tournant
   ========================================================= */
function buildPlatform() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3.3, 3.45, 0.22, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x2f1840, metalness: 0.6, roughness: 0.3, clearcoat: 0.8 })
  );
  base.position.y = -0.11;
  g.add(base);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(3.15, 3.15, 0.02, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x2a1236, metalness: 0.15, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 })
  );
  top.position.y = 0.005;
  g.add(top);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.22, 0.035, 16, 160),
    new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 2.4 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);

  /* Ombre de contact sous la voiture */
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,.75)");
  grd.addColorStop(0.55, "rgba(0,0,0,.35)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.8),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  g.add(shadow);
  return g;
}

/* =========================================================
   Studio virtuel pour les reflets de la carrosserie
   ========================================================= */
function buildEnvScene() {
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(20, 32, 16);
  const colors = [];
  const pos = geo.attributes.position;
  const top = new THREE.Color(0xffd08a), mid = new THREE.Color(0x4a2259), bot = new THREE.Color(0x12061a);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 20;
    const col = y > 0 ? mid.clone().lerp(top, y) : mid.clone().lerp(bot, -y);
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const s1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.4), strip);
  s1.position.set(0, 9, 0); s1.rotation.x = Math.PI / 2; env.add(s1);
  const s2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 8), strip);
  s2.position.set(10, 4, 4); s2.lookAt(0, 0, 0); env.add(s2);
  const s3 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 8), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
  s3.position.set(-10, 4, -4); s3.lookAt(0, 0, 0); env.add(s3);
  return env;
}
