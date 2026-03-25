import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../../assets/img/octal-logo-withText.png';
import './Footer.css';

function ParticleField() {
  const meshRef = useRef();
  const count = 600;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const base = new THREE.Color('#59a14a');
    const accent = new THREE.Color('#8adb7a');
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const c = Math.random() > 0.5 ? base : accent;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
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

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__bg">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#59a14a" />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color="#1e5649" />
          <ParticleField />
          <Stars radius={50} depth={80} count={400} factor={3} saturation={0.2} fade speed={0.5} />
        </Canvas>
      </div>

      <div className="footer__content">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo">
              <img src={logo} alt="Octal Philippines Inc." className="footer__logo-img" />
            </div>
            <p className="footer__tagline">
              Building Futures Together.
            </p>
          </div>

          <div className="footer__links">
            <div className="footer__col">
              <h4>Navigation</h4>
              <a href="/#home">Home</a>
              <a href="/#about">About Us</a>
              <a href="/#solutions">Solutions</a>
              <a href="/#connect">Let's Connect</a>
              <a href="/#insights">Insights</a>
              <a href="/#jobs">Find a Job</a>
            </div>
            <div className="footer__col">
              <h4>Solutions</h4>
              <a href="/#solutions">IT Staffing Solutions</a>
              <a href="/#solutions">BLISS Infrastructure</a>
              <a href="/#solutions">Software Services</a>
            </div>
            <div className="footer__col">
              <h4>Connect</h4>
              <a href="/#connect">LinkedIn</a>
              <a href="/#connect">GitHub</a>
              <a href="/#connect">Twitter</a>
              <a href="/#connect">Facebook</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} OCTAL PHILIPPINES INC. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="/#home">Privacy Policy</a>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
