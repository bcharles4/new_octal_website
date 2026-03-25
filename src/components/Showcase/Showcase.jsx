import { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Showcase.css';

gsap.registerPlugin(ScrollTrigger);

export default function Showcase() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      limitDeviceRatio: 1.5,
    });
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04, 0.06, 0.05, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.5, 8, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 4;
    camera.upperRadiusLimit = 14;
    camera.wheelDeltaPercentage = 0.01;

    // Lights
    const hemiLight = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.4;
    hemiLight.diffuse = new BABYLON.Color3(0.35, 0.63, 0.29);

    const pointLight = new BABYLON.PointLight('point', new BABYLON.Vector3(3, 4, 3), scene);
    pointLight.intensity = 2;
    pointLight.diffuse = new BABYLON.Color3(0.35, 0.63, 0.29);

    const pointLight2 = new BABYLON.PointLight('point2', new BABYLON.Vector3(-3, -2, -3), scene);
    pointLight2.intensity = 0.8;
    pointLight2.diffuse = new BABYLON.Color3(0.12, 0.34, 0.29);

    // Main material
    const mainMat = new BABYLON.StandardMaterial('mainMat', scene);
    mainMat.diffuseColor = new BABYLON.Color3(0.35, 0.63, 0.29);
    mainMat.specularColor = new BABYLON.Color3(0.6, 0.9, 0.6);
    mainMat.emissiveColor = new BABYLON.Color3(0.08, 0.18, 0.08);
    mainMat.specularPower = 64;

    // Central torus knot
    const torusKnot = BABYLON.MeshBuilder.CreateTorusKnot('knot', {
      radius: 1.2, tube: 0.35, radialSegments: 64, tubularSegments: 32,
    }, scene);
    torusKnot.material = mainMat;

    // Orbiting spheres
    const orbMat = new BABYLON.StandardMaterial('orbMat', scene);
    orbMat.diffuseColor = new BABYLON.Color3(0.15, 0.4, 0.18);
    orbMat.specularColor = new BABYLON.Color3(0.5, 0.8, 0.5);
    orbMat.emissiveColor = new BABYLON.Color3(0.04, 0.12, 0.05);

    const orbiters = [];
    for (let i = 0; i < 3; i++) {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`orb${i}`, { diameter: 0.25, segments: 12 }, scene);
      sphere.material = orbMat;
      orbiters.push({ mesh: sphere, angle: (i / 3) * Math.PI * 2, radius: 2.5 + Math.random() * 0.5, speed: 0.3 + Math.random() * 0.2, yOffset: (Math.random() - 0.5) * 1.5 });
    }

    // Wireframe ring
    const ring = BABYLON.MeshBuilder.CreateTorus('ring', { diameter: 5, thickness: 0.02, tessellation: 40 }, scene);
    const ringMat = new BABYLON.StandardMaterial('ringMat', scene);
    ringMat.emissiveColor = new BABYLON.Color3(0.35, 0.63, 0.29);
    ringMat.alpha = 0.3;
    ringMat.wireframe = true;
    ring.material = ringMat;

    // Animation loop
    let time = 0;
    scene.registerBeforeRender(() => {
      time += engine.getDeltaTime() * 0.001;
      torusKnot.rotation.y += 0.005;
      torusKnot.rotation.x += 0.002;
      ring.rotation.x = Math.sin(time * 0.5) * 0.3;
      ring.rotation.z += 0.003;

      orbiters.forEach((o) => {
        o.angle += o.speed * 0.01;
        o.mesh.position.x = Math.cos(o.angle) * o.radius;
        o.mesh.position.z = Math.sin(o.angle) * o.radius;
        o.mesh.position.y = Math.sin(time + o.angle) * 0.5 + o.yOffset;
      });
    });

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.showcase__header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo('.showcase__canvas-wrapper',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      );

      gsap.fromTo('.showcase__info-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.showcase__info', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="showcase" ref={sectionRef} className="showcase section">
      <div className="showcase__header">
        <h2 className="section-title">3D Technology Showcase</h2>
        <p className="section-subtitle" style={{ margin: '1rem auto 0', textAlign: 'center' }}>
          Explore our real-time 3D rendering capabilities powered by Babylon.js.
          Drag to rotate, scroll to zoom.
        </p>
      </div>

      <div className="showcase__canvas-wrapper">
        <canvas ref={canvasRef} className="showcase__canvas" />
        <div className="showcase__canvas-border" />
      </div>

      <div className="showcase__info">
        <div className="showcase__info-card glass-card">
          <div className="showcase__info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <h4>Real-Time Rendering</h4>
          <p>60fps WebGL rendering with dynamic materials and lighting</p>
        </div>
        <div className="showcase__info-card glass-card">
          <div className="showcase__info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="14" x2="18" y2="14"/></svg>
          </div>
          <h4>Interactive Controls</h4>
          <p>Full orbit camera controls with smooth physics-based interaction</p>
        </div>
        <div className="showcase__info-card glass-card">
          <div className="showcase__info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813h6.112l-4.968 3.587 1.912 5.813L12 14.626l-4.968 3.587 1.912-5.813L4 8.813h6.112z"/></svg>
          </div>
          <h4>Advanced Effects</h4>
          <p>Specular highlights, emissive glow, and shader effects in real-time</p>
        </div>
      </div>
    </section>
  );
}
