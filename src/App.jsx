import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Loader from './components/Loader/Loader';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import PageHero from './components/PageHero/PageHero';
import About from './components/About/About';
import Founders from './components/Founders/Founders';
import Services from './components/Services/Services';
import Footer from './components/Footer/Footer';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse/TermsOfUse';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import Jobs from './components/Jobs/Jobs';


const Insights = lazy(() => import('./components/Insights/Insights'));
// const Jobs = lazy(() => import('./components/Jobs/Jobs'));
const Contact = lazy(() => import('./components/Contact/Contact'));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

/* Starts every page at the top, and honours /#section links coming from
   another page — lazy sections may mount late, so retry until they exist. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    const id = hash.slice(1);
    let attempts = 0;
    let timer;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (attempts++ < 25) timer = setTimeout(tryScroll, 100);
    };
    tryScroll();

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

function SiteLayout({ children }) {
  return (
    <>
      <div className="bg-grid" />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const handleLoadComplete = useCallback(() => setLoading(false), []);

  return (
    <>
      {loading && <Loader onComplete={handleLoadComplete} />}
      <SiteLayout>
        <Hero />
        <Suspense fallback={null}>
          <About />
        </Suspense>
      </SiteLayout>
    </>
  );
}

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        title="About Us"
        subtitle="Octal Philippines is a trusted provider of technology and software solutions, dedicated to assisting businesses with innovation, optimization, and growth. Established in 2002 by Silicon Valley engineers, we offer comprehensive IT and consultancy services, ranging from staffing to managed solutions. We connect highly skilled IT professionals with prominent clients across diverse industries."      />
      <Founders />
    </SiteLayout>
  );
}

function SolutionsPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Our Solutions"
        subtitle="Technology, talent, and managed services designed around how your organization actually works."
      />
      <Services />
    </SiteLayout>
  );
}

function InsightPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Insights & Resources"
        subtitle="Empowering organizations with technology, talent, and services tailored to the way you work."
      />
      <Insights />
    </SiteLayout>
  );
}

function CareersPage() {
  return (
    <SiteLayout>
      <PageHero
        title="Build Your Career with Us"
        subtitle="Combining technology, expertise, and personalized services to help organizations — and people — thrive."
      />
      <Jobs />
    </SiteLayout>
  );
}

function ContactPage() {
  return (
    <SiteLayout>
      <PageHero
       
      />
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </SiteLayout>
  );
}


function TermsPage() {
  return (
    <SiteLayout>
      <TermsOfUse />
    </SiteLayout>
  );
}

function PrivacyPage() {
  return (
    <SiteLayout>
      <PrivacyPolicy />
    </SiteLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/insights" element={<InsightPage/>} />
        <Route path="/careers" element={<CareersPage/>} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
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
