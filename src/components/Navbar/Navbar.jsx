import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import logo from '../../assets/img/octal-logo.png';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'About Us', id: 'about' },
  { label: 'Solutions', id: 'solutions' },
  { label: "Let's Connect", id: 'connect' },
  { label: 'Insights', id: 'insights' },
  { label: 'Careers', id: 'jobs' },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);

    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 2.5 }
    );

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav ref={navRef} className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__logo" onClick={() => scrollTo('home')}>
          <img src={logo} alt="Octal Logo" className="navbar__logo-img" />
          <span className="navbar__logo-text"></span>
        </div>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button onClick={() => scrollTo(item.id)} className="navbar__link">
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
