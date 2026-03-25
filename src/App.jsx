import { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader/Loader';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Services from './components/Services/Services';
import Footer from './components/Footer/Footer';
import TermsOfUse from './components/TermsOfUse/TermsOfUse';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

const Insights = lazy(() => import('./components/Insights/Insights'));
const Jobs = lazy(() => import('./components/Jobs/Jobs'));
const Contact = lazy(() => import('./components/Contact/Contact'));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

function Portfolio() {
  const [loading, setLoading] = useState(true);
  const handleLoadComplete = useCallback(() => setLoading(false), []);

  return (
    <>
      {loading && <Loader onComplete={handleLoadComplete} />}
      <div className="bg-grid" />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Suspense fallback={null}>
          <Insights />
          <Jobs />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function TermsPage() {
  return (
    <>
      <div className="bg-grid" />
      <Navbar />
      <main>
        <TermsOfUse />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/terms-of-use" element={<TermsPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
