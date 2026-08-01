import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Services.css';
import itStaffIcon from '../../assets/img/ITstaff.png';
import blissIcon from '../../assets/img/Bliss.png';
import softwareServicesIcon from '../../assets/img/SoftwareS.png';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    icon: <img src={itStaffIcon} alt="" className="service-card__icon-img" />,
    title: 'IT Staffing Solutions',
    desc: 'Connecting businesses with top talent through flexible staffing, recruitment, and executive search services — ensuring the right people are in place to drive success.',
    features: ['Flexible Staffing', 'Talent Recruitment', 'Executive Search'],
    details: {
      intro:
        'Build your dream team with our flexible and reliable staffing services. Whether you need short-term project support or long-term placements, we connect you with highly qualified professionals who align with your goals and culture.',
      items: [
        {
          title: 'IT Staff Augmentation',
          text: 'Scale your team on demand with skilled IT professionals who integrate seamlessly into your projects, ensuring smooth operations and timely delivery.',
        },
        {
          title: 'Offshore Staffing',
          text: 'Expand your capabilities globally with skilled technical professionals who work remotely as part of your team. Our offshore staffing model allows international clients to access top-tier IT talent efficiently and cost-effectively, while ensuring seamless collaboration, full visibility, and consistent project delivery.',
        },
        {
          title: 'Recruitment and Executive Search',
          text: 'Find the right talent for every role — from technical specialists to senior leaders. Our recruitment experts help you secure permanent hires who bring lasting impact to your organization.',
        },
      ],
    },
  },
  {
    icon: <img src={blissIcon} alt="" className="service-card__icon-img" />,
    title: 'Bluesource Infrastructure Services (BLISS)',
    desc: 'Proactive IT management, business continuity planning, and trusted technology partnerships to keep your operations reliable, secure, and future-ready.',
    features: ['Managed Maintenance Services', 'Business Continuity and Disaster Recovery Consulting', 'Technology Partnerships'],
    details: {
      intro:
        'Keep your IT infrastructure running at peak performance with BLISS — our comprehensive suite of managed services designed to ensure reliability, security, and business continuity.',
      items: [
        {
          title: 'Managed Maintenance Services (MMS)',
          text: 'Maximize uptime and performance with proactive monitoring, dedicated support, and Hardware-as-a-Service (HaaS) solutions that keep your business agile and cost-efficient.',
        },
        {
          title: 'Business Continuity and Disaster Recovery (DR) Consulting',
          text: 'Safeguard your operations with expert-led strategies that minimize downtime and ensure rapid recovery from disruptions.',
        },
        {
          title: 'Authorized Reseller of Industry-Leading Technologies',
          text: 'Power your infrastructure with trusted solutions like IBM watsonx Code Assistant, Blancco Data Erasure Software, Securelink VSN+, Airedale Aircon, iPro CCTV, and Commscope Cabling — backed by our certified engineers who deliver quality, innovation, and peace of mind.',
        },
      ],
    },
  },
  {
    icon: <img src={softwareServicesIcon} alt="" className="service-card__icon-img" />,
    title: 'Software Services',
    desc: 'Empowering enterprises to optimize performance with customized ERP implementations and managed application development — designed for scalability and long-term value.',
    features: ['ERP Implementation', 'Managed App Development', 'Scalable Solutions'],
    details: {
      intro:
        'Transform the way you work through intelligent software solutions built to evolve with your business. From ERP implementation to end-to-end application management, we help you optimize performance and accelerate digital transformation.',
      items: [
        {
          title: 'ERP Solutions',
          text: 'Streamline processes, enhance visibility, and improve decision-making with tailored ERP systems designed to connect every part of your organization.',
        },
        {
          title: 'Managed Services for Application Development',
          text: 'Ensure your applications remain secure, scalable, and future-ready. We handle everything from customization to ongoing maintenance, so you can focus on what matters most — growing your business.',
        },
      ],
    },
  },
];

export default function Services() {
  const sectionRef = useRef(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.services__header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo('.service-card',
        { opacity: 0, y: 60, rotateX: 10 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.services__grid', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!selectedService) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedService(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedService]);

  return (
    <section id="solutions" ref={sectionRef} className="services section section--light">
      <div className="services__header">
        <span className="about__label">What We Do</span>
        <h2 className="section-title">Our Solutions</h2>
        <p className="section-subtitle">
          Innovative, reliable, and scalable technology solutions designed to
          meet diverse organizational needs — from staffing and infrastructure
          management to enterprise software implementation.
        </p>
      </div>

      <div className="services__grid">
        {SERVICES.map((service, index) => (
          <button
            key={service.title}
            className="service-card glass-card"
            type="button"
            onClick={() => setSelectedService(service)}
          >
            <span className="service-card__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="service-card__icon">{service.icon}</div>
            <h3 className="service-card__title">{service.title}</h3>
            <p className="service-card__desc">{service.desc}</p>
            <ul className="service-card__features">
              {service.features.map((f) => (
                <li key={f}>
                  <span className="feature-dot" />
                  {f}
                </li>
              ))}
            </ul>
            <span className="service-card__cta">
              View Details
              <svg
                className="service-card__cta-arrow"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {selectedService && (
        <div
          className="services-modal__overlay"
          onClick={() => setSelectedService(null)}
          role="presentation"
        >
          <div
            className="services-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedService.title} details`}
          >
            <button
              type="button"
              className="services-modal__close"
              onClick={() => setSelectedService(null)}
              aria-label="Close details"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <header className="services-modal__banner">
              <span className="services-modal__eyebrow">Our Solution</span>
              <h3 className="services-modal__title">{selectedService.title}</h3>
              <span className="services-modal__divider" aria-hidden="true" />
              <p className="services-modal__intro">{selectedService.details.intro}</p>
            </header>

            <div className="services-modal__content">
              {selectedService.details.items.map((item, i) => (
                <div key={item.title} className="services-modal__item">
                  <span className="services-modal__item-index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
