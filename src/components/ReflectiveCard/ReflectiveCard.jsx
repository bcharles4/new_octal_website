import { useEffect, useRef, useState } from 'react';
import './ReflectiveCard.css';
import { Fingerprint, Activity, Lock } from 'lucide-react';

/* The metallic sheen on this card is a live webcam feed pushed through an SVG
   displacement filter. Cameras get denied, blocked by policy, or simply not
   exist, so `reflectionReady` falls back to an animated gradient that runs
   through the same filter chain — the card still reads as brushed metal. */
const ReflectiveCard = ({
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.1)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  name = 'ALEXANDER DOE',
  role = 'SENIOR DEVELOPER',
  employeeNumber = '8901-2345-6789',
  hint = '',
  enableReflection = true,
  className = '',
  style = {}
}) => {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const reflectionReady = enableReflection && cameraReady;

  useEffect(() => {
    if (!enableReflection) return undefined;

    let stream = null;
    let canceled = false;

    const startWebcam = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        /* Unmounting mid-request would otherwise leave the camera light on. */
        if (canceled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch {
        if (!canceled) setCameraReady(false);
      }
    };

    startWebcam();

    return () => {
      canceled = true;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enableReflection]);

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
  const saturation = 1 - Math.max(0, Math.min(1, grayscale));

  const cssVariables = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
    '--saturation': saturation
  };

  return (
    <div className={`reflective-card-container ${className}`} style={{ ...style, ...cssVariables }}>
      <svg className="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent="20"
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="reflective-video"
        style={{ opacity: reflectionReady ? 0.9 : 0 }}
      />
      {!reflectionReady && <div className="reflective-fallback" aria-hidden="true" />}

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        <div className="card-header">
          <div className="security-badge">
            <Lock size={14} className="security-icon" />
            <span>SECURE ACCESS</span>
          </div>
          <Activity className="status-icon" size={20} />
        </div>

        <div className="card-body">
          <div className="user-info">
            <h2 className="user-name">{name}</h2>
            <p className="user-role">{role}</p>
          </div>
        </div>

        <div className="card-footer">
          <div className="id-section">
            <span className="label">EMPLOYEE NUMBER</span>
            <span className="value">{employeeNumber}</span>
          </div>
          <div className="fingerprint-section">
            <Fingerprint size={32} className="fingerprint-icon" />
          </div>
        </div>

        {hint && <p className="reflective-hint">{hint}</p>}
      </div>
    </div>
  );
};

export default ReflectiveCard;
