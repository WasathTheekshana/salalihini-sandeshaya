"use client";

import { useEffect, useId, useRef } from "react";

const SKIN = "#c98e5d";
const SKIN_DARK = "#a9744a";
const HAIR = "#1b1420";

/**
 * A small friendly engineer who watches your cursor. The pupils follow it quickly, the head
 * follows more lazily, the eyebrows lift when you look up, and now and then they blink.
 * Click for a surprised face. Everything is driven by one animation loop that writes straight
 * to the SVG, so it never re-renders React.
 */
export function Engineer({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const body = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const lidL = useRef<SVGRectElement>(null);
  const lidR = useRef<SVGRectElement>(null);
  const browL = useRef<SVGPathElement>(null);
  const browR = useRef<SVGPathElement>(null);
  const smile = useRef<SVGPathElement>(null);
  const oh = useRef<SVGEllipseElement>(null);
  const bird = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pointer = { x: 0, y: 0, seen: false, at: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.seen = true;
      pointer.at = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let surprised = 0; // seconds of surprise remaining
    const onDown = () => {
      surprised = 0.9;
    };
    el.addEventListener("pointerdown", onDown);

    const eye = { x: 0, y: 0 };
    const look = { x: 0, y: 0 };
    let near = 0;
    let nextBlink = performance.now() + 1400;
    let blinkT = -1;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = now / 1000;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.4;

      // where to look: at the cursor, or wander gently if it has not moved for a while
      let tx: number;
      let ty: number;
      let proximity = 0;
      if (pointer.seen && now - pointer.at < 6000) {
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const dist = Math.hypot(dx, dy);
        const s = Math.min(dist / (r.width * 0.9), 1);
        tx = (dx / Math.max(dist, 1)) * s;
        ty = (dy / Math.max(dist, 1)) * s;
        proximity = 1 - Math.min(dist / (r.width * 1.4), 1);
      } else if (reduce) {
        tx = 0;
        ty = 0;
      } else {
        tx = Math.sin(t * 0.55) * 0.55;
        ty = Math.sin(t * 0.4 + 1) * 0.25;
      }
      const eyeK = 1 - Math.exp(-dt * 12);
      const headK = 1 - Math.exp(-dt * 3.2);
      eye.x += (tx - eye.x) * eyeK;
      eye.y += (ty - eye.y) * eyeK;
      look.x += (tx - look.x) * headK;
      look.y += (ty - look.y) * headK;
      near += (proximity - near) * (1 - Math.exp(-dt * 4));
      surprised = Math.max(0, surprised - dt);
      const wow = Math.min(surprised / 0.25, 1);

      // blinking (a quick close and open; sometimes twice)
      if (!reduce && blinkT < 0 && now > nextBlink) blinkT = 0;
      let lid = 0;
      if (blinkT >= 0) {
        blinkT += dt;
        const d = 0.16;
        lid = blinkT < d ? Math.sin((blinkT / d) * Math.PI) : 0;
        if (blinkT >= d) {
          blinkT = -1;
          nextBlink = now + (Math.random() < 0.25 ? 220 : 2200 + Math.random() * 3200);
        }
      }

      // pupils slide inside the lenses
      const px = eye.x * 5.2;
      const py = eye.y * 4.4;
      pupilL.current?.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`);
      pupilR.current?.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`);

      // eyelids hang from the top of each lens
      const lidT = 82;
      for (const l of [lidL.current, lidR.current]) {
        l?.setAttribute("transform", `translate(0 ${lidT}) scale(1 ${lid.toFixed(3)}) translate(0 ${-lidT})`);
      }

      // head turns toward the cursor, pivoting at the neck
      const hx = look.x * 3.2;
      const hy = look.y * 2.2 - wow * 2;
      head.current?.setAttribute("transform", `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${(look.x * 6).toFixed(2)} 100 152)`);

      // eyebrows lift when looking up or surprised, and drop a little when looking down
      const lift = Math.max(0, -look.y) * 4 + wow * 5 - Math.max(0, look.y) * 1.5;
      browL.current?.setAttribute("transform", `translate(0 ${(-lift).toFixed(2)})`);
      browR.current?.setAttribute("transform", `translate(0 ${(-lift).toFixed(2)})`);

      // mouth: a bigger smile when the cursor is close, an "oh" on click
      if (smile.current) {
        const w = 11 + near * 4;
        const dep = 9 + near * 5;
        smile.current.setAttribute("d", `M${100 - w} 130 Q100 ${130 + dep} ${100 + w} 130`);
        smile.current.setAttribute("opacity", String(1 - wow));
      }
      oh.current?.setAttribute("opacity", String(wow));

      // breathing, and the little myna on the shoulder bobs and glances too
      const breathe = reduce ? 0 : Math.sin(t * 1.7) * 0.9;
      body.current?.setAttribute("transform", `translate(0 ${breathe.toFixed(2)})`);
      const bob = reduce ? 0 : Math.sin(t * 2.3 + 1) * 0.8;
      bird.current?.setAttribute("transform", `translate(0 ${(breathe + bob).toFixed(2)}) rotate(${(eye.x * 4).toFixed(2)} 140 166)`);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const clipL = `${uid}-cl`;
  const clipR = `${uid}-cr`;

  return (
    <svg
      ref={svg}
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label="A friendly cartoon engineer with glasses, watching your cursor"
    >
      <defs>
        <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#ffd58a" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffd58a" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipL}>
          <circle cx="78" cy="100" r="15.5" />
        </clipPath>
        <clipPath id={clipR}>
          <circle cx="122" cy="100" r="15.5" />
        </clipPath>
      </defs>
      <circle cx="100" cy="110" r="100" fill={`url(#${uid}-halo)`} />

      {/* torso: a hoodie */}
      <g ref={body}>
        <path d="M24 244 C24 196 52 170 100 170 C148 170 176 196 176 244 Z" fill="#3a2b7c" />
        <path d="M66 174 C78 192 122 192 134 174 C128 169 72 169 66 174 Z" fill="#2a1d5c" />
        <path d="M86 184 L84 210 M114 184 L116 210" stroke="#f2c46d" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="84" cy="211" r="2.6" fill="#f2c46d" />
        <circle cx="116" cy="211" r="2.6" fill="#f2c46d" />
        {/* neck */}
        <path d="M86 150 L86 172 C92 180 108 180 114 172 L114 150 Z" fill={SKIN_DARK} />

        {/* a little myna on the shoulder */}
        <g ref={bird}>
          <g transform="translate(126 148) scale(0.46)">
            <path d="M18 38 L5 45 L8 38.5 L5 32.5 Z" fill="#fff1d6" />
            <ellipse cx="30" cy="40" rx="15" ry="7.6" transform="rotate(-8 30 40)" fill="#fff1d6" />
            <path d="M27 38 C19 30 17 20 11 11 C23 12 33 20 39 35 Z" fill="#fffaf0" />
            <circle cx="44.5" cy="35.5" r="6.6" fill="#241a36" />
            <path d="M49.5 33.4 L59 36.8 L50 38.8 Z" fill="#f6c32c" />
            <circle cx="46" cy="34" r="1.7" fill="#f6c32c" />
            <circle cx="46.4" cy="34" r="0.7" fill="#241a36" />
          </g>
        </g>
      </g>

      {/* head */}
      <g ref={head}>
        <ellipse cx="54" cy="104" rx="7" ry="11" fill={SKIN} />
        <ellipse cx="146" cy="104" rx="7" ry="11" fill={SKIN} />
        <ellipse cx="100" cy="102" rx="46" ry="52" fill={SKIN} />
        <ellipse cx="68" cy="122" rx="9" ry="6" fill="#e0715c" opacity="0.18" />
        <ellipse cx="132" cy="122" rx="9" ry="6" fill="#e0715c" opacity="0.18" />

        {/* hair */}
        <path d="M53 94 C48 52 78 36 104 38 C134 38 154 58 147 94 C142 76 126 66 104 68 C80 66 62 76 53 94 Z" fill={HAIR} />
        <path d="M60 70 C76 56 104 54 130 62" stroke={HAIR} strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* eyebrows */}
        <path ref={browL} d="M62 80 Q78 72 93 80" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path ref={browR} d="M107 80 Q122 72 138 80" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* eyes: white lens, pupil, eyelid */}
        <circle cx="78" cy="100" r="15.5" fill="#fffdf8" />
        <circle cx="122" cy="100" r="15.5" fill="#fffdf8" />
        <g clipPath={`url(#${clipL})`}>
          <g ref={pupilL}>
            <circle cx="78" cy="100" r="7.2" fill="#2a1a12" />
            <circle cx="78" cy="100" r="3.4" fill="#0c0706" />
            <circle cx="75.6" cy="97.2" r="2" fill="#fff" />
          </g>
          <rect ref={lidL} x="60" y="82" width="36" height="36" fill={SKIN} transform="translate(0 82) scale(1 0) translate(0 -82)" />
        </g>
        <g clipPath={`url(#${clipR})`}>
          <g ref={pupilR}>
            <circle cx="122" cy="100" r="7.2" fill="#2a1a12" />
            <circle cx="122" cy="100" r="3.4" fill="#0c0706" />
            <circle cx="119.6" cy="97.2" r="2" fill="#fff" />
          </g>
          <rect ref={lidR} x="104" y="82" width="36" height="36" fill={SKIN} transform="translate(0 82) scale(1 0) translate(0 -82)" />
        </g>

        {/* glasses */}
        <circle cx="78" cy="100" r="18" fill="#ffffff" fillOpacity="0.1" stroke="#16112a" strokeWidth="4" />
        <circle cx="122" cy="100" r="18" fill="#ffffff" fillOpacity="0.1" stroke="#16112a" strokeWidth="4" />
        <path d="M95.5 98 Q100 93 104.5 98" stroke="#16112a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M60.2 98 L52 99 M139.8 98 L148 99" stroke="#16112a" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M68 88 Q73 85 78 86" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" fill="none" />
        <path d="M112 88 Q117 85 122 86" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" fill="none" />

        {/* nose and mouth */}
        <path d="M100 108 Q95 120 101 122" stroke={SKIN_DARK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path ref={smile} d="M89 130 Q100 139 111 130" stroke="#5a2a22" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <ellipse ref={oh} cx="100" cy="134" rx="5.4" ry="6.6" fill="#5a2a22" opacity="0" />
      </g>
    </svg>
  );
}
