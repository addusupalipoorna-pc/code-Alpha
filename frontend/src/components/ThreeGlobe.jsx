import { useEffect, useRef } from 'react';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return { x, y, z };
}

function createCyberneticEarthTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Stylized continents path
  const paths = [];

  // North America
  const na = new Path2D();
  na.moveTo(120, 80);
  na.lineTo(380, 80);
  na.lineTo(360, 160);
  na.lineTo(280, 220);
  na.lineTo(260, 250);
  na.lineTo(240, 270);
  na.lineTo(210, 240);
  na.lineTo(190, 180);
  na.closePath();
  paths.push(na);

  // Greenland
  const gl = new Path2D();
  gl.moveTo(330, 40);
  gl.lineTo(410, 40);
  gl.lineTo(370, 100);
  gl.closePath();
  paths.push(gl);

  // South America
  const sa = new Path2D();
  sa.moveTo(270, 260);
  sa.lineTo(340, 280);
  sa.lineTo(320, 440);
  sa.lineTo(290, 450);
  sa.lineTo(260, 360);
  sa.closePath();
  paths.push(sa);

  // Europe & Asia
  const eu = new Path2D();
  eu.moveTo(460, 70);
  eu.lineTo(950, 70);
  eu.lineTo(920, 280);
  eu.lineTo(820, 310);
  eu.lineTo(760, 290);
  eu.lineTo(730, 260);
  eu.lineTo(600, 240);
  eu.lineTo(520, 250);
  eu.lineTo(450, 180);
  eu.closePath();
  paths.push(eu);

  // Africa
  const af = new Path2D();
  af.moveTo(460, 250);
  af.lineTo(590, 250);
  af.lineTo(600, 300);
  af.lineTo(580, 350);
  af.lineTo(520, 420);
  af.lineTo(480, 330);
  af.closePath();
  paths.push(af);

  // Australia
  const au = new Path2D();
  au.moveTo(780, 320);
  au.lineTo(880, 330);
  au.lineTo(870, 390);
  au.lineTo(790, 380);
  au.closePath();
  paths.push(au);

  // Fill continents with neon cyan grid dots
  ctx.fillStyle = 'rgba(34, 211, 238, 0.95)';
  const dotSpacing = 8;
  for (let x = 0; x < canvas.width; x += dotSpacing) {
    for (let y = 0; y < canvas.height; y += dotSpacing) {
      let isLand = false;
      for (const path of paths) {
        if (ctx.isPointInPath(path, x, y)) {
          isLand = true;
          break;
        }
      }
      if (isLand) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const defaultNodes = [
  { lat: 40.7128, lon: -74.0060, label: 'New York (US)' },
  { lat: 51.5074, lon: -0.1278, label: 'London (UK)' },
  { lat: 48.8566, lon: 2.3522, label: 'Paris (FR)' },
  { lat: 35.6762, lon: 139.6503, label: 'Tokyo (JP)' },
  { lat: -33.8688, lon: 151.2093, label: 'Sydney (AU)' },
  { lat: 19.0760, lon: 72.8777, label: 'Mumbai (IN)' },
  { lat: -23.5505, lon: -46.6333, label: 'São Paulo (BR)' },
  { lat: 30.0444, lon: 31.2357, label: 'Cairo (EG)' }
];

export default function ThreeGlobe({ nodes = [] }) {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = null;
    let THREE;
    let req;
    let renderer;
    let scene;
    let camera;
    let globe;
    let starField;

    const activeNodes = nodes && nodes.length > 0 ? nodes : defaultNodes;

    const init = async () => {
      const threeModule = await import('three');
      THREE = threeModule.default || threeModule;
      const controlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
      const OrbitControls = controlsModule.OrbitControls || controlsModule.default;

      const mount = mountRef.current;
      if (!mount || disposed) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
      camera.position.set(0, 0, 250);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      mount.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 3, 5);
      scene.add(dir);

      // Starfield background
      const starGeo = new THREE.BufferGeometry();
      const starsCount = 200;
      const starPos = new Float32Array(starsCount * 3);
      for (let i = 0; i < starsCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 180 + Math.random() * 100;
        starPos[i] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i + 2] = r * Math.cos(phi);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0x8af7ff,
        size: 1.2,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      });
      starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // Main globe group
      globe = new THREE.Group();

      // Outer globe mesh with canvas map
      const texture = createCyberneticEarthTexture(THREE);
      const globeGeo = new THREE.SphereGeometry(100, 32, 32);
      const globeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const outerGlobe = new THREE.Mesh(globeGeo, globeMat);
      globe.add(outerGlobe);

      // Inner sphere for back-face dots hiding (deeper dark base)
      const innerGeo = new THREE.SphereGeometry(98.8, 32, 32);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x020206,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95
      });
      const innerSphere = new THREE.Mesh(innerGeo, innerMat);
      globe.add(innerSphere);

      // Glowing futuristic wireframe grid overlay
      const gridGeo = new THREE.SphereGeometry(99.2, 24, 24);
      const gridMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      });
      const gridMesh = new THREE.Mesh(gridGeo, gridMat);
      globe.add(gridMesh);

      // Dual Atmospheric Glow Envelopes (halo effect)
      const glowGeo1 = new THREE.SphereGeometry(103, 32, 32);
      const glowMat1 = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      const glowMesh1 = new THREE.Mesh(glowGeo1, glowMat1);
      globe.add(glowMesh1);

      const glowGeo2 = new THREE.SphereGeometry(105, 32, 32);
      const glowMat2 = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
      });
      const glowMesh2 = new THREE.Mesh(glowGeo2, glowMat2);
      globe.add(glowMesh2);

      scene.add(globe);

      // nodes group
      const nodeGroup = new THREE.Group();
      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x34d399 });

      activeNodes.forEach((n) => {
        const { x, y, z } = latLonToVector3(n.lat, n.lon, 101);
        const dotGeo = new THREE.SphereGeometry(3, 12, 12);
        const dot = new THREE.Mesh(dotGeo, nodeMaterial);
        dot.position.set(x, y, z);
        dot.userData = { info: n.label || n.name || `${n.lat},${n.lon}` };
        nodeGroup.add(dot);
      });
      globe.add(nodeGroup);

      // connections
      const routeMat = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6 });
      const routeParticles = [];
      const particleGeo = new THREE.SphereGeometry(1.8, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

      for (let i = 0; i < Math.min(8, activeNodes.length - 1); i += 1) {
        const a = latLonToVector3(activeNodes[i].lat, activeNodes[i].lon, 101);
        const b = latLonToVector3(activeNodes[i + 1].lat, activeNodes[i + 1].lon, 101);

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3((a.x + b.x) / 2 * 1.15, (a.y + b.y) / 2 * 1.15 + 12, (a.z + b.z) / 2 * 1.15),
          new THREE.Vector3(b.x, b.y, b.z),
        ]);
        const pts = curve.getPoints(32);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, routeMat);
        globe.add(line);

        const pMesh = new THREE.Mesh(particleGeo, particleMat);
        globe.add(pMesh);
        routeParticles.push({
          curve,
          mesh: pMesh,
          speed: 0.4 + Math.random() * 0.4,
          progress: Math.random()
        });
      }

      // controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.minDistance = 140;
      controls.maxDistance = 420;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMove = (ev) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeGroup.children, false);
        const tip = tooltipRef.current;
        if (intersects.length > 0 && tip) {
          const it = intersects[0].object;
          tip.style.display = 'block';
          tip.textContent = it.userData.info || '';
          tip.style.left = `${ev.clientX + 14}px`;
          tip.style.top = `${ev.clientY + 14}px`;
        } else if (tip) {
          tip.style.display = 'none';
        }
      };

      renderer.domElement.addEventListener('mousemove', onMove);

      const animate = () => {
        globe.rotation.y += 0.0016;
        if (starField) {
          starField.rotation.y -= 0.0003;
        }

        routeParticles.forEach(rp => {
          rp.progress += 0.004 * rp.speed;
          if (rp.progress > 1) rp.progress = 0;
          const pos = rp.curve.getPointAt(rp.progress);
          rp.mesh.position.copy(pos);
        });

        controls.update();
        renderer.render(scene, camera);
        req = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        cancelAnimationFrame(req);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('mousemove', onMove);
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        texture.dispose();
      };
      if (disposed) cleanup();
    };

    init();

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, [nodes]);

  return (
    <div className="relative">
      <div className="three-globe h-[380px] w-full rounded-2xl overflow-hidden glass-card p-1" ref={mountRef} />
      <div ref={tooltipRef} className="absolute z-50 pointer-events-none bg-black/90 text-slate-100 text-xs py-1.5 px-3 rounded-lg border border-white/10 shadow-xl" style={{ display: 'none', transform: 'translate3d(0,0,0)' }} />
    </div>
  );
}
