import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { apiUrl } from '../../lib/api';
import './ApplyModal.css';

export default function ApplyModal({ job, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    resume: null,
    coverLetter: '',
  });

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
    const tl = gsap.timeline({
      onComplete: onClose,
    });
    tl.to(panelRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.25, ease: 'power2.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('firstName', form.firstName);
    data.append('lastName', form.lastName);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('linkedin', form.linkedin);
    data.append('coverLetter', form.coverLetter);
    data.append('jobTitle', job.title);
    data.append('jobLocation', job.location);
    data.append('jobType', job.type);
    if (form.resume) data.append('resume', form.resume);

    try {
      const res = await fetch(apiUrl('/api/apply'), { method: 'POST', body: data });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
    } catch {
      setError('Failed to submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={overlayRef} className="apply-overlay" onClick={handleClose}>
      <div ref={panelRef} className="apply-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="apply-modal__close" onClick={handleClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {submitted ? (
          <div className="apply-modal__success">
            <div className="apply-modal__success-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="var(--primary)" />
                <path d="M12 20l5 5 11-11" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Application Submitted!</h3>
            <p>Thank you for applying for <strong>{job.title}</strong>. Our team will review your application and get back to you within 5 business days.</p>
            <button className="btn-primary" onClick={handleClose} style={{ marginTop: '1.5rem' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="apply-modal__header">
              <h2 className="apply-modal__title">Apply for this Position</h2>
              <div className="apply-modal__job-info">
                <h3>{job.title}</h3>
                <div className="apply-modal__job-meta">
                  <span>{job.location}</span>
                  <span className="apply-modal__dot">·</span>
                  <span>{job.type}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="apply-modal__form" onSubmit={handleSubmit}>
              <div className="apply-modal__row">
                <div className="apply-modal__field">
                  <label htmlFor="firstName">First Name <span className="required">*</span></label>
                  <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Juan" required />
                </div>
                <div className="apply-modal__field">
                  <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                  <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dela Cruz" required />
                </div>
              </div>

              <div className="apply-modal__row">
                <div className="apply-modal__field">
                  <label htmlFor="applyEmail">Email Address <span className="required">*</span></label>
                  <input type="email" id="applyEmail" name="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" required />
                </div>
                <div className="apply-modal__field">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+63 9XX XXX XXXX" />
                </div>
              </div>

              <div className="apply-modal__field">
                <label htmlFor="linkedin">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  pattern="https://(www\.)?linkedin\.com/.*"
                  title="Must be a valid LinkedIn URL (https://linkedin.com/...)"
                />
              </div>

              <div className="apply-modal__field">
                <label htmlFor="resume">Resume / CV <span className="required">*</span></label>
                <div className="apply-modal__file-input">
                  <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} required />
                  <div className="apply-modal__file-label">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3v10M6 7l4-4 4 4M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{form.resume ? form.resume.name : 'Upload PDF, DOC, or DOCX'}</span>
                  </div>
                </div>
              </div>

              <div className="apply-modal__field">
                <label htmlFor="coverLetter">Cover Letter <span className="optional">(Optional)</span></label>
                <textarea id="coverLetter" name="coverLetter" value={form.coverLetter} onChange={handleChange} placeholder="Tell us why you're a great fit for this role..." rows={4} />
              </div>

              <div className="apply-modal__actions">
                <button type="button" className="btn-outline" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
              {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '8px', textAlign: 'center' }}>{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
