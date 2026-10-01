import { useEffect, useRef, useState } from 'react';
import { PetalFall } from '../threeui-events/PetalFall';

const LOAD_MS = 2600;
const HOLD_MS = 350;
const FLY_MS = 1150;

type Props = {
  /** Ref of the nav brand slot the logos fly into. */
  targetRef: React.RefObject<HTMLElement | null>;
  onDone: () => void;
};

/* First-visit loader: home-page logos over a 0→100 bar, then the logo row
   lifts off the bar and glides into the nav's left corner, slow and smooth. */
export default function SiteLoader({ targetRef, onDone }: Props) {
  const [pct, setPct] = useState(0);
  const [flying, setFlying] = useState(false);
  const [gone, setGone] = useState(false);
  const logosRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / LOAD_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setFlying(true), HOLD_MS);
    };
    raf = requestAnimationFrame(tick);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, []);

  /* When the bar hits 100, fly the logo row into the nav corner. */
  useEffect(() => {
    if (!flying) return;
    const logos = logosRef.current;
    const target = targetRef.current;
    if (!logos || !target) {
      doneRef.current();
      return;
    }
    const from = logos.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width || !to.width) {
      doneRef.current();
      return;
    }
    const scale = to.width / from.width;
    const dx = to.left + (to.width - from.width * scale) / 2 - from.left;
    const dy = to.top - from.top;
    logos.style.transformOrigin = 'top left';
    const anim = logos.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.82}px, ${dy * 0.94}px) scale(${(1 + scale) / 2})`, opacity: 1, offset: 0.72 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 1 },
      ],
      { duration: FLY_MS, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' },
    );
    const finish = () => {
      setGone(true);
      setTimeout(() => doneRef.current(), 420);
    };
    anim.onfinish = finish;
    return () => anim.cancel();
  }, [flying, targetRef]);

  return (
    <div className={`site-loader${gone ? ' is-gone' : ''}`} aria-hidden={gone} role="status" aria-label="Loading site">
      <PetalFall density={30} />
      <img className="loader-branch loader-branch-bl" src="/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp" alt="" aria-hidden="true" />
      <div className="loader-inner">
        <div className="loader-scene" aria-hidden="true">
          <div className="loader-sun" style={{ bottom: `${10 + pct * 0.52}%` }} />
          <svg className="loader-peaks" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice">
            <path d="M0 160 L0 110 L70 60 L130 100 L200 40 L270 95 L330 65 L400 105 L400 160 Z" fill="#2A1650" />
            <path d="M0 160 L0 130 L90 85 L170 120 L250 75 L330 115 L400 90 L400 160 Z" fill="#1B0F38" />
            <path d="M0 160 L0 145 L120 115 L230 140 L320 120 L400 135 L400 160 Z" fill="#120A26" />
          </svg>
          <div className="loader-mist" />
        </div>
        <div ref={logosRef} className="loader-logos">
          <img src="/brands/djs-nsdc-logo.png" alt="" />
          <img src="/brands/infomatrix-alt.png" alt="" />
        </div>
        <p className="loader-pct">{String(pct).padStart(3, '0')}</p>
        <div className="loader-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
    </div>
  );
}
