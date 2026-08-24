import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CoreValues.css';

gsap.registerPlugin(ScrollTrigger);

const VALUES = [
  {
    title: 'Honesty and Integrity',
    body: 'We uphold the highest standards of ethics and transparency in every client interaction. We remain accountable for our actions and commitments, ensuring trust in everything we do.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Client-Focused Approach',
    body: 'We listen to our clients and tailor our solutions to meet their unique goals. By building meaningful, long-term partnerships, we work toward shared success and sustained growth.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="9" cy="8" r="3.25" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
        <path d="M16 5.6a3 3 0 0 1 0 5.8" strokeLinecap="round" />
        <path d="M17.5 14.3a5.5 5.5 0 0 1 3 5.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    body: 'We continuously embrace innovation and stay ahead of industry trends to deliver forward-thinking solutions that empower our clients to thrive in an ever-evolving digital landscape.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path
          d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z"
          strokeLinejoin="round"
        />
        <path d="M9.5 18.5h5M10.5 21h3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function CoreValues() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        },
      );

      gsap.fromTo(
        '.value-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="core-values" ref={sectionRef} className="values section section--light">
      <div ref={headerRef} className="values__header">
        <h2 className="section-title">Our Core Values</h2>
        <p className="section-subtitle">
          The principles that guide how we work with every client and partner.
        </p>
      </div>

      <div ref={gridRef} className="values__grid">
        {VALUES.map((value, index) => (
          <article key={value.title} className="value-card glass-card">

            <span className="value-card__icon" aria-hidden="true">
              {value.icon}
            </span>
            <h3 className="value-card__title">{value.title}</h3>
            <p className="value-card__body">{value.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
