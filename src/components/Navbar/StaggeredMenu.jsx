import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './StaggeredMenu.css';

/* Mobile-only navigation: a full-height panel that slides in behind two
   colour layers, with the links revealed one after another. */
export default function StaggeredMenu({ items, isActive, onSelect }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const layersRef = useRef([]);
  const linksRef = useRef([]);

  const setLayer = (index) => (el) => {
    layersRef.current[index] = el;
  };
  const setLink = (index) => (el) => {
    linksRef.current[index] = el;
  };

  /* The resting position lives here rather than in CSS: if both gsap and a
     stylesheet write `transform`, gsap reads the CSS offset as `x` and then
     stacks `xPercent` on top, leaving the panel a full width off-screen even
     when open. Running before paint keeps it from flashing into view. */
  useLayoutEffect(() => {
    gsap.set([...layersRef.current, panelRef.current].filter(Boolean), { xPercent: 100 });
    gsap.set(linksRef.current.filter(Boolean), { yPercent: 120, autoAlpha: 0 });
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    const layers = layersRef.current.filter(Boolean);
    const links = linksRef.current.filter(Boolean);
    if (!panel) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = gsap.timeline({ defaults: { ease: open ? 'power4.out' : 'power3.in' } });

    if (open) {
      tl.to(layers, { xPercent: 0, duration: reduced ? 0 : 0.5, stagger: 0.07 })
        .to(panel, { xPercent: 0, duration: reduced ? 0 : 0.55 }, '-=0.34')
        .to(links, { yPercent: 0, autoAlpha: 1, duration: reduced ? 0 : 0.45, stagger: 0.06 }, '-=0.22');
    } else {
      tl.to(links, { yPercent: -60, autoAlpha: 0, duration: reduced ? 0 : 0.2 })
        .to([panel, ...layers], { xPercent: 100, duration: reduced ? 0 : 0.4, stagger: 0.04 }, '-=0.1')
        .set(links, { yPercent: 120 });
    }

    /* kill, not revert — reverting strips the inline transform and would snap
       the panel shut before the closing tween could play. */
    return () => tl.kill();
  }, [open]);

  /* Keep the page behind the panel from scrolling, and allow Escape to close. */
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (item) => {
    setOpen(false);
    onSelect(item);
  };

  return (
    <div className={`staggered-menu ${open ? 'staggered-menu--open' : ''}`}>
      <button
        type="button"
        className="staggered-menu__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="staggered-navigation"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span className="staggered-menu__toggle-label" aria-hidden="true">
          <span className="staggered-menu__toggle-word">Menu</span>
          <span className="staggered-menu__toggle-word">Close</span>
        </span>
        <span className="staggered-menu__icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div className="staggered-menu__layer" ref={setLayer(0)} aria-hidden="true" />
      <div className="staggered-menu__layer staggered-menu__layer--two" ref={setLayer(1)} aria-hidden="true" />

      <nav
        id="staggered-navigation"
        className="staggered-menu__panel"
        ref={panelRef}
        aria-label="Primary navigation"
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="staggered-menu__list">
          {items.map((item, index) => (
            <li key={item.label} className="staggered-menu__item">
              <button
                type="button"
                ref={setLink(index)}
                className={`staggered-menu__link ${isActive(item) ? 'staggered-menu__link--active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <span className="staggered-menu__index" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
