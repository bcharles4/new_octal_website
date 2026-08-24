import { useEffect } from 'react';
import ReflectiveCard from '../ReflectiveCard/ReflectiveCard';
import './AccessGate.css';

/* Shown once immediately after sign-in. Any click, tap, or key press dismisses
   it into the dashboard. */
export default function AccessGate({ onProceed }) {
  useEffect(() => {
    const onKey = () => onProceed();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onProceed]);

  return (
    <div
      className="access-gate"
      onClick={onProceed}
      role="button"
      tabIndex={0}
      aria-label="Click anywhere to proceed to the dashboard"
    >
      <div className="access-gate__card">
        <ReflectiveCard
          name="Charles Brian Mitra"
          role="Full Stack Developer"
          employeeNumber="2120585"
          hint="Click anywhere to proceed on Dashboard"
          overlayColor="rgba(6, 12, 8, 0.45)"
          blurStrength={10}
          glassDistortion={15}
          metalness={0.8}
          roughness={0.5}
          displacementStrength={25}
          noiseScale={1.5}
          specularConstant={2.0}
          grayscale={0.5}
          color="#ffffff"
        />
      </div>
    </div>
  );
}
