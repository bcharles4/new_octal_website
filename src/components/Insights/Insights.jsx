import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Insights.css';

gsap.registerPlugin(ScrollTrigger);

const ARTICLES = [
  {
    tag: 'Technology',
    title: 'The Future of Enterprise IT Staffing in the Philippines',
    excerpt: 'How flexible staffing models are reshaping the way businesses build high-performing tech teams in a rapidly evolving digital landscape.',
    date: 'Feb 10, 2026',
    readTime: '5 min read',
  },
  {
    tag: 'Infrastructure',
    title: 'Why Proactive IT Management is No Longer Optional',
    excerpt: 'Business continuity planning and proactive infrastructure management are critical to staying competitive. Here\'s what BLISS delivers.',
    date: 'Jan 28, 2026',
    readTime: '4 min read',
  },
  {
    tag: 'Software',
    title: 'ERP Implementation: From Complexity to Clarity',
    excerpt: 'A deep dive into how customized ERP solutions are helping enterprises across Southeast Asia streamline operations and scale sustainably.',
    date: 'Jan 15, 2026',
    readTime: '6 min read',
  },
  {
    tag: 'Industry',
    title: 'Digital Transformation Trends Driving Growth in 2026',
    excerpt: 'From AI-driven automation to cloud-first strategies, discover the key technology trends empowering businesses this year.',
    date: 'Jan 5, 2026',
    readTime: '7 min read',
  },
  {
    tag: 'Culture',
    title: 'Building a Future-Ready Workforce at Octal',
    excerpt: 'How we invest in our people through continuous learning, mentorship, and a culture of innovation that drives real results.',
    date: 'Dec 20, 2025',
    readTime: '3 min read',
  },
  {
    tag: 'Case Study',
    title: 'Transforming Operations for a Leading Logistics Firm',
    excerpt: 'How Octal\'s managed services and ERP solutions helped a major logistics company cut operational costs by 35% in 12 months.',
    date: 'Dec 8, 2025',
    readTime: '5 min read',
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
          Stay informed with the latest trends, strategies, and stories from the
          world of technology and business transformation.
        </p>
      </div>

      <div className="insights__grid">
        {ARTICLES.map((article) => (
          <article key={article.title} className="insight-card glass-card">
            <div className="insight-card__tag">{article.tag}</div>
            <h3 className="insight-card__title">{article.title}</h3>
            <p className="insight-card__excerpt">{article.excerpt}</p>
            <div className="insight-card__meta">
              <span>{article.date}</span>
              <span className="insight-card__dot">·</span>
              <span>{article.readTime}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
