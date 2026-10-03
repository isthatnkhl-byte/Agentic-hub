import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Sparkles, Sun, Moon, Zap, Layers } from 'lucide-react';

interface ThreeShoeViewerProps {
  upperColor: string;
  soleColor: string;
  accentColor: string;
  lacesColor: string;
  cushionColor?: string;
  materialFinish?: 'matte' | 'gloss' | 'metallic' | 'carbon';
  interactiveHotspots?: boolean;
  className?: string;
  autoRotateDefault?: boolean;
}

export const ThreeShoeViewer: React.FC<ThreeShoeViewerProps> = ({
  upperColor,
  soleColor,
  accentColor,
  lacesColor,
  cushionColor = '#10b981',
  materialFinish = 'matte',
  interactiveHotspots = true,
  className = 'h-96 w-full',
  autoRotateDefault = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState<boolean>(autoRotateDefault);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<'cyber' | 'studio' | 'sunset'>('cyber');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // References to keep Three.js meshes and materials updated without full re-render
  const materialsRef = useRef<{
    upper?: THREE.MeshStandardMaterial;
    sole?: THREE.MeshStandardMaterial;
    accent?: THREE.MeshStandardMaterial;
    laces?: THREE.MeshStandardMaterial;
    cushion?: THREE.MeshPhysicalMaterial;
    carbon?: THREE.MeshStandardMaterial;
  }>({});

  const shoeGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{
    ambient?: THREE.AmbientLight;
    main?: THREE.DirectionalLight;
    point1?: THREE.PointLight;
    point2?: THREE.PointLight;
  }>({});

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent background to blend with modern dark card

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.8, 1.8, 4.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    // 4. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 3, 10);
    pointLight1.position.set(-3, 2, -2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2.5, 10);
    pointLight2.position.set(3, -1, 3);
    scene.add(pointLight2);

    lightsRef.current = {
      ambient: ambientLight,
      main: mainLight,
      point1: pointLight1,
      point2: pointLight2,
    };

    // 5. Materials setup
    const getFinishParams = (finish: string) => {
      switch (finish) {
        case 'gloss':
          return { roughness: 0.15, metalness: 0.2 };
        case 'metallic':
          return { roughness: 0.25, metalness: 0.85 };
        case 'carbon':
          return { roughness: 0.35, metalness: 0.65 };
        case 'matte':
        default:
          return { roughness: 0.75, metalness: 0.05 };
      }
    };

    const finishProps = getFinishParams(materialFinish);

    const upperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(upperColor),
      roughness: finishProps.roughness,
      metalness: finishProps.metalness,
      wireframe: false,
    });

    const soleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(soleColor),
      roughness: 0.85,
      metalness: 0.05,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.2,
      metalness: 0.7,
    });

    const lacesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(lacesColor),
      roughness: 0.9,
      metalness: 0.0,
    });

    const cushionMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(cushionColor),
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.45,
      emissive: new THREE.Color(cushionColor),
      emissiveIntensity: 0.3,
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.3,
      metalness: 0.8,
    });

    materialsRef.current = {
      upper: upperMat,
      sole: soleMat,
      accent: accentMat,
      laces: lacesMat,
      cushion: cushionMat,
      carbon: carbonMat,
    };

    // 6. Build High-End Procedural Sneaker Model
    const shoeGroup = new THREE.Group();

    // A. SOLE (Midsole + Outsole)
    // Curvature with bezier-like extrusion
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-1.6, 0);
    soleShape.lineTo(1.8, 0);
    soleShape.bezierCurveTo(2.1, 0.1, 2.2, 0.4, 2.0, 0.5);
    soleShape.lineTo(-1.6, 0.45);
    soleShape.bezierCurveTo(-1.8, 0.4, -1.8, 0.1, -1.6, 0);

    const extrudeSettings = {
      steps: 2,
      depth: 1.1,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const soleGeo = new THREE.ExtrudeGeometry(soleShape, extrudeSettings);
    soleGeo.center();
    const soleMesh = new THREE.Mesh(soleGeo, soleMat);
    soleMesh.position.set(0, -0.45, 0);
    soleMesh.castShadow = true;
    soleMesh.receiveShadow = true;
    shoeGroup.add(soleMesh);

    // Tread lines under sole
    for (let i = -1.2; i <= 1.4; i += 0.35) {
      const treadGeo = new THREE.BoxGeometry(0.12, 0.06, 0.95);
      const treadMesh = new THREE.Mesh(treadGeo, soleMat);
      treadMesh.position.set(i, -0.72, 0);
      shoeGroup.add(treadMesh);
    }

    // B. NITROGEN AIR CUSHION / ZOOM POD (Translucent heel chamber)
    const cushionGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.28, 24);
    cushionGeo.rotateZ(Math.PI / 2);
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.position.set(-0.95, -0.38, 0);
    shoeGroup.add(cushionMesh);

    // C. CARBON PROPULSION PLATE (Midsole bridge)
    const carbonGeo = new THREE.BoxGeometry(1.4, 0.04, 0.7);
    const carbonMesh = new THREE.Mesh(carbonGeo, carbonMat);
    carbonMesh.position.set(0.1, -0.28, 0);
    shoeGroup.add(carbonMesh);

    // D. MAIN UPPER (AeroWeave knit shell)
    const upperGeo = new THREE.CylinderGeometry(0.65, 0.85, 2.7, 32, 16);
    upperGeo.rotateZ(Math.PI / 2);
    upperGeo.scale(1.0, 0.6, 0.75);
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.set(0.15, 0.1, 0);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    shoeGroup.add(upperMesh);

    // E. TOE CAP (Sleek aerodynamic forefoot taper)
    const toeGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    toeGeo.scale(1.2, 0.5, 0.9);
    const toeMesh = new THREE.Mesh(toeGeo, upperMat);
    toeMesh.position.set(1.4, -0.15, 0);
    toeMesh.rotation.z = -0.15;
    shoeGroup.add(toeMesh);

    // F. COLLAR & ANKLE OPENING (Ergonomic heel counter)
    const collarGeo = new THREE.TorusGeometry(0.42, 0.12, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    collarGeo.scale(1.1, 1.4, 1.0);
    const collarMesh = new THREE.Mesh(collarGeo, upperMat);
    collarMesh.position.set(-0.75, 0.55, 0);
    shoeGroup.add(collarMesh);

    // Heel Tab
    const heelTabGeo = new THREE.BoxGeometry(0.1, 0.35, 0.15);
    const heelTab = new THREE.Mesh(heelTabGeo, accentMat);
    heelTab.position.set(-1.3, 0.65, 0);
    shoeGroup.add(heelTab);

    // G. TONGUE
    const tongueGeo = new THREE.BoxGeometry(1.1, 0.12, 0.45);
    tongueGeo.rotateZ(0.45);
    const tongueMesh = new THREE.Mesh(tongueGeo, upperMat);
    tongueMesh.position.set(-0.15, 0.5, 0);
    shoeGroup.add(tongueMesh);

    // H. DYNAMIC LACES
    for (let i = 0; i < 4; i++) {
      const laceGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.46, 12);
      laceGeo.rotateX(Math.PI / 2);
      const laceMesh = new THREE.Mesh(laceGeo, lacesMat);
      laceMesh.position.set(0.15 + i * 0.28, 0.35 - i * 0.08, 0);
      laceMesh.rotation.y = (i % 2 === 0 ? 0.25 : -0.25);
      shoeGroup.add(laceMesh);
    }

    // I. AERODYNAMIC BRAND "STRIDE BOLT / SWOOSH" ACCENT (On both flanks)
    const createAccentWing = (zOffset: number, flipY: boolean) => {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(1.2, 0.25);
      wingShape.lineTo(0.9, 0.08);
      wingShape.lineTo(-0.8, -0.22);
      wingShape.closePath();

      const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
      });

      const wingMesh = new THREE.Mesh(wingExtrude, accentMat);
      wingMesh.position.set(0.05, 0.15, zOffset);
      if (flipY) wingMesh.scale.set(1, 1, -1);
      return wingMesh;
    };

    shoeGroup.add(createAccentWing(0.46, false));
    shoeGroup.add(createAccentWing(-0.46, true));

    // Floor Reflection Grid / Shadow Disc
    const floorGeo = new THREE.CircleGeometry(2.4, 32);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.4,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.78;
    shoeGroup.add(floorMesh);

    // Add whole shoe group to scene
    shoeGroup.position.set(0, 0, 0);
    shoeGroup.rotation.y = Math.PI / 5;
    scene.add(shoeGroup);
    shoeGroupRef.current = shoeGroup;

    // 7. Interactive Mouse / Touch Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !shoeGroupRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      shoeGroupRef.current.rotation.y += deltaX * 0.01;
      shoeGroupRef.current.rotation.x += deltaY * 0.005;

      // Limit pitch
      shoeGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, shoeGroupRef.current.rotation.x));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      camera.position.z = Math.max(2.5, Math.min(6.5, camera.position.z));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // 8. Resize Listener
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle breathing float animation
      if (shoeGroupRef.current) {
        shoeGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

        if (isRotating && !isDragging) {
          shoeGroupRef.current.rotation.y += 0.006;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handlePointerDown);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);

      renderer.dispose();
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update dynamic colors and materials when props change
  useEffect(() => {
    if (materialsRef.current.upper) {
      materialsRef.current.upper.color.set(upperColor);
    }
    if (materialsRef.current.sole) {
      materialsRef.current.sole.color.set(soleColor);
    }
    if (materialsRef.current.accent) {
      materialsRef.current.accent.color.set(accentColor);
    }
    if (materialsRef.current.laces) {
      materialsRef.current.laces.color.set(lacesColor);
    }
    if (materialsRef.current.cushion) {
      materialsRef.current.cushion.color.set(cushionColor);
      materialsRef.current.cushion.emissive.set(cushionColor);
    }
  }, [upperColor, soleColor, accentColor, lacesColor, cushionColor]);

  // Update Wireframe mode
  useEffect(() => {
    Object.values(materialsRef.current).forEach((mat) => {
      if (mat) mat.wireframe = wireframe;
    });
  }, [wireframe]);

  // Update lighting theme
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights.ambient || !lights.point1 || !lights.point2) return;

    if (lightingPreset === 'cyber') {
      lights.ambient.color.set(0xffffff);
      lights.ambient.intensity = 1.2;
      lights.point1.color.set(0x06b6d4); // cyan
      lights.point2.color.set(0xec4899); // neon pink
    } else if (lightingPreset === 'studio') {
      lights.ambient.color.set(0xf8fafc);
      lights.ambient.intensity = 1.8;
      lights.point1.color.set(0xffffff);
      lights.point2.color.set(0xe2e8f0);
    } else if (lightingPreset === 'sunset') {
      lights.ambient.color.set(0xffedd5);
      lights.ambient.intensity = 1.1;
      lights.point1.color.set(0xf97316); // orange
      lights.point2.color.set(0x7c3aed); // violet
    }
  }, [lightingPreset]);

  const resetView = () => {
    if (shoeGroupRef.current) {
      shoeGroupRef.current.rotation.set(0, Math.PI / 5, 0);
      shoeGroupRef.current.position.set(0, 0, 0);
    }
  };

  return (
    <div className={`relative select-none overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-slate-800/80 shadow-2xl ${className}`}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control Overlay Buttons */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full backdrop-blur-md transition-all ${
            isRotating
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60'
          }`}
          title="Toggle 360 Auto-Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          {isRotating ? 'Rotating' : 'Paused'}
        </button>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full backdrop-blur-md transition-all ${
            wireframe
              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60'
          }`}
          title="Toggle 3D Wireframe Mesh Topology"
        >
          <Layers className="w-3.5 h-3.5" />
          {wireframe ? 'Mesh Grid' : 'Shaded'}
        </button>

        <button
          type="button"
          onClick={resetView}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60 backdrop-blur-md transition-all"
          title="Reset Camera Angle"
        >
          <Eye className="w-3.5 h-3.5" />
          Reset Angle
        </button>
      </div>

      {/* Lighting Presets */}
      <div className="absolute top-4 right-4 flex items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-800/80 z-10">
        <button
          type="button"
          onClick={() => setLightingPreset('cyber')}
          className={`p-1.5 rounded-full transition-all ${lightingPreset === 'cyber' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          title="Cyberpunk Neon Studio"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setLightingPreset('studio')}
          className={`p-1.5 rounded-full transition-all ${lightingPreset === 'studio' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
          title="Neutral Clean Studio Light"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setLightingPreset('sunset')}
          className={`p-1.5 rounded-full transition-all ${lightingPreset === 'sunset' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
          title="Sunset Warm Glow"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Hotspot Pills */}
      {interactiveHotspots && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'nitrogen' ? null : 'nitrogen')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all backdrop-blur-md border ${
                activeHotspot === 'nitrogen'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Nitrogen Pod
            </button>

            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'plate' ? null : 'plate')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all backdrop-blur-md border ${
                activeHotspot === 'plate'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Carbon Blade
            </button>

            <button
              type="button"
              onClick={() => setActiveHotspot(activeHotspot === 'mesh' ? null : 'mesh')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all backdrop-blur-md border ${
                activeHotspot === 'mesh'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              VaporWeave
            </button>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-800">
            🖱️ Drag to rotate • Scroll to zoom
          </div>
        </div>
      )}

      {/* Hotspot Info Tooltip */}
      {activeHotspot && (
        <div className="absolute top-16 left-6 max-w-xs p-3.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-20 animate-fadeIn">
          {activeHotspot === 'nitrogen' && (
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                42mm Supercritical Nitrogen Chamber
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Infused with gaseous nitrogen under 85 PSI pressure. Delivers 88% mechanical energy return with zero foam compaction over 1,000 miles.
              </p>
            </div>
          )}
          {activeHotspot === 'plate' && (
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
                <Zap className="w-3.5 h-3.5" />
                Full-Length 3K Carbon Torsion Blade
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Engineered with an aggressive spoon curve geometry. Accelerates toe-off propulsion by 4.2% while stabilizing foot strike alignment.
              </p>
            </div>
          )}
          {activeHotspot === 'mesh' && (
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                VaporWeave Circular Monofilament Upper
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hydrophobic yarn absorbs less than 0.1% moisture during rain or perspiration. High tensile strength keeps foot locked to the chassis.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
