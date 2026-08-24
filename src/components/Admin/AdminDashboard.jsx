import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import PixelBlast from '../PixelBlast/PixelBlast';
import AccessGate from './AccessGate';
import './AdminDashboard.css';
import octalLogo from '../../assets/img/octal-logo-withText.png';

const EMPTY_JOB = {
  title: '',
  location: '',
  type: 'Full-time',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
};

function authHeaders() {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function arrToText(arr) {
  return Array.isArray(arr) ? arr.join('\n') : arr || '';
}

function textToArr(str) {
  return str.split('\n').map((s) => s.trim()).filter(Boolean);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /* AdminLogin sets this flag on a successful sign-in, so the credential card
     appears once per login instead of on every visit to /admin. */
  const [showGate, setShowGate] = useState(() => sessionStorage.getItem('admin_show_pass') === '1');

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_show_pass');
    navigate('/admin/login');
  }, [navigate]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/jobs', { headers: authHeaders() });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`Could not load job listings (${res.status}).`);
      setJobs(await res.json());
    } catch (err) {
      setLoadError(err.message || 'Could not load job listings.');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  function dismissGate() {
    sessionStorage.removeItem('admin_show_pass');
    setShowGate(false);
  }

  function openCreate() {
    setForm(EMPTY_JOB);
    setError('');
    setModal('create');
    setSidebarOpen(false);
  }

  function openEdit(job) {
    setForm({
      ...job,
      responsibilities: arrToText(job.responsibilities),
      requirements: arrToText(job.requirements),
      benefits: arrToText(job.benefits),
    });
    setError('');
    setModal(job);
  }

  function handleFormChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      responsibilities: textToArr(form.responsibilities),
      requirements: textToArr(form.requirements),
      benefits: textToArr(form.benefits),
    };
    try {
      const isEdit = modal !== 'create';
      const url = isEdit ? `/api/admin/jobs/${modal.id}` : '/api/admin/jobs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setModal(null);
      fetchJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleteError('');
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed.');
      setDeleteConfirm(null);
      fetchJobs();
    } catch (err) {
      setDeleteError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  const stats = useMemo(() => {
    const fullTime = jobs.filter((j) => j.type === 'Full-time').length;
    const locations = new Set(jobs.map((j) => (j.location || '').trim()).filter(Boolean));
    return {
      total: jobs.length,
      fullTime,
      otherTypes: jobs.length - fullTime,
      locations: locations.size,
    };
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.title, j.location, j.type].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [jobs, query]);

  return (
    <div className="admin-dash">
      {showGate && <AccessGate onProceed={dismissGate} />}

      <div className="admin-dash__bg" aria-hidden="true">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#59a14a"
          patternScale={3}
          patternDensity={1}
          pixelSizeJitter={0.4}
          enableRipples={false}
          speed={0.35}
          edgeFade={0.15}
          transparent
        />
      </div>

      <div className="admin-dash__shell">
        {/* Kept inside the shell: the shell's own z-index creates a stacking
            context, so a scrim outside it would paint over the drawer no matter
            how high the drawer's z-index went. */}
        {sidebarOpen && (
          <div className="admin-dash__scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        <aside className={`admin-dash__sidebar${sidebarOpen ? ' admin-dash__sidebar--open' : ''}`}>
          <div className="admin-dash__sidebar-top">
            <button type="button" className="admin-dash__brand" onClick={() => navigate('/')}>
              <img src={octalLogo} alt="Octal Philippines Inc." className="admin-dash__logo" />
            </button>
            <button
              type="button"
              className="admin-dash__sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="admin-dash__nav">
            <span className="admin-dash__nav-label">Manage</span>
            <span className="admin-dash__nav-item admin-dash__nav-item--active">
              <LayoutDashboard size={17} />
              Job Listings
              <span className="admin-dash__nav-count">{stats.total}</span>
            </span>
            <button className="admin-dash__nav-item" onClick={() => navigate('/careers')}>
              <Briefcase size={17} />
              Careers Page
              <ExternalLink size={14} className="admin-dash__nav-ext" />
            </button>
            <button className="admin-dash__nav-item" onClick={() => navigate('/')}>
              <ExternalLink size={17} />
              View Website
            </button>
          </nav>

          <div className="admin-dash__sidebar-footer">
            <div className="admin-dash__account">
              <span className="admin-dash__account-name">Charles Brian Mitra</span>
              <span className="admin-dash__account-role">Full Stack Developer · 2120585</span>
            </div>
            <button className="admin-dash__logout" onClick={logout}>
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </aside>

        <div className="admin-dash__content">
          <header className="admin-dash__topbar">
            <button
              type="button"
              className="admin-dash__menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="admin-dash__topbar-heading">
              <h1 className="admin-dash__title">Job Listings</h1>
              <p className="admin-dash__sub">Create, edit, and retire roles on the careers page.</p>
            </div>

            <div className="admin-dash__topbar-actions">
              <div className="admin-dash__search">
                <Search size={16} className="admin-dash__search-icon" />
                <input
                  type="search"
                  className="admin-dash__search-input"
                  placeholder="Search roles…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search job listings"
                />
              </div>
              <button className="admin-dash__btn admin-dash__btn--primary" onClick={openCreate}>
                <Plus size={16} />
                Create Job
              </button>
            </div>
          </header>

          <main className="admin-dash__main">
            <section className="admin-dash__stats" aria-label="Summary">
              <StatCard icon={<Briefcase size={18} />} label="Total Positions" value={stats.total} />
              <StatCard icon={<Clock size={18} />} label="Full-time" value={stats.fullTime} />
              <StatCard icon={<Layers size={18} />} label="Other Types" value={stats.otherTypes} />
              <StatCard icon={<MapPin size={18} />} label="Locations" value={stats.locations} />
            </section>

            <section className="admin-dash__panel">
              <div className="admin-dash__panel-head">
                <h2 className="admin-dash__panel-title">All Positions</h2>
                <span className="admin-dash__count">
                  {visibleJobs.length} of {jobs.length}
                </span>
              </div>

              {loading ? (
                <div className="admin-dash__state">Loading job listings…</div>
              ) : loadError ? (
                <div className="admin-dash__state admin-dash__state--error">
                  <TriangleAlert size={20} />
                  <p>{loadError}</p>
                  <button className="admin-dash__btn admin-dash__btn--ghost" onClick={fetchJobs}>
                    Try again
                  </button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="admin-dash__state">
                  <p>No job listings yet.</p>
                  <button className="admin-dash__btn admin-dash__btn--primary" onClick={openCreate}>
                    <Plus size={16} />
                    Add your first job
                  </button>
                </div>
              ) : visibleJobs.length === 0 ? (
                <div className="admin-dash__state">
                  <p>No roles match “{query}”.</p>
                  <button className="admin-dash__btn admin-dash__btn--ghost" onClick={() => setQuery('')}>
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="admin-dash__table-wrap">
                  <table className="admin-dash__table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th className="admin-dash__th-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleJobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <span className="admin-dash__job-title">{job.title}</span>
                          </td>
                          <td className="admin-dash__cell-muted">
                            <MapPin size={13} className="admin-dash__cell-icon" />
                            {job.location || '—'}
                          </td>
                          <td>
                            <span className="admin-dash__badge">{job.type}</span>
                          </td>
                          <td>
                            <div className="admin-dash__actions">
                              <button
                                className="admin-dash__action-btn admin-dash__action-btn--edit"
                                onClick={() => openEdit(job)}
                                aria-label={`Edit ${job.title}`}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="admin-dash__action-btn admin-dash__action-btn--delete"
                                onClick={() => {
                                  setDeleteError('');
                                  setDeleteConfirm(job);
                                }}
                                aria-label={`Delete ${job.title}`}
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {modal && (
        <div className="admin-modal__overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{modal === 'create' ? 'Create New Job' : 'Edit Job'}</h2>
              <button className="admin-modal__close" onClick={() => setModal(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form className="admin-modal__form" onSubmit={handleSave}>
              <div className="admin-modal__row">
                <div className="admin-modal__field">
                  <label className="admin-modal__label">Job Title *</label>
                  <input className="admin-modal__input" name="title" value={form.title} onChange={handleFormChange} required placeholder="e.g. Flutter Developer" />
                </div>
              </div>

              <div className="admin-modal__row">
                <div className="admin-modal__field">
                  <label className="admin-modal__label">Location</label>
                  <input className="admin-modal__input" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g. BGC, Taguig · Onsite" />
                </div>
                <div className="admin-modal__field">
                  <label className="admin-modal__label">Employment Type</label>
                  <select className="admin-modal__input admin-modal__select" name="type" value={form.type} onChange={handleFormChange}>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Description *</label>
                <textarea className="admin-modal__input admin-modal__textarea" name="description" value={form.description} onChange={handleFormChange} required rows={4} placeholder="Brief overview of the role…" />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Responsibilities <span className="admin-modal__hint">(one per line)</span></label>
                <textarea className="admin-modal__input admin-modal__textarea" name="responsibilities" value={form.responsibilities} onChange={handleFormChange} rows={5} placeholder="Develop and maintain applications.&#10;Write clean, scalable code.&#10;…" />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Requirements <span className="admin-modal__hint">(one per line)</span></label>
                <textarea className="admin-modal__input admin-modal__textarea" name="requirements" value={form.requirements} onChange={handleFormChange} rows={5} placeholder="3+ years experience.&#10;Proficiency in React.&#10;…" />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Benefits / What We Offer <span className="admin-modal__hint">(one per line, optional)</span></label>
                <textarea className="admin-modal__input admin-modal__textarea" name="benefits" value={form.benefits} onChange={handleFormChange} rows={3} placeholder="Competitive salary.&#10;HMO coverage.&#10;…" />
              </div>

              {error && <p className="admin-modal__error">{error}</p>}

              <div className="admin-modal__footer">
                <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="admin-dash__btn admin-dash__btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Job' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="admin-modal__overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal__title">Delete Job?</h2>
            <p className="admin-modal__desc">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This cannot be undone.
            </p>
            {deleteError && <p className="admin-modal__error">{deleteError}</p>}
            <div className="admin-modal__footer">
              <button className="admin-dash__btn admin-dash__btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="admin-dash__btn admin-dash__btn--danger"
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleting}
              >
                <Trash2 size={15} />
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat__icon">{icon}</span>
      <div className="admin-stat__body">
        <span className="admin-stat__value">{value}</span>
        <span className="admin-stat__label">{label}</span>
      </div>
    </div>
  );
}
