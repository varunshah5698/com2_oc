import { useEffect, useRef } from "react";

type Petal = {
  x: number; y: number; s: number;
  vy: number; sway: number; phase: number;
  rot: number; vr: number; tumble: number;
  color: string; alpha: number;
};

const COLORS = ["#f4a7c3", "#e98bb8", "#b48be0", "#f8d7e8", "#d9a7e8"];

/* Sakura petal rain in the spirit of the home landing's leaf-fall: each petal
   tumbles (spins + thins edge-on and back, like a real 3D flip) as it drifts
   down. Pure canvas, no assets, pointer-transparent. */
export function PetalFall({ density = 70 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 0, h = 0;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let petals: Petal[] = [];

    const seed = () => {
      const n = window.innerWidth < 640 ? Math.round(density / 2.5) : density;
      petals = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = (anywhere = false): Petal => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20,
      s: 5 + Math.random() * 11,
      vy: 0.35 + Math.random() * 0.9,
      sway: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      tumble: 0.008 + Math.random() * 0.02,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: 0.45 + Math.random() * 0.45,
    });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;
    const frame = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.vy;
        p.x += Math.sin(t * p.sway + p.phase) * 0.5;
        p.rot += p.vr;
        if (p.y > h + 24) petals[i] = spawn();
        /* edge-on thin twice per tumble: the cheap 3D flip */
        const thin = Math.abs(Math.cos(t * p.tumble * 60 + p.phase));
        const sx = 0.25 + 0.75 * thin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(sx, 1);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [density]);

  return <canvas ref={canvasRef} className="petal-fall" aria-hidden="true" />;
}
