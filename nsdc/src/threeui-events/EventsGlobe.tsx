import { useEffect, useRef, useState, type CSSProperties } from "react";

import orbGallerySource from "./sources/orb-gallery-events.html?raw";

export type EventPhoto = { id: number; src: string; name: string; type: string; note: string };

/* The 11 full-resolution event photographs on the sphere. Names, types and
   notes repeat the committee's own event copy — nothing invented, no dates
   were ever published for these records. */
export const EVENT_PHOTOS: EventPhoto[] = [
  { id: 0, src: '/events/hackops.webp', name: 'HackOps', type: 'Hackathon', note: 'Build through the night with the committee — teams, mentors and a demo floor at dawn.' },
  { id: 1, src: '/events/technograd.webp', name: 'Technograd', type: 'Flagship', note: 'The committee\u2019s flagship technology gradation event — projects judged, winners celebrated on stage.' },
  { id: 2, src: '/globe/previous/design-dojo.jpg', name: 'Design Dojo', type: 'Workshop', note: 'Design practice, session after session.' },
  { id: 3, src: '/globe/previous/inauguration.jpg', name: 'Inauguration', type: 'Ceremony', note: 'Where the chapter began.' },
  { id: 4, src: '/globe/previous/synergy.jpg', name: 'Synergy', type: 'Hackathon', note: 'The synergy of data and building, from earlier editions.' },
  { id: 5, src: '/globe/previous/technograd.jpg', name: 'Technograd', type: 'Flagship', note: 'From the Technograd archive.' },
  { id: 6, src: '/globe/seminar-audience.jpg', name: 'Seminars', type: 'Series', note: 'A full seminar room during a committee session.' },
  { id: 7, src: '/globe/seminar-session.jpg', name: 'Seminars', type: 'Series', note: 'A committee seminar session.' },
  { id: 8, src: '/globe/technograd-audience.jpg', name: 'Technograd', type: 'Flagship', note: 'The Technograd audience.' },
  { id: 9, src: '/globe/technograd-runnerup.jpg', name: 'Technograd', type: 'Awards', note: 'A runner-up moment at Technograd.' },
  { id: 10, src: '/globe/technograd-winners.jpg', name: 'Technograd — Winners', type: 'Awards', note: 'Winners celebrated on stage at Technograd.' },
];

export type EventsGlobeProps = {
  className?: string;
  style?: CSSProperties;
  onSelect?: (photo: EventPhoto) => void;
};

/* The canonical OrbGallery scene, fed with the committee's event-photo atlas.
   Geometry, animation, drag inertia and hover behaviour are untouched. */
export function EventsGlobe({ className = "", style, onSelect }: EventsGlobeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === "undefined" || !document.hidden
  ));
  const [hostVisible, setHostVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setHostVisible(entry?.isIntersecting ?? true);
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const mounted = hostVisible && documentVisible;

  useEffect(() => {
    setReady(false);
  }, [mounted]);

  /* Card clicks arrive here from the embedded scene (see TILE_PHOTO bridge). */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { type?: string; photo?: number } | null;
      if (!data || data.type !== 'events-globe:select') return;
      const photo = EVENT_PHOTOS.find(p => p.id === data.photo);
      if (!photo) return;
      /* The click landed inside the iframe, so it holds keyboard focus —
         hand it back or Escape/arrows would go to the scene, not the viewer. */
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      selectRef.current?.(photo);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div
      ref={hostRef}
      className={`events-globe${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Interactive sphere of committee event photographs"
      data-state={!mounted ? "paused" : ready ? "ready" : "loading"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#08070D",
        pointerEvents: "auto",
        ...style,
      }}
    >
      {mounted ? (
        <iframe
          ref={frameRef}
          title="Event photo sphere"
          srcDoc={orbGallerySource}
          sandbox="allow-scripts"
          loading="eager"
          onLoad={() => setReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            background: "#08070D",
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
            transition: "opacity 240ms ease-out",
          }}
        />
      ) : null}
    </div>
  );
}
