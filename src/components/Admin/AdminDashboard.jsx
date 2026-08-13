import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import octalLogo from '../../assets/img/octal-logo.png';

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
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/jobs', { headers: authHeaders() });
      if (res.status === 401) {
        logout();
        return;
      }
      setJobs(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function logout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  function openCreate() {
    setForm(EMPTY_JOB);
    setError('');
    setModal('create');
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
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed.');
      setDeleteConfirm(null);
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-dash">
      <header className="admin-dash__header">
        <button type="button" className="admin-dash__brand" onClick={() => navigate('/')}>
          <img src={octalLogo} alt="Octal Logo" className="admin-dash__logo" />
          <div>
            <h1 className="admin-dash__title">Admin Dashboard</h1>
            <p className="admin-dash__sub">Octal Philippines Inc. · Careers Management</p>
          </div>
        </button>
        <div className="admin-dash__header-actions">
          <button className="admin-dash__btn admin-dash__btn--ghost" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="admin-dash__btn admin-dash__btn--primary" onClick={openCreate}>
            + Create Job
          </button>
          <button className="admin-dash__btn admin-dash__btn--ghost" onClick={() => navigate('/')}>
            View Site
          </button>
          <button className="admin-dash__btn admin-dash__btn--danger" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      <main className="admin-dash__main">
        <div className="admin-dash__section-header">
          <h2 className="admin-dash__section-title">Job Listings</h2>
          <span className="admin-dash__count">{jobs.length} position{jobs.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="admin-dash__loading">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="admin-dash__empty">
            <p>No job listings yet.</p>
            <button className="admin-dash__btn admin-dash__btn--primary" onClick={openCreate}>Add your first job</button>
          </div>
        ) : (
          <div className="admin-dash__table-wrap">
            <table className="admin-dash__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="admin-dash__job-title">{job.title}</td>
                    <td>{job.location}</td>
                    <td><span className="admin-dash__badge">{job.type}</span></td>
                    <td className="admin-dash__actions">
                      <button className="admin-dash__action-btn admin-dash__action-btn--edit" onClick={() => openEdit(job)} title="Edit">✎</button>
                      <button className="admin-dash__action-btn admin-dash__action-btn--delete" onClick={() => setDeleteConfirm(job)} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <div className="admin-modal__overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{modal === 'create' ? 'Create New Job' : 'Edit Job'}</h2>
              <button className="admin-modal__close" onClick={() => setModal(null)}>✕</button>
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
            <p className="admin-modal__desc">Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This cannot be undone.</p>
            <div className="admin-modal__footer">
              <button className="admin-dash__btn admin-dash__btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-dash__btn admin-dash__btn--danger" onClick={() => handleDelete(deleteConfirm.id)} title="Delete">🗑</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
