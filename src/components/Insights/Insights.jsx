import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Insights.css';

import drisImg from '../../assets/img/dris.jpg';
import accumatica from '../../assets/img/accumatica.png';
import outing from '../../assets/img/outing.png';
import projectManagement from '../../assets/img/pmw.png';
import projectTeam from '../../assets/img/ptdt.jpg';
import bambooPlanting from '../../assets/img/bp.jpg';


gsap.registerPlugin(ScrollTrigger);

const ARTICLES = [
  {
    tag: 'Disaster Recovery',
    title: 'Disaster Recovery Introduction Seminar',
    excerpt: 'We successfully conducted our Disaster Recovery Introduction Seminar, equipping participants with valuable insights on how businesses can prepare, respond, and recover from unexpected disruptions.',
    image: drisImg,
  },
  {
    tag: 'Technology',
    title: 'Project Team Dynamics Training',
    excerpt:'Octal Philippines Inc. conducted a training session for its employees titled “Project Team Dynamics: Using the Myers-Briggs Type Indicator (MBTI) to Understand Work Styles and Communication” last May 2, 2025.',
    image: projectTeam,
  },
  {
    tag: 'Software',
    title: 'Project Management Workshop',
    excerpt:'The workshop provided valuable knowledge and practical strategies that participants can immediately apply in both their professional responsibilities and everyday endeavors.',
    image: projectManagement,
  },
  {
    tag: 'Recreational',
    title: 'A Day of Fun and Team Bonding',
    excerpt:'Good times, bonds created, and teamwork strengthened during the Octal Summer Outing 2023! Core memory unlocked indeed, as the team had a fun summer adventure and activities at Botolan, Zambales.',
    image: outing,
  },
  {
    tag: 'Events',
    title: 'Asia Partner of the Year 2017',
    excerpt: 'Cloudqwest and Octal Philippines were recognized by Acumatica as the Asia Partner of the Year 2017, a prestigious award that celebrates their outstanding sales achievements, unwavering commitment to customer success, and excellence in delivering Acumatica ERP solutions throughout the region.',
    image: accumatica,
  },
  {
    tag: 'Environments',
    title: 'Octal Philippines Bamboo Planting Initiative',
    excerpt: 'Octal together with Litus Software and Sun Micro Development Concepts Inc. These enthusiastic employees spend their weekend giving back to nature by planting Bamboos as their pledge for a greener community.',
    image: bambooPlanting,
  },
];

export default function Insights() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.insights__header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo('.insight-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.insights__grid', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="insights" ref={sectionRef} className="insights section section--light">
      <div className="insights__header">
        <span className="about__label">Knowledge Hub</span>
        <h2 className="section-title">Insights & Resources</h2>
        <p className="section-subtitle" style={{ margin: '1rem auto 0', textAlign: 'center' }}>
          Every milestone tells a story. Stay informed with our latest news, expert insights,
          and company events as we celebrate achievements, embrace innovation, strengthen
          partnerships, and empower our people. Explore how we learn, innovate, and succeed—together.
        </p>
      </div>

      <div className="insights__grid">
        {ARTICLES.map((article) => (
          <article key={article.title} className="insight-card glass-card">
            {article.image && (
              <div className="insight-card__image">
                <img src={article.image} alt={article.title} loading="lazy" />
              </div>
            )}
            <div className="insight-card__body">
              <div className="insight-card__tag">{article.tag}</div>
              <h3 className="insight-card__title">{article.title}</h3>
              <p className="insight-card__excerpt">{article.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
