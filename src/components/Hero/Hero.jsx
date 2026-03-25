import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import gsap from 'gsap';
import './Hero.css';

/* Animated particle field */
function ParticleField() {
  const meshRef = useRef();
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#59a14a');
    const accentColor = new THREE.Color('#8adb7a');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const c = Math.random() > 0.5 ? baseColor : accentColor;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/* Glowing octahedron */
function GlowOctahedron({ onSecretClick }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} onClick={onSecretClick}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#59a14a"
          emissive="#59a14a"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

/* DNA Helix Lines — geometries pre-built once */
function HelixLines() {
  const groupRef = useRef();
  const lineCount = 30;

  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < lineCount; i++) {
      const t = (i / lineCount) * Math.PI * 4;
      const x1 = Math.cos(t) * 3;
      const z1 = Math.sin(t) * 3;
      const x2 = Math.cos(t + Math.PI) * 3;
      const z2 = Math.sin(t + Math.PI) * 3;
      const y = (i / lineCount) * 10 - 5;

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
      ]);
      result.push({ geometry, opacity: 0.1 + (i / lineCount) * 0.15 });
    }
    return result;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, -5]}>
      {lines.map((l, i) => (
        <line key={i} geometry={l.geometry}>
          <lineBasicMaterial color="#59a14a" transparent opacity={l.opacity} />
        </line>
      ))}
    </group>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const tagRef = useRef(null);
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleSecretClick = () => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      navigate('/admin/login');
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 3000);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.3 });

    tl.fromTo(tagRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo(headingRef.current,
      { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power4.out' },
      '-=0.3'
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    );

    return () => tl.kill();
  }, []);

  return (
    <section id="home" ref={sectionRef} className="hero">
      <div className="hero__canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#59a14a" />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color="#1e5649" />
          <ParticleField />
          <GlowOctahedron onSecretClick={handleSecretClick} />
          <HelixLines />
          <Stars radius={50} depth={80} count={500} factor={3} saturation={0.2} fade speed={0.5} />
        </Canvas>
      </div>

      <div className="hero__content">
        <div ref={tagRef} className="hero__tag">
          <span className="hero__tag-dot" />
          Building Futures Together
        </div>
        <h1 ref={headingRef} className="hero__title">
          Octal<br />
          <span className="hero__title-highlight">Philippines</span><br />
        Inc.
        </h1>
        <p ref={subRef} className="hero__subtitle">
          We don’t just deliver solutions — we build partnerships. Our commitment is to help organizations harness technology, empower people, and achieve measurable results that last.
        </p>
        <div ref={ctaRef} className="hero__cta">
          <button className="btn-primary" onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Solutions
          </button>
          <button className="btn-outline" onClick={() => document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' })}>
            Let's Connect
          </button>
        </div>
      </div>

      <div className="hero__scroll-indicator">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
