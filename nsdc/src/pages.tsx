import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Github, Globe, MapPin, Users, X } from 'lucide-react';
import { projects, insights } from './data/homepage';
import { useScrollReveal } from './JointHomepage';
import { EventsGlobe, EVENT_PHOTOS, type EventPhoto } from './threeui-events/EventsGlobe';
import { PetalFall } from './threeui-events/PetalFall';

function useRouteTitle(title: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} — NSDC × Informatrix`;
    return () => { document.title = previous; };
  }, [title, pathname]);
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* Linear-style spotlight: a violet glow tracks the cursor across card surfaces. */
function useSpotlight<T extends HTMLElement>() {
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const card = (e.currentTarget as T);
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.querySelectorAll<HTMLElement>('.spot-host').forEach(card => {
      card.addEventListener('pointermove', move as EventListener);
    });
    return () => document.querySelectorAll<HTMLElement>('.spot-host').forEach(card => {
      card.removeEventListener('pointermove', move as EventListener);
    });
  }, []);
}

/* Chapter numerals follow the nav order: every page is a stop on the walk,
   numbered 01–05 the way visitors meet them. */
const CHAPTER: Record<string, string> = {
  about: '01', events: '02', projects: '03', team: '04', contact: '05',
};

function PageHero({ eyebrow, title, lead, stat }: { eyebrow: string; title: ReactNode; lead: string; stat?: string }) {
  const { pathname } = useLocation();
  const chapter = CHAPTER[pathname.replace('/', '')] ?? '··';
  return (
    <section className="page-hero">
      <span className="ph-ghost" aria-hidden="true">{chapter}</span>
      <div className="site-shell ph-inner">
        <p className="ph-kicker reveal"><i /> {eyebrow}</p>
        <h1 className="reveal">{title}</h1>
        <p className="page-lead reveal">{lead}</p>
        {stat && <p className="ph-stat reveal">{stat}</p>}
      </div>
      <div className="ph-rule" aria-hidden="true" />
    </section>
  );
}

function SectionHead({ kicker, title, meta }: { kicker: string; title: ReactNode; meta?: string }) {
  return (
    <div className="sec-head reveal">
      <p className="ph-kicker"><i /> {kicker}</p>
      <div className="sec-head-row">
        <h2 className="section-title">{title}</h2>
        {meta && <span className="sec-meta">{meta}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ about */
const pillars = [
  {
    n: '01', title: 'National Student Data Corps — DJSCE chapter',
    body: 'The National Student Data Corps (NSDC), founded by the Northeast Big Data Innovation Hub at Columbia University, builds data-science fluency for students everywhere. Our DJSCE chapter brings that mission to campus: study circles, semester tracks and first steps into data for anyone curious enough to start.',
  },
  {
    n: '02', title: 'Team Informatrix — the tech club',
    body: 'Team Informatrix is the committee\u2019s building half: a student-run tech club that turns questions into projects — support chatbots, financial dashboards, vision experiments and full web applications, shipped through its public project archive and blog.',
  },
  {
    n: '03', title: 'Why “×”',
    body: 'One is a gateway into data science; the other is a workshop for building with it. Joined, they give DJSCE students a single path: explore the six domains, learn the craft together, and leave with something you made. Explore data. Build together.',
  },
];

const domains = [
  ['Artificial Intelligence', 'Intelligent systems, language models, responsible AI.'],
  ['Machine Learning', 'Patterns into models you can test and improve.'],
  ['Data Science', 'The story inside complex data, told honestly.'],
  ['Computational Finance', 'Quantitative thinking applied to markets.'],
  ['Web Development', 'From first sketch to working application.'],
  ['UI/UX Design', 'Technology made clearer, more useful, more human.'],
] as const;

export function AboutPage() {
  useRouteTitle('About');
  useScrollReveal();
  return (
    <main id="main">
      <PageHero
        eyebrow="CHAPTER 01 · ABOUT"
        title={<>Two teams, <em>one gateway.</em></>}
        lead="NSDC × Informatrix is the shared home of the DJSCE chapter of the National Student Data Corps and Team Informatrix — the college's AI & Data Science community and its tech club, walking the same path."
        stat="2 teams · 6 domains · 1 path"
      />
      <section className="page-section" aria-label="Who we are">
        <div className="site-shell">
          <SectionHead kicker="WHO WE ARE" title={<>The committee, <em>in three parts.</em></>} meta="3 PILLARS" />
          <div className="pillar-grid">
            {pillars.map(p => (
              <article className="pillar glass reveal" key={p.n}>
                <span className="pillar-n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section page-section--alt" aria-label="The six domains">
        <div className="site-shell">
          <SectionHead kicker="THE MAP" title={<>Six domains, <em>one community.</em></>} meta="6 DOMAINS" />
          <ul className="domain-tiles">
            {domains.map(([name, desc], i) => (
              <li className="domain-tile reveal" key={name}>
                <span className="tile-n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{name}</strong>
                  <span>{desc}</span>
                </div>
                <ArrowUpRight className="tile-arrow" size={16} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

/* ----------------------------------------------------------------- events */

export function EventsPage() {
  useRouteTitle('Events');
  const [selected, setSelected] = useState<EventPhoto | null>(null);
  const step = (d: 1 | -1) => setSelected(cur => {
    if (!cur) return cur;
    const i = EVENT_PHOTOS.findIndex(p => p.id === cur.id);
    return EVENT_PHOTOS[(i + d + EVENT_PHOTOS.length) % EVENT_PHOTOS.length];
  });
  return (
    <main id="main" className="events-orbit">
      <div className="orbit-stage">
        <div className="orbit-ellipse">
          <EventsGlobe onSelect={setSelected} />
        </div>
        <PetalFall density={110} />
        <img className="orbit-branch orbit-branch-bl" src="/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp" alt="" aria-hidden="true" />
        <img className="orbit-branch orbit-branch-br" src="/landing-pages/secret-pathways-assets/foreground/png/maple-leaves.webp" alt="" aria-hidden="true" />
        <img className="orbit-branch orbit-branch-tl" src="/landing-pages/secret-pathways-assets/foreground/png/maple-leaves.webp" alt="" aria-hidden="true" />
        <img className="orbit-branch orbit-branch-tr" src="/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp" alt="" aria-hidden="true" />
      </div>
      {selected && (
        <LiquidPhoto photo={selected} onClose={() => setSelected(null)} onStep={step} />
      )}
    </main>
  );
}

function LiquidPhoto({ photo, onClose, onStep }: { photo: EventPhoto; onClose: () => void; onStep: (d: 1 | -1) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);
  const pos = EVENT_PHOTOS.findIndex(p => p.id === photo.id) + 1;
  return (
    <div className="evt-liquid" role="dialog" aria-modal="true" aria-label={photo.name} onClick={onClose}>
      <span className="evt-blob evt-blob-a" aria-hidden="true" />
      <span className="evt-blob evt-blob-b" aria-hidden="true" />
      <button type="button" className="evt-lb-btn evt-lb-close" onClick={onClose} aria-label="Close photo viewer">
        <X size={20} aria-hidden="true" />
      </button>
      <button type="button" className="evt-lb-btn evt-lb-prev" aria-label="Previous photo" onClick={e => { e.stopPropagation(); onStep(-1); }}>
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <figure className="evt-liquid-figure" onClick={e => e.stopPropagation()}>
        <img src={photo.src} alt={photo.name} />
        <figcaption>
          <span className="evt-lb-type">{photo.type.toUpperCase()}</span>
          <div>
            <strong>{photo.name}</strong>
            <span className="evt-lb-note">{photo.note}</span>
          </div>
          <span className="evt-lb-count">{pos} / {EVENT_PHOTOS.length}</span>
        </figcaption>
      </figure>
      <button type="button" className="evt-lb-btn evt-lb-next" aria-label="Next photo" onClick={e => { e.stopPropagation(); onStep(1); }}>
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- projects */
export function ProjectsPage() {
  useRouteTitle('Projects');
  useScrollReveal();
  useSpotlight<HTMLElement>();
  return (
    <main id="main">
      <PageHero
        eyebrow="CHAPTER 03 · PROJECTS"
        title={<>Ideas, made <em>real.</em></>}
        lead="Selected student builds from the Informatrix archive — each one a walk through one of the six domains. The full archive lives on the official Informatrix site."
        stat="4 featured builds · 3 field notes"
      />
      <section className="page-section" aria-label="Project archive highlights">
        <div className="site-shell">
          <SectionHead kicker="STUDENT BUILDS" title={<>From the <em>workshop.</em></>} meta="4 BUILDS" />
          <div className="project-grid">
            {projects.map(project => (
              <article className="project-card glass spot-host reveal" key={project.index}>
                <span className="pc-glow" aria-hidden="true" />
                <span className="spot" aria-hidden="true" />
                <div className="project-copy">
                  <div className="project-meta">
                    <span className="pc-cat">{project.category}</span>
                    <span>IM—{project.index}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-card-bottom">
                    <div className="project-tags">{project.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div>
                    <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} in the Informatrix archive`}>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section page-section--alt" aria-label="Committee reading">
        <div className="site-shell">
          <SectionHead kicker="FROM THE COMMITTEE BLOG" title={<>Field <em>notes.</em></>} meta="3 NOTES" />
          <ul className="insight-list">
            {insights.map(insight => (
              <li className="reveal" key={insight.href}>
                <a className="glass" href={insight.href} target="_blank" rel="noopener noreferrer">
                  <span className="insight-cat">{insight.category}</span>
                  <strong>{insight.title}</strong>
                  <span className="insight-meta">{insight.author} · {insight.date} · {insight.readTime}</span>
                  <ArrowUpRight className="insight-arrow" size={17} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------- team */
const TEAM_FACTS = [
  ['06', 'domains explored together'],
  ['04', 'student builds shipped'],
  ['05', 'documented gatherings'],
];

export function TeamPage() {
  useRouteTitle('Team');
  useScrollReveal();
  return (
    <main id="main">
      <PageHero
        eyebrow="CHAPTER 04 · TEAM"
        title={<>The people on <em>the path.</em></>}
        lead="The committee's members, mentors and faculty are listed on the official Informatrix site, which stays in sync with the current teams."
      />
      <section className="page-section" aria-label="Team directory">
        <div className="site-shell team-panel-wrap">
          <div className="team-panel glass reveal">
            <div className="tp-copy">
              <span className="tp-icon"><Users size={26} aria-hidden="true" /></span>
              <h2>One roster, kept <em>honest.</em></h2>
              <p>
                Names and photographs change every semester; a copy on this site would go stale or
                invent people. The committee keeps one live directory instead — this page links
                straight to it so every face and role you see there is current.
              </p>
              <div className="tp-facts">
                {TEAM_FACTS.map(([n, label]) => (
                  <div className="tp-fact" key={label}>
                    <strong>{n}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="tp-cta">
              <a
                className="committee-cta"
                href={`${import.meta.env.VITE_INFO_SITE ?? 'https://djs-infomatrix.vercel.app'}/team`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the official directory <ArrowRight size={16} aria-hidden="true" />
              </a>
              <p className="page-note">
                Verification note: this site does not duplicate member names or photographs; it links
                to the live directory so no identity goes stale or invented here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------------------------------------------------------- contact */
export function ContactPage() {
  useRouteTitle('Contact');
  useScrollReveal();
  return (
    <main id="main">
      <PageHero
        eyebrow="CHAPTER 05 · CONTACT"
        title={<>Find the <em>gateway.</em></>}
        lead="Reach the committee through Informatrix's official channels — or find us on campus at DJSCE, Mumbai."
      />
      <section className="page-section" aria-label="Contact channels">
        <div className="site-shell">
          <SectionHead kicker="CHANNELS" title={<>Three ways <em>in.</em></>} meta="3 CHANNELS" />
          <div className="contact-grid">
            <a className="contact-card glass reveal" href="https://djs-infomatrix.vercel.app" target="_blank" rel="noopener noreferrer">
              <span className="cc-icon"><Globe size={22} aria-hidden="true" /></span>
              <strong>Informatrix website</strong>
              <span>djs-infomatrix.vercel.app — projects, blogs and the official directory.</span>
              <span className="cc-go">Visit <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <a className="contact-card glass reveal" href="https://github.com/DJS-INFOMATRIX" target="_blank" rel="noopener noreferrer">
              <span className="cc-icon"><Github size={22} aria-hidden="true" /></span>
              <strong>GitHub</strong>
              <span>github.com/DJS-INFOMATRIX — the committee's public code.</span>
              <span className="cc-go">Browse <ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
            <div className="contact-card glass reveal">
              <span className="cc-icon"><MapPin size={22} aria-hidden="true" /></span>
              <strong>Campus</strong>
              <span>Dwarkadas J. Sanghvi College of Engineering, Mumbai — AI &amp; Data Science department.</span>
              <span className="cc-go cc-static">Find us on campus</span>
            </div>
          </div>
          <p className="page-note reveal">
            Verification note: a dedicated committee email address is not published on the existing
            sites, so none is listed here. Channels above are the committee's own.
          </p>
        </div>
      </section>
    </main>
  );
}

export function NotFoundPage() {
  useRouteTitle('Not found');
  useScrollReveal();
  return (
    <main id="main" className="notfound">
      <span className="nf-ghost" aria-hidden="true">404</span>
      <div className="site-shell">
        <p className="ph-kicker reveal"><i /> 404 — OFF THE PATH</p>
        <h1 className="reveal">This path is <em>unlit.</em></h1>
        <p className="page-lead reveal">
          The page you were walking towards is not on the map. The gate, as always, is back at the start.
        </p>
        <Link className="committee-cta reveal" to="/">Back to the gate <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </main>
  );
}
