import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '20+', label: 'Years Experience' },
  { value: '200+', label: 'Projects Delivered' },
  { value: '99%', label: 'Client Satisfaction' },
];

export default function About() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1, x: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo(textRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo(imageRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo('.stat-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about section section--light-alt">
      <div className="about__grid">
        <div className="about__text-col">
          <div ref={headingRef}>
            <span className="about__label">Who We Are</span>
            <h2 className="section-title">Building Futures<br />Together</h2>
          </div>
          <div ref={textRef}>
            <p className="section-subtitle">
              At Octal, we deliver innovative, reliable, and scalable technology
              solutions that empower businesses to achieve operational excellence,
              efficiency, and sustainable growth.
            </p>
            <p className="about__body">
              Our comprehensive suite of services is designed to meet diverse
              organizational needs — from staffing and infrastructure management
              to enterprise software implementation. We don't just deliver
              solutions — we build partnerships that help organizations harness
              technology, empower people, and achieve measurable results that last.
            </p>
          </div>
        </div>

        <div ref={imageRef} className="about__visual-col">
          <div className="about__visual">
            <div className="about__hex-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="about__hex" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className="about__hex-inner" />
                </div>
              ))}
            </div>
            <div className="about__visual-text">
              <span className="about__visual-number"></span>
              <span className="about__visual-label">OCTAL</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={statsRef} className="about__stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-card glass-card">
            <div className="stat-card__value">{stat.value}</div>
            <div className="stat-card__label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
