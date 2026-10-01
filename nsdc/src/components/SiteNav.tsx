import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Home', to: '/', kanji: '家' },
  { label: 'About', to: '/about', kanji: '紹' },
  { label: 'Events', to: '/events', kanji: '祭' },
  { label: 'Projects', to: '/projects', kanji: '創' },
  { label: 'Team', to: '/team', kanji: '組' },
  { label: 'Contact', to: '/contact', kanji: '信' },
];

export default function SiteNav({ brandReady = true, brandTargetRef }: {
  brandReady?: boolean;
  brandTargetRef?: { current: HTMLElement | null };
} = {}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll while the drawer is open (and clean up on unmount).
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <header className="site-nav">
      <div className="site-shell nav-inner">
        <Link className="brand-lockup" to="/" aria-label="NSDC × Informatrix — home">
          <span
            className="brand-nsdc"
            ref={el => { if (brandTargetRef) brandTargetRef.current = el; }}
          >
            {brandReady ? (
              <>
                <img src="/brands/djs-nsdc-logo.png" alt="DJS NSDC logo" />
                <img src="/brands/infomatrix-alt.png" alt="Informatrix wordmark" />
              </>
            ) : (
              <span className="brand-ghost" aria-hidden="true" />
            )}
            <strong>NSDC × Informatrix</strong>
          </span>
        </Link>
        <nav className="desktop-links sumi-nav" aria-label="Main navigation">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              <span className="nav-kanji" aria-hidden="true">{link.kanji}</span>{link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <nav id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
        {links.map((link, index) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span>{link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
