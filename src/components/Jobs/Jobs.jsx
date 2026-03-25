import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ApplyModal from './ApplyModal';
import JobDetailModal from './JobDetailModal';
import './Jobs.css';

gsap.registerPlugin(ScrollTrigger);

export default function Jobs() {
  const sectionRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailJob, setDetailJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const jobsPerPage = 5;

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]));
  }, []);

  const totalPages = Math.max(1, Math.ceil(jobs.length / jobsPerPage));
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.jobs__header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    gsap.fromTo('.job-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' }
    );
  }, [currentPage, jobs.length]);

  return (
    <section id="jobs" ref={sectionRef} className="jobs section section--light-alt">
      <div className="jobs__header">
        <span className="about__label">Careers</span>
        <h2 className="section-title">Find a Job</h2>
        <p className="section-subtitle" style={{ margin: '1rem auto 0', textAlign: 'center' }}>
          Join a team that's building the future of technology in the Philippines.
          Explore open roles and grow your career with Octal.
        </p>
      </div>

      <div className="jobs__list">
        {paginatedJobs.map((job) => (
          <div
            key={job.title}
            className="job-card glass-card job-card--clickable"
            onClick={() => setDetailJob(job)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setDetailJob(job)}
          >
            <div className="job-card__header">
              <div>
                <h3 className="job-card__title">{job.title}</h3>
                <div className="job-card__meta">
                  <span>{job.location}</span>
                  <span className="job-card__dot">·</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <span className="job-card__view-hint">View Details →</span>
            </div>
            <p className="job-card__desc">{job.description}</p>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="jobs__empty">
          <p>No open positions right now. Check back soon!</p>
        </div>
      )}

      {jobs.length > jobsPerPage && (
        <div className="jobs__pagination" aria-label="Jobs pagination">
          <button
            type="button"
            className="jobs__page-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="jobs__page-info">Page {currentPage} of {totalPages}</span>

          <button
            type="button"
            className="jobs__page-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onClose={() => setDetailJob(null)}
          onApply={() => { setApplyJob(detailJob); setDetailJob(null); }}
        />
      )}
    </section>
  );
}
