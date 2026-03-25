import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Loader.css';

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loaderRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: onComplete,
        });
      },
    });

    // Animate progress bar
    tl.to({ val: 0 }, {
      val: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: function () {
        setProgress(Math.round(this.targets()[0].val));
      },
    });

    // Flicker text
    tl.fromTo(textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      0
    );

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={loaderRef} className="loading-screen">
      <div className="loader-content">
        <div ref={textRef} className="loader-logo">
          <span className="loader-bracket">[</span>
          <span className="loader-name">OCTAL</span>
          <span className="loader-bracket">]</span>
        </div>
        <div className="loader-bar-track">
          <div
            ref={barRef}
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loader-percent">{progress}%</div>
      </div>
    </div>
  );
}
