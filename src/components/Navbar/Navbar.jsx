import { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/img/octal-logo-withText.png';
import StaggeredMenu from './StaggeredMenu';
import './Navbar.css';

/* Below this width the pill is swapped for the staggered menu. */
const MOBILE_QUERY = '(max-width: 820px)';

/* Home, About and Solutions are standalone pages; the remaining entries are
   sections that still live on the home page and are reached by anchor. */
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Solutions', path: '/solutions' },
  { label: 'Insights', path: '/insights' },
  { label: 'Careers', path: '/careers'},
  { label: 'Contact Us', path: '/contact' },
];

const HOME_SECTIONS = ['home', 'insights', 'jobs', 'connect'];

const subscribeToMobile = (onChange) => {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      if (location.pathname !== '/') return;
      const offset = window.scrollY + window.innerHeight / 3;
      let current = 'home';
      for (const target of HOME_SECTIONS) {
        const el = document.getElementById(target);
        if (el && el.offsetTop <= offset) current = target;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const goTo = ({ path, hash }) => {
    if (hash) {
      if (location.pathname === path) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate(`${path}#${hash}`);
      }
      return;
    }

    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const isActive = ({ path, hash }) => {
    if (location.pathname !== path) return false;
    if (path !== '/') return true;
    return hash ? activeSection === hash : activeSection === 'home';
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

      {isMobile ? (
        <StaggeredMenu items={NAV_ITEMS} isActive={isActive} onSelect={goTo} />
      ) : (
        <nav id="primary-navigation" className="navbar__pill" aria-label="Primary navigation">
          <ul className="navbar__links">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={`navbar__link ${isActive(item) ? 'navbar__link--active' : ''}`}
                  onClick={() => goTo(item)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
