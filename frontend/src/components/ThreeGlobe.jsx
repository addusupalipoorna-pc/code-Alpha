import { useEffect, useRef } from 'react';

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return { x, y, z };
}

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

    const init = async () => {
      const threeModule = await import('three');
      THREE = threeModule.default || threeModule;
      const controlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
      const OrbitControls = controlsModule.OrbitControls || controlsModule.default;

      const mount = mountRef.current;
      if (!mount || disposed) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
      camera.position.set(0, 0, 260);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      mount.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(5, 3, 5);
      scene.add(dir);

      // earth texture (lazy loaded) — use smaller texture for faster load
      const loader = new THREE.TextureLoader();
      const texture = await new Promise((res) => loader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_512.jpg', res));

      // lower-poly globe for better performance on initial view
      const globeGeo = new THREE.SphereGeometry(100, 16, 16);
      const globeMat = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.03, roughness: 0.95 });
      globe = new THREE.Mesh(globeGeo, globeMat);
      globe.rotation.y = Math.PI / 6;
      scene.add(globe);

      // nodes and routes
      const nodeGroup = new THREE.Group();
      // use a very cheap material for marker dots to reduce shader cost
      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
      // limit nodes for performance on mobile/initial loads
      nodes.slice(0, 20).forEach((n) => {
        const { x, y, z } = latLonToVector3(n.lat, n.lon, 102);
        const dotGeo = new THREE.SphereGeometry(1.8, 6, 6);
        const dot = new THREE.Mesh(dotGeo, nodeMaterial);
        dot.position.set(x, y, z);
        dot.userData = { info: n.label || n.name || `${n.lat},${n.lon}` };
        nodeGroup.add(dot);
      });
      scene.add(nodeGroup);

      // simple routes demo: connect sequential nodes and add animated particles along routes
      const routeMat = new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2, transparent: true, opacity: 0.75 });
      // fewer routes with lower point density to reduce CPU/GPU work
      for (let i = 0; i < Math.min(8, nodes.length - 1); i += 1) {
        const a = latLonToVector3(nodes[i].lat, nodes[i].lon, 101);
        const b = latLonToVector3(nodes[i + 1].lat, nodes[i + 1].lon, 101);
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(a.x, a.y, a.z),
          new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 20, (a.z + b.z) / 2),
          new THREE.Vector3(b.x, b.y, b.z),
        ]);
        const pts = curve.getPoints(32);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, routeMat);
        scene.add(line);
      }

      // controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.minDistance = 140;
      controls.maxDistance = 420;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.25;

      // raycaster for hover tooltips
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMove = (ev) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeGroup.children, false);
        const tip = tooltipRef.current;
        if (intersects.length > 0) {
          const it = intersects[0].object;
          const content = it.userData.info || '';
          tip.style.display = 'block';
          tip.textContent = content;
          tip.style.left = `${ev.clientX + 14}px`;
          tip.style.top = `${ev.clientY + 14}px`;
        } else if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      };

      renderer.domElement.addEventListener('mousemove', onMove);

      // animate
      const animate = () => {
        globe.rotation.y += 0.0009;
        nodeGroup.rotation.y += 0.0009;

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
      <div className="three-globe h-96 w-full rounded-xl overflow-hidden glass-card p-2" ref={mountRef} />
      <div ref={tooltipRef} className="absolute z-50 pointer-events-none bg-black/70 text-white text-xs py-1 px-2 rounded" style={{ display: 'none', transform: 'translate3d(0,0,0)' }} />
    </div>
  );
}
