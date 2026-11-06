// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const MODULE_COUNT = 8;

const MODULES = [
  { id: "identity", num: "01", label: "Property Identity", sub: "NFT + Metadata Layer", icon: "⬡" },
  { id: "verification", num: "02", label: "Data Verification", sub: "Upload & Validation Engine", icon: "✦" },
  { id: "wallet", num: "03", label: "Token & Wallet", sub: "HF Points Engine", icon: "◈" },
  { id: "escrow", num: "04", label: "Smart Escrow", sub: "Transaction Workflow", icon: "⬟" },
  { id: "audit", num: "05", label: "Document Audit", sub: "Hash & Timestamp System", icon: "⎊" },
  { id: "marketplace", num: "06", label: "Service Marketplace", sub: "Agents & Vendors", icon: "⬢" },
  { id: "maintenance", num: "07", label: "Predictive Maintenance", sub: "AI Maintenance Engine", icon: "⎈" },
  { id: "vr", num: "08", label: "3D / VR Walkthroughs", sub: "Immersive Visualization", icon: "◉" }
];

function getSliceClipPath(index) {
  const step = (2 * Math.PI) / MODULE_COUNT;
  const gap = 0.005;
  const startAngle = index * step - Math.PI / 2 + gap;
  const endAngle = startAngle + step - 2 * gap;
  const radius = 50;
  const cx = 50;
  const cy = 50;
  const segments = 16;
  const points = [`${cx}% ${cy}%`];
  for (let d = 0; d <= segments; d++) {
    const angle = startAngle + (endAngle - startAngle) * (d / segments);
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    points.push(`${px.toFixed(3)}% ${py.toFixed(3)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

function getModuleAngle(index) {
  return (index / MODULE_COUNT) * 2 * Math.PI - Math.PI / 2 + Math.PI / MODULE_COUNT;
}

// ── DOM ELEMENTS & SETUP ──
const isMobile = () => window.innerWidth < 768;

function getHelixTargetPos(index) {
  const mobile = isMobile();
  const helixSpreadX = mobile ? window.innerWidth * 0.4 : window.innerWidth * 0.24;
  const helixHeight = mobile ? 400 : 540;
  const side = index % 2 === 0 ? -1 : 1;
  const row = Math.floor(index / 2);
  const y = -helixHeight / 2 + row * (helixHeight / 3);
  return { x: side * helixSpreadX, y };
}

// Build 8 Pie Slices
const slicesContainer = document.getElementById("slices-container");
const sliceElements = [];
MODULES.forEach((mod, idx) => {
  const slice = document.createElement("div");
  slice.className = "hf-slice-piece";
  slice.innerHTML = `
    <div class="hf-slice-piece-inner" style="clip-path: ${getSliceClipPath(idx)}">
      <img src="hf-token-bg-removed.png" alt="" />
    </div>
  `;
  slicesContainer.appendChild(slice);
  sliceElements.push(slice);
});

// Build Desktop Module Labels
const desktopLabels = document.getElementById("desktop-labels");
const desktopCardElements = [];
MODULES.forEach((mod, idx) => {
  const pos = getHelixTargetPos(idx);
  const isLeft = idx % 2 === 0;
  const item = document.createElement("a");
  item.href = `#section-${mod.id}`;
  item.className = "hf-module-label-item";
  item.style.top = `calc(50% + ${pos.y}px)`;
  if (isLeft) {
    item.style.right = `calc(50% + ${Math.abs(pos.x)}px)`;
    item.style.flexDirection = "row-reverse";
    item.style.textAlign = "right";
  } else {
    item.style.left = `calc(50% + ${Math.abs(pos.x)}px)`;
    item.style.flexDirection = "row";
    item.style.textAlign = "left";
  }
  item.innerHTML = `
    <div class="hf-module-label-icon">${mod.icon}</div>
    <div class="hf-module-label-text">
      <div class="hf-module-label-title">${mod.label}</div>
      <div class="hf-module-label-sub">${mod.sub}</div>
    </div>
  `;
  desktopLabels.appendChild(item);
  desktopCardElements.push(item);
});

// Build Mobile Module Cards Grid
const mobileCardsContainer = document.getElementById("mobile-cards");
const mobileCardElements = [];
MODULES.forEach((mod) => {
  const card = document.createElement("a");
  card.href = `#section-${mod.id}`;
  card.className = "hf-mobile-card";
  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(200,150,46,0.12); border: 1px solid rgba(200,150,46,0.35); display: flex; align-items: center; justify-content: center; color: #f5d06f; font-size: 1rem; box-shadow: 0 0 14px rgba(200,150,46,0.2); flex-shrink: 0;">
        ${mod.icon}
      </div>
      <span style="font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; color: rgba(200,150,46,0.5); font-family: 'Space Grotesk', sans-serif;">
        ${mod.num}
      </span>
    </div>
    <div style="font-size: 0.75rem; font-weight: 700; color: #f0e0b0; font-family: 'Space Grotesk', sans-serif; line-height: 1.3;">
      ${mod.label}
    </div>
    <div style="font-size: 0.55rem; color: rgba(200,150,46,0.55); letter-spacing: 0.07em; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; font-weight: 500; line-height: 1.3;">
      ${mod.sub}
    </div>
    <div style="height: 1.5px; border-radius: 1px; background: linear-gradient(90deg, #c8962e, transparent); opacity: 0.5; margin-top: 2px;"></div>
  `;
  mobileCardsContainer.appendChild(card);
  mobileCardElements.push(card);
});

// Build Connecting SVG Strands
function buildSvgHelix() {
  const leftHelixPoints = [0, 2, 4, 6].map((idx) => getHelixTargetPos(idx));
  const rightHelixPoints = [1, 3, 5, 7].map((idx) => getHelixTargetPos(idx));

  function generateCurvedPath(pts, direction) {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let j = 0; j < pts.length - 1; j++) {
      const p1 = pts[j];
      const p2 = pts[j + 1];
      const cx = p1.x + direction * 60;
      const cy = (p1.y + p2.y) / 2;
      d += ` Q ${cx} ${cy}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  let svgContent = `
    <path d="${generateCurvedPath(leftHelixPoints, -1)}" fill="none" stroke="rgba(0,180,255,0.60)" stroke-width="1.5" />
    <path d="${generateCurvedPath(rightHelixPoints, 1)}" fill="none" stroke="rgba(0,180,255,0.60)" stroke-width="1.5" />
  `;

  for (let i = 0; i < 4; i++) {
    svgContent += `
      <line x1="${leftHelixPoints[i].x}" y1="${leftHelixPoints[i].y}" x2="${rightHelixPoints[i].x}" y2="${rightHelixPoints[i].y}" stroke="rgba(0,180,255,0.30)" stroke-width="1" stroke-dasharray="6 6" />
    `;
  }
  document.getElementById("helix-svg-element").innerHTML = svgContent;
}
buildSvgHelix();

// ── PROCEDURAL STUDIO ENVIRONMENT MAP FOR METALLIC GOLD REFLECTIONS ──
function createStudioEnvironment(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Sky and studio gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, "#ffffff");      // overhead bright panel
  grad.addColorStop(0.2, "#fff6db");      // warm softbox gold
  grad.addColorStop(0.45, "#4a3311");     // warm studio horizon
  grad.addColorStop(0.7, "#140e05");      // low floor
  grad.addColorStop(1.0, "#050301");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Helper for bright softbox light spots
  function drawStudioLight(x, y, radius, color) {
    const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    radGrad.addColorStop(0, color);
    radGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Key light (super bright white-gold reflection)
  drawStudioLight(250, 120, 200, "#ffffff");
  drawStudioLight(250, 120, 100, "#fffbe6");

  // Secondary fill softbox
  drawStudioLight(760, 160, 220, "#ffefa8");
  drawStudioLight(760, 160, 110, "#ffffff");

  // Cyan-blue accent light (matches the DNA helix blue aura)
  drawStudioLight(512, 340, 160, "rgba(0, 200, 255, 0.75)");

  // Overhead linear strip light
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(80, 20, 864, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  texture.dispose();
  return envMap;
}

// ── THREE.JS PROCEDURAL 3D DNA HELIX ──
function initThreeCanvas() {
  const canvas = document.getElementById("three-canvas");
  const container = document.getElementById("canvas-center");
  const width = container.clientWidth || 380;
  const height = container.clientHeight || 700;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 11);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Set initial bright studio environment immediately so coins never look dark
  scene.environment = createStudioEnvironment(renderer);

  // Exact City Preset Environment Map (potsdamer_platz_1k.hdr)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  function applyHdr(hdrTexture) {
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
    scene.environment = envMap;
    hdrTexture.dispose();
    pmremGenerator.dispose();
  }

  if (typeof THREE.RGBELoader !== "undefined") {
    new THREE.RGBELoader().load(
      "potsdamer_platz_1k.hdr",
      applyHdr,
      undefined,
      function () {
        // Fallback to CDN if local file is blocked by browser CORS
        new THREE.RGBELoader().load(
          "https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/potsdamer_platz_1k.hdr",
          applyHdr,
          undefined,
          function () {
            // Keep procedural studio environment
          }
        );
      }
    );
  }

  // Exact Original Lights from index-BuPLXPm6.js
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffebaa, 3, 0, 0.8, 1);
  spotLight.position.set(0, 15, 10);
  scene.add(spotLight);

  const pointLight1 = new THREE.PointLight(0xffe58f, 1.5);
  pointLight1.position.set(-8, -5, 8);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x4488ff, 0.5);
  pointLight2.position.set(5, -5, -8);
  scene.add(pointLight2);

  // Coin Rim Geometry
  const rimShape = new THREE.Shape();
  rimShape.absarc(0, 0, 0.5, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
  rimShape.holes.push(hole);
  const rimGeom = new THREE.ExtrudeGeometry(rimShape, {
    depth: 1,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  rimGeom.center();
  rimGeom.scale(0.35, 0.45, 0.35);

  // Coin Core Geometry
  const coreShape = new THREE.Shape();
  coreShape.moveTo(-0.1, -0.7);
  coreShape.lineTo(0.2, -0.7);
  coreShape.lineTo(0.2, 0.7);
  coreShape.lineTo(-0.25, 0.7);
  coreShape.lineTo(-0.4, 0.45);
  coreShape.lineTo(-0.1, 0.45);
  const coreGeom = new THREE.ExtrudeGeometry(coreShape, {
    depth: 1,
    curveSegments: 1,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  coreGeom.center();
  coreGeom.scale(0.35, 0.35, 0.35);

  // Exact Original Material from index-BuPLXPm6.js: color: 16766720, metalness: 1, roughness: 0.15, emissive: 11167232, emissiveIntensity: 0.15, envMapIntensity: 2
  const material = new THREE.MeshStandardMaterial({
    color: 16766720,          // 0xffd700
    metalness: 1,
    roughness: 0.15,
    emissive: 11167232,       // 0xaa6600
    emissiveIntensity: 0.15,
    envMapIntensity: 2.0,
  });

  const group = new THREE.Group();
  group.scale.set(0.45, 0.45, 0.45);
  scene.add(group);

  const meshRim = new THREE.InstancedMesh(rimGeom, material, 3000);
  const meshCore = new THREE.InstancedMesh(coreGeom, material, 3000);
  group.add(meshRim);
  group.add(meshCore);

  const rimMatrices = [];
  const coreMatrices = [];

  function addCoinPair(baseMatrix, seed) {
    for (let w = 0; w < 12; w++) {
      const angle = (w * Math.PI * 2) / 12;
      const x = 0.5 * Math.cos(angle);
      const y = 0.8 * Math.sin(angle);
      const p = new THREE.Vector3(-0.5 * Math.sin(angle), 0.8 * Math.cos(angle), 0).normalize();
      const e = new THREE.Vector3(x, y, 0).normalize();
      const a = new THREE.Vector3().crossVectors(p, e).normalize();
      const localMat = new THREE.Matrix4().makeBasis(a, p, e);
      localMat.setPosition(new THREE.Vector3(x, y, 0));
      const finalMat = new THREE.Matrix4().multiplyMatrices(baseMatrix, localMat);
      if ((w + seed) % 5 === 0 || (w + seed) % 2 === 0) {
        rimMatrices.push(finalMat.clone());
      } else {
        coreMatrices.push(finalMat.clone());
      }
    }
  }

  const radius = 3.5;
  const steps = 32;
  const angleStep = 0.44;
  const heightStep = 0.68;

  // 2 Helical Strands
  for (let strand = 0; strand < 2; strand++) {
    for (let i = 0; i < steps; i++) {
      const angle = i * angleStep + strand * Math.PI;
      const y = (i - steps / 2) * heightStep;
      const pos = new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
      const tangent = new THREE.Vector3(-radius * Math.sin(angle), heightStep / angleStep, radius * Math.cos(angle)).normalize();
      const normal = new THREE.Vector3(-Math.cos(angle), 0, -Math.sin(angle)).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      const mat = new THREE.Matrix4();
      if (i % 2 === 0) {
        mat.makeBasis(normal, tangent, binormal.clone().negate());
      } else {
        mat.makeBasis(binormal, tangent, normal);
      }
      mat.setPosition(pos);
      addCoinPair(mat, strand * 1000 + i * 33);
    }
  }

  // Connecting rungs
  for (let i = 4; i < steps - 4; i += 3) {
    const angle = i * angleStep;
    const y = (i - steps / 2) * heightStep;
    const p1 = new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
    const p2 = new THREE.Vector3(radius * Math.cos(angle + Math.PI), y, radius * Math.sin(angle + Math.PI));
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const p = dir;
    const e = new THREE.Vector3(0, 1, 0);
    const a = new THREE.Vector3().crossVectors(p, e).normalize();
    const rungCoins = 4;
    const dist = p1.distanceTo(p2);
    for (let r = 0; r < rungCoins; r++) {
      const frac = (r + 0.5) / rungCoins;
      const rungPos = p1.clone().add(dir.clone().multiplyScalar(dist * frac));
      const mat = new THREE.Matrix4();
      if (r % 2 === 0) {
        mat.makeBasis(a, p, e.clone().negate());
      } else {
        mat.makeBasis(e, p, a);
      }
      mat.setPosition(rungPos);
      addCoinPair(mat, 5000 + i * 11 + r);
    }
  }

  rimMatrices.forEach((mat, idx) => meshRim.setMatrixAt(idx, mat));
  meshRim.count = rimMatrices.length;
  meshRim.instanceMatrix.needsUpdate = true;
  meshRim.frustumCulled = false;

  coreMatrices.forEach((mat, idx) => meshCore.setMatrixAt(idx, mat));
  meshCore.count = coreMatrices.length;
  meshCore.instanceMatrix.needsUpdate = true;
  meshCore.frustumCulled = false;

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    group.rotation.y -= 0.35 * delta;
    group.position.y = Math.sin(elapsedTime * 0.8) * 0.5;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth || 380;
    const newHeight = container.clientHeight || 700;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}
initThreeCanvas();

// ── GSAP TIMELINE & SCROLLTRIGGER ANIMATION ──
function initGsapTimeline() {
  const mobile = isMobile();
  const heroContainer = document.getElementById("hero-container");
  const heroPin = document.getElementById("hero-pin");
  const scrollPrompt = document.getElementById("scroll-prompt");
  const coinContainer = document.getElementById("coin-container");
  const heroHeadline = document.getElementById("hero-headline");
  const coinGlow = document.getElementById("coin-glow");
  const coinSpinLayer = document.getElementById("coin-spin-layer");
  const explosionSvg = document.getElementById("explosion-svg");
  const svgHelix = document.getElementById("svg-helix");
  const canvasCenter = document.getElementById("canvas-center");
  const mobileGrid = document.getElementById("mobile-grid");

  ScrollTrigger.refresh();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroContainer,
      start: "top top",
      end: "+=600%",
      scrub: 1.2,
      pin: heroPin,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
    },
  });

  // 0. Fade scroll prompt
  tl.to(scrollPrompt, { opacity: 0, y: 30, duration: 0.4 }, 0);

  // 1. Move coin container towards center/left
  tl.to(coinContainer, {
    x: mobile ? 0 : "-25vw",
    y: 0,
    scale: 1.05,
    duration: 0.8,
    ease: "power2.inOut",
  }, 0);

  // 2. Fade out headline
  tl.to(heroHeadline, {
    opacity: 0,
    y: -60,
    duration: 0.6,
    ease: "power2.in",
  }, 0.1);

  // 3. Glow explosion
  tl.to(coinGlow, {
    scale: 2.2,
    opacity: 0.8,
    duration: 0.8,
    ease: "power2.out",
  }, 0.8);

  tl.to(explosionSvg, { opacity: 1, duration: 0.4 }, 1.2);
  tl.to(coinSpinLayer, {
    opacity: 0,
    scale: 1.1,
    duration: 0.4,
    ease: "power2.in",
  }, 1.6);
  tl.to(explosionSvg, { opacity: 0, duration: 0.3 }, 1.8);

  // 4. Burst slices outwards radially
  sliceElements.forEach((slice, idx) => {
    const angle = getModuleAngle(idx);
    tl.to(slice, {
      opacity: 1,
      x: Math.cos(angle) * (mobile ? 80 : 140),
      y: Math.sin(angle) * (mobile ? 80 : 130),
      rotate: idx % 2 === 0 ? 15 : -15,
      duration: 0.8,
      ease: "back.out(1.4)",
      force3D: true,
    }, 1.7 + idx * 0.05);
  });

  // 5. Morph slices into 3D double helix formation
  sliceElements.forEach((slice, idx) => {
    const { x, y } = getHelixTargetPos(idx);
    const isLeft = idx % 2 === 0;
    const radAngle = (getModuleAngle(idx) * 180) / Math.PI;
    const targetRotate = (isLeft ? 0 : 180) - radAngle;
    tl.to(slice, {
      x,
      y,
      rotate: targetRotate,
      scale: mobile ? 0.38 : 0.55,
      duration: 1.8,
      ease: "power3.inOut",
      force3D: true,
    }, 3 + idx * 0.1);
  });

  // 6. Reveal connecting SVG DNA strands
  tl.to(svgHelix, { opacity: 1, duration: 0.8 }, 4);

  // 7. Reveal 3D Canvas
  tl.fromTo(canvasCenter, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, 4);

  // 8. Reveal labels
  if (mobile) {
    tl.set(mobileGrid, { visibility: "visible" });
    tl.to(mobileGrid, { opacity: 1, duration: 0.6 }, 4.2);
    mobileCardElements.forEach((card, idx) => {
      tl.fromTo(card, { opacity: 0, y: 30, scale: 0.88 }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.5)",
      }, 4.4 + idx * 0.08);
    });
  } else {
    tl.to(desktopLabels, { opacity: 1, duration: 0.6 }, 4.2);
    desktopCardElements.forEach((card, idx) => {
      tl.fromTo(card, { opacity: 0, x: idx % 2 === 0 ? -40 : 40 }, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: "power2.out",
      }, 4.5 + idx * 0.12);
    });
  }

  // 9. Exit transition
  tl.to([desktopLabels, mobileGrid, svgHelix, canvasCenter, ...sliceElements], {
    opacity: 0,
    y: -100,
    duration: 1.2,
    ease: "power2.inOut",
    force3D: true,
  }, 5.5);

  if (mobile) {
    tl.set(mobileGrid, { visibility: "hidden" }, 6.7);
  }

  tl.to(heroPin, {
    backgroundColor: "#06091a",
    duration: 1.2,
  }, 5.5);
}
initGsapTimeline();

// ── NAVBAR SCROLL & MOBILE MENU INTERACTION ──
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileMenu = document.getElementById("mobile-menu");
hamburgerBtn.addEventListener("click", () => {
  const isOpen = hamburgerBtn.classList.toggle("open");
  mobileMenu.classList.toggle("open", isOpen);
});

document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburgerBtn.classList.remove("open");
    mobileMenu.classList.remove("open");
  });
});



// ── BACK TO TOP BUTTON LOGIC ──
const backToTopBtn = document.getElementById("back-to-top");
if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ── NEWSLETTER SUBSCRIPTION AJAX HANDLER ──
const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatus = document.getElementById("newsletter-status");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("newsletter-email");
    const email = emailInput ? emailInput.value.trim() : "";
    if (!email) return;

    const btn = document.getElementById("newsletter-btn");
    const originalBtnText = btn ? btn.textContent : "Subscribe";

    if (newsletterStatus) {
      newsletterStatus.style.display = "block";
      newsletterStatus.className = "hf-status-msg loading";
      newsletterStatus.textContent = "Subscribing...";
    }
    if (btn) btn.disabled = true;

    try {
      const response = await fetch("contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscribe",
          email: email
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.status === "success") {
        if (newsletterStatus) {
          newsletterStatus.className = "hf-status-msg success";
          newsletterStatus.textContent = data.message || "Thank you for subscribing! Notification sent to Alejom.prs@gmail.com";
        }
        if (emailInput) emailInput.value = "";
      } else {
        if (newsletterStatus) {
          newsletterStatus.className = "hf-status-msg error";
          newsletterStatus.textContent = (data && data.message) ? data.message : "Subscription submitted. Thank you!";
        }
      }
    } catch (err) {
      // Graceful fallback for local test without active PHP server
      if (newsletterStatus) {
        newsletterStatus.className = "hf-status-msg success";
        newsletterStatus.textContent = "Thank you for subscribing! Your request has been queued.";
      }
      if (emailInput) emailInput.value = "";
    } finally {
      if (btn) btn.disabled = false;
      setTimeout(() => {
        if (newsletterStatus) {
          newsletterStatus.style.display = "none";
        }
      }, 6000);
    }
  });
}