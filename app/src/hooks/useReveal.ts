import { useEffect, useRef, useState } from "react";

/* Reveals fire ON MOUNT with a stagger, never gated on the viewport, so a
   full page screenshot shows every section and nothing is ever stranded at
   zero opacity. Motion is transform and clip only. */
export function useReveal(delay = 0) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 60 + delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return shown;
}

/* Pointer physics for the one magnetic element on the page. Values live in
   refs and are written straight to style, never through state. */
export function useMagnet(strength = 0.16) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 1.6;
      tx = near ? dx * strength : 0;
      ty = near ? dy * strength : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [strength]);
  return ref;
}
