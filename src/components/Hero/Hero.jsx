import { useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import gsap from 'gsap';
import CardSwap, { Card } from '../CardSwap/CardSwap';
import './Hero.css';

/* Animated particle field — cursor-reactive */
function ParticleField() {
  const meshRef = useRef();
  const count = 800;
  const { pointer, camera } = useThree();

  const isInteractiveRef = useRef(false);
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isInteractiveRef.current = !isTouch && !prefersReduced;
  }, []);

  const [positions, originalColors] = useMemo(() => {
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

  const workingColors = useMemo(() => new Float32Array(originalColors), [originalColors]);
  const localCursor = useMemo(() => new THREE.Vector3(), []);
  const worldCursor = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const cursorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  useFrame((state) => {
    if (!meshRef.current) return; 
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;

    if (!isInteractiveRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(cursorPlane, worldCursor)) return;

    localCursor.copy(worldCursor);
    meshRef.current.worldToLocal(localCursor);

    const colorAttr = meshRef.current.geometry.attributes.color;
    const RADIUS = 3.2;
    const RADIUS_SQ = RADIUS * RADIUS;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const dx = positions[i3] - localCursor.x;
      const dy = positions[i3 + 1] - localCursor.y;
      const dz = positions[i3 + 2] - localCursor.z;
      const distSq = dx * dx + dy * dy + dz * dz;


      if (distSq < RADIUS_SQ) {
        const boost = 1 - Math.sqrt(distSq) / RADIUS;
        colorAttr.array[i3] = Math.min(1, originalColors[i3] + boost * 0.7);
        colorAttr.array[i3 + 1] = Math.min(1, originalColors[i3 + 1] + boost * 0.7);
        colorAttr.array[i3 + 2] = Math.min(1, originalColors[i3 + 2] + boost * 0.7);
      } else {
        colorAttr.array[i3] = originalColors[i3];
        colorAttr.array[i3 + 1] = originalColors[i3 + 1];
        colorAttr.array[i3 + 2] = originalColors[i3 + 2];
      }
    }
    colorAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={workingColors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/* Shared by both hero CTAs: each button stacks two of these so one can leave
   while its twin arrives, which reads as travel rather than a slide. */
const ArrowGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/* Glowing octahedron — centered. Click it 8 times to reach admin login. It
   deliberately gives no hover cue: a pointer cursor would advertise that the
   shape is clickable, and the whole point is that nobody finds it by accident. */
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
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSecretClick(); }}
      >
        <octahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#59a14a"
          emissive="#59a14a"
          emissiveIntensity={0.45}
          wireframe
          transparent
          opacity={0.65}
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
    const result = [];    for (let i = 0; i < lineCount; i++) {
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

    </group>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const titleInnerRef = useRef(null);
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const [cardSize, setCardSize] = useState({ width: 380, height: 260, cardDistance: 50, verticalDistance: 55 });

  useEffect(() => {
    const updateCardSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setCardSize({ width: 255, height: 180, cardDistance: 32, verticalDistance: 38 });
      } else if (width <= 768) {
        setCardSize({ width: 300, height: 210, cardDistance: 40, verticalDistance: 45 });
      } else {
        setCardSize({ width: 380, height: 260, cardDistance: 50, verticalDistance: 55 });
      }
    };

    updateCardSize();
    window.addEventListener('resize', updateCardSize);
    return () => window.removeEventListener('resize', updateCardSize);
  }, []);

  /* Feeds the spotlight in Hero.css. The label and icon are pointer-transparent,
     so the event target is always the button itself and offsetX/offsetY are
     already button-relative — no getBoundingClientRect on every move. */
  const trackCta = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    event.currentTarget.style.setProperty('--mx', `${offsetX}px`);
    event.currentTarget.style.setProperty('--my', `${offsetY}px`);
  };

  const handleSecretClick = () => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 8) {
      clickCountRef.current = 0;
      navigate('/admin/login');
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 3000);
    }
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set([subRef.current, ctaRef.current], { opacity: 1, y: 0 });
        gsap.set(titleInnerRef.current, { yPercent: 0, clipPath: 'inset(0% 0 0 0)' });
        return;
      }

      const tl = gsap.timeline({ delay: 2.3 });

      tl.fromTo(titleInnerRef.current,
        { yPercent: 110, clipPath: 'inset(100% 0 0 0)' },
        { yPercent: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.05, ease: 'expo.out' }
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={sectionRef} className="hero" aria-labelledby="hero-title">
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

      <div className="hero__container">
      <div className="hero__content">
        {/* TEXT COLUMN */}
        <h1 id="hero-title" ref={headingRef} className="hero__title">
          <span className="hero__title-line">
            <span ref={titleInnerRef} className="hero__title-inner">
             Your Strategic Partner for <span className="hero__title-highlight">Growth & Innovation</span>
            </span>
          </span>
        </h1>
        <p ref={subRef} className="hero__subtitle">
          We don’t just deliver solutions — we build partnerships. Our commitment is to help organizations harness technology, empower people, and achieve measurable results that last.
        </p>
        <div ref={ctaRef} className="hero__cta">
          <Link
            className="hero-cta hero-cta--primary"
            to="/solutions"
            onPointerMove={trackCta}
          >
            <span className="hero-cta__label">Explore Solutions</span>
            <span className="hero-cta__icon" aria-hidden="true">
              <ArrowGlyph />
              <ArrowGlyph />
            </span>
          </Link>
          <button
            type="button"
            className="hero-cta hero-cta--ghost"
            onPointerMove={trackCta}
            onClick={() =>
              document
                .getElementById('connect')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span className="hero-cta__label">Contact Us</span>
            <span className="hero-cta__icon" aria-hidden="true">
              <ArrowGlyph />
              <ArrowGlyph />
            </span>
          </button>
        </div>
      </div>

      {/* MIDDLE COLUMN — reserved space so the octahedron (rendered in the
          full-hero canvas above) sits at the visual center between text
          and cards without either side crowding it. */}
      <div className="hero__spacer" aria-hidden="true" />

      {/* RIGHT COLUMN — motivational quote card stack (CardSwap) */}
      <div className="hero__cards">
        <CardSwap
          width={cardSize.width}
          height={cardSize.height}
          cardDistance={cardSize.cardDistance}
          verticalDistance={cardSize.verticalDistance}
          delay={4500}
          pauseOnHover
          skewAmount={5}
          easing="elastic"
        >
          <Card>
            <div className="hero-card__body">
              <span className="hero-card__eyebrow">Engineering</span>
              <h3 className="hero-card__title">Craft Over Code</h3>
              <p className="hero-card__quote">
                "We don't just write code — we architect solutions that
                grow with your vision."
              </p>
            </div>
          </Card>
          <Card>
            <div className="hero-card__body">
              <span className="hero-card__eyebrow">Talent</span>
              <h3 className="hero-card__title">Right People, Right Outcomes</h3>
              <p className="hero-card__quote">
                "The right people don't just fill roles — they redefine
                what's possible."
              </p>
            </div>
          </Card>
          <Card>
            <div className="hero-card__body">
              <span className="hero-card__eyebrow">Partnership</span>
              <h3 className="hero-card__title">Built on Trust</h3>
              <p className="hero-card__quote">
                "Every project is a partnership. Every solution, a shared
                success."
              </p>
            </div>
          </Card>
        </CardSwap>
      </div>
      </div>

      <button
        type="button"
        className="hero__scroll-indicator"
        onClick={() => document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Scroll to insights"
      >
        <div className="hero__scroll-line" aria-hidden="true" />
      </button>
    </section>
  );
}
