import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Founders.css';
import founder1 from '../../assets/img/founder-1.png';
import founder2 from '../../assets/img/founder-2.png';
import founder3 from '../../assets/img/founder-3.png';
import founder4 from '../../assets/img/founder-4.png';

gsap.registerPlugin(ScrollTrigger);

const FOUNDERS = [
  {
    id: 'carlos',
    name: 'Carlos Q. Yabut',
    title: 'President',
    image: founder1,
    bio: [
      'Carlos is a seasoned technology executive with over 35 years of experience in software engineering, systems development, and information technology. He began his career in Silicon Valley, where he held engineering and leadership roles at Xerox Imaging Systems, Calera Recognition Systems, and Caere Corporation. During his tenure, he led the development of award-winning Optical Character Recognition (OCR) software solutions that contributed to advancements in document imaging and intelligent data capture technologies.',
      "In 1996, he co-founded Internext Group, Inc. and WebScape Philippines, Inc., establishing one of the Philippines' pioneering nationwide Internet Service Providers (ISPs). His entrepreneurial vision and technical expertise played a key role in expanding Internet connectivity and technology services in the country.",
      'As President, he provides strategic leadership in technology innovation, product development, and business growth. He is committed to delivering reliable, high-quality IT solutions, fostering a culture of excellence, and building long-term partnerships that enable clients to achieve their digital transformation goals.',
    ],
  },
  {
    id: 'geminiano',
    name: 'Geminiano Q. Yabut III',
    title: 'Managing Director',
    image: founder2,
    bio: [
      'With over 35 years of leadership experience in information technology, business process outsourcing (BPO), technical recruitment, and operations management, Gem brings a wealth of expertise in driving business growth and organizational excellence. A graduate of Santa Clara University, he has held executive leadership positions with global technology organizations, including Inter.net Global, and co-founded one of the pioneering Internet service providers in the Philippines.',
      "As Managing Director, he leads the company's strategic direction, business development, operational excellence, and service delivery initiatives. His leadership focuses on fostering innovation, building long-term client partnerships, and delivering technology-driven solutions that create lasting value across diverse industries.",
    ],
  },
  {
    id: 'joselito',
    name: 'Joselito Martin Capinpin',
    title: 'Service Director',
    image: founder3,
    bio: [
      'A Project Management Professional (PMP) and Certified Business Continuity Professional (CBCP) with over 30 years of IT industry experience, Topets has extensive expertise in service operations, support administration, enterprise account management, IT deployment and maintenance, and IT infrastructure outsourcing and managed services. Prior to joining the company, he spent 28 years with IBM Philippines, where he held various leadership roles in IT services management and service delivery.',
      'Throughout his career, he successfully managed complex projects involving data center construction and relocation, structured cabling, network systems deployment and integration, hardware and software maintenance, systems management implementation, storage systems installation and migration, high-availability solutions, and business continuity and disaster recovery program.',
      'He is recognized for his strong leadership, customer-focused approach, and commitment to delivering reliable, high-quality IT services that support business objectives while driving continuous improvement and operational resilience.',
    ],
  },
  {
    id: 'mila',
    name: 'Mila B. Musni',
    title: 'Operations Manager',
    image: founder4,
    bio: [
      "With over 27 years of industry experience, Mila leads the company's business development, operations, client relationship management, and IT recruitment initiatives. A graduate of the Polytechnic University of the Philippines, she has a proven track record of building strong client partnerships, driving sustainable business growth, and delivering high-quality workforce solutions tailored to clients' evolving business needs across various industries.",
      "Known for her customer-focused approach and commitment to operational excellence, she continues to strengthen client relationships, optimize service delivery, and contribute to the company's continued growth and success.",
    ],
  },
];

function FounderModal({ founder, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    ).fromTo(panelRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
      '-=0.15'
    );

    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.25, ease: 'power2.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
  };

  return (
    <div ref={overlayRef} className="founder-overlay" onClick={handleClose}>
      <div
        ref={panelRef}
        className="founder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="founder-modal-name"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="founder-modal__close"
          onClick={handleClose}
          aria-label="Close founder details"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="founder-modal__body">
          <span className="about__label">Founder Profile</span>
          <h3 id="founder-modal-name" className="founder-modal__name">{founder.name}</h3>
          <span className="founder-modal__title">{founder.title}</span>
          <div className="founder-modal__bio">
            {founder.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Founders() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  const selected = FOUNDERS.find((f) => f.id === selectedId) || null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo('.founder-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.founders__grid', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="founders" ref={sectionRef} className="founders section section--light-alt">
      <div className="founders__header" ref={headerRef}>
        <span className="about__label">Who Leads Us</span>
        <h2 className="section-title">Meet the Founders</h2>
        <p className="section-subtitle">
          The people behind Octal — a team of builders, operators, and technologists
          committed to helping organizations grow through the smart use of technology.
        </p>
      </div>

      <div className="founders__grid">
        {FOUNDERS.map((f) => (
          <article
            key={f.id}
            className="founder-card glass-card"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(f.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedId(f.id);
              }
            }}
          >
            <div className="founder-card__media">
              <img src={f.image} alt={f.name} className="founder-card__image" loading="lazy" />
            </div>
            <div className="founder-card__body">
              <span className="founder-card__accent" aria-hidden="true" />
              <h3 className="founder-card__name">{f.name}</h3>
              <span className="founder-card__title">{f.title}</span>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <FounderModal founder={selected} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}