import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { PortalFieldCollection } from '@designcodeio/threeui';
import SiteNav from './components/SiteNav';
import SiteLoader from './components/SiteLoader';
import { SiteFooter } from './JointHomepage';
import HomePage from './HomePage';
import {
  AboutPage,
  ContactPage,
  EventsPage,
  NotFoundPage,
  ProjectsPage,
  ScrollToTop,
  TeamPage,
} from './pages';

/**
 * Events is a bare stage: globe + flowers only, no footer banner below it.
 */
const CLOUDED_ROUTES = ['/about', '/projects', '/team', '/contact'];

function Shell() {
  const { pathname } = useLocation();
  const [loaded, setLoaded] = useState(false);
  const brandRef = useRef<HTMLElement | null>(null);
  const clouded = CLOUDED_ROUTES.includes(pathname);
  const onHome = pathname === '/';
  /* The loading ritual replays on every arrival at Home. */
  useEffect(() => {
    if (onHome) setLoaded(false);
  }, [pathname, onHome]);
  return (
    <div className={`page${clouded ? ' page--clouded' : ''}`}>
      {!loaded && onHome && <SiteLoader targetRef={brandRef} onDone={() => setLoaded(true)} />}
      {clouded && (
        <div className="route-clouds" aria-hidden="true">
          <PortalFieldCollection variant="cloud-field" hue={0} saturation={1} brightness={1} />
        </div>
      )}
      <SiteNav brandReady={loaded} brandTargetRef={brandRef} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {pathname !== '/events' && <SiteFooter />}
    </div>
  );
}

/**
 * The homepage composes the immersive NSDC × INFORMATRIX experience (the
 * registered Three.js night-walk scene, rebranded) followed by the existing
 * editorial sections. All other routes render inside the shared shell.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Shell />
    </BrowserRouter>
  );
}
