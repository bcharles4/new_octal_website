import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/img/octal-logo-withText.png';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Home', target: 'home' },
  { label: 'About', target: 'about' },
  { label: 'Solutions', target: 'solutions' },
  { label: 'Insights', target: 'insights' },
  { label: 'Careers', target: 'jobs' },
  { label: 'Contact', target: 'connect' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      if (location.pathname !== '/') return;
      const offset = window.scrollY + window.innerHeight / 3;
      let current = 'home';
      for (const { target } of NAV_ITEMS) {
        const el = document.getElementById(target);
        if (el && el.offsetTop <= offset) current = target;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const goTo = (target) => {
    if (location.pathname !== '/') {
      navigate(`/#${target}`);
      return;
    }
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goHome = () => {
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <button
        type="button"
        className="navbar__brand"
        onClick={goHome}
        aria-label="Octal Philippines home"
      >
        <img src={logo} alt="Octal Philippines" className="navbar__logo" />
      </button>

      <nav className="navbar__pill" aria-label="Primary navigation">
        <ul className="navbar__links">
          {NAV_ITEMS.map(({ label, target }) => (
            <li key={target}>
              <button
                type="button"
                className={`navbar__link ${activeSection === target ? 'navbar__link--active' : ''}`}
                onClick={() => goTo(target)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
