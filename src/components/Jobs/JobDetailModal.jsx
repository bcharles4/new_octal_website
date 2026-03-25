import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './JobDetailModal.css';

export default function JobDetailModal({ job, onClose, onApply }) {
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
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panelRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.25, ease: 'power2.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
  };

  const handleApply = () => {
    handleClose();
    setTimeout(onApply, 350);
  };

  return (
    <div ref={overlayRef} className="jd-overlay" onClick={handleClose}>
      <div ref={panelRef} className="jd-modal" onClick={(e) => e.stopPropagation()}>

        <button className="jd-modal__close" onClick={handleClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="jd-modal__header">
          <div className="jd-modal__badges">
            <span className="jd-badge">{job.type}</span>
          </div>
          <h2 className="jd-modal__title">{job.title}</h2>
          <p className="jd-modal__location">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {job.location}
          </p>
        </div>

        {/* Body */}
        <div className="jd-modal__body">
          <div className="jd-modal__section">
            <h4 className="jd-modal__section-title">About the Role</h4>
            <p className="jd-modal__desc">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div className="jd-modal__section">
              <h4 className="jd-modal__section-title">Key Responsibilities</h4>
              <ul className="jd-modal__list">
                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {job.requirements && (
            <div className="jd-modal__section">
              <h4 className="jd-modal__section-title">Requirements</h4>
              <ul className="jd-modal__list">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {job.benefits && (
            <div className="jd-modal__section">
              <h4 className="jd-modal__section-title">What We Offer</h4>
              <ul className="jd-modal__list jd-modal__list--benefits">
                {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="jd-modal__footer">
          <button className="btn-outline jd-cancel-btn" onClick={handleClose}>Close</button>
          <button className="btn-primary jd-apply-btn" onClick={handleApply}>
            Apply Now
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
