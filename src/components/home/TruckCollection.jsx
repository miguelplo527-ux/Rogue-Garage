import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TRUCKS, getTruckImage } from '../../data/truckCollection';
import './TruckCollection.css';

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ease4 = (p) => 1 - Math.pow(1 - p, 4); // quartic-out
const ease3 = (p) => 1 - Math.pow(1 - p, 3);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function TruckCollection({ trucks = TRUCKS, title = 'Colección' }) {
  const count = trucks.length;
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  const [selected, setSelected] = useState(null);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const veilRef = useRef(null);
  const overlayRef = useRef(null);
  const detailRef = useRef(null);
  const backRef = useRef(null);
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);
  const apiRef = useRef(null);
  const S = useRef({
    W: 0, H: 0, cw: 0, gap: 0, cycle: 1,
    offset: 0, target: 0, vel: 0,
    drag: false, lastX: 0, lastT: 0, moved: 0, blockClick: false,
    t: 0, dir: 0, sel: -1, rect: null, opener: null,
  });

  const list = mobile ? trucks : [...trucks, ...trucks, ...trucks];
  const n = list.length;

  // Detecta móvil (< 768px)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const on = () => setMobile(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);

  // Motor de la animación
  useLayoutEffect(() => {
    const sec = sectionRef.current;
    const track = trackRef.current;
    if (!sec || !track || !count) return undefined;
    const s = S.current;
    Object.assign(s, { sel: -1, dir: 0, t: 0, rect: null, vel: 0, drag: false, opener: null });
    setSelected(null);
    if (mobile) track.style.transform = '';

    const cfg = mobile
      ? { T: 1250, expand: 1000, veilDelay: 450, veilDur: 800 }
      : { T: 2000, expand: 1400, veilDelay: 1000, veilDur: 1000 };

    const layout = () => {
      s.W = sec.clientWidth;
      s.H = sec.clientHeight;
      s.cw = s.W * 0.22;
      s.gap = s.W * 0.03;
      s.cycle = (s.cw + s.gap) * count;
      sec.style.setProperty('--w', `${s.W}px`);
      sec.style.setProperty('--cw', `${s.cw}px`);
      sec.style.setProperty('--gap', `${s.gap}px`);
    };

    const txNow = () => {
      const wrapped = ((s.offset % s.cycle) + s.cycle) % s.cycle;
      return -s.cycle - wrapped + 0.27 * s.W;
    };

    const draw = () => {
      if (!s.W) return;
      const { W, H, cw, gap } = s;
      const cardEls = cardRefs.current;
      const imgEls = imgRefs.current;
      const p = ease4(clamp01(s.t / cfg.expand));
      const q = ease3(clamp01((s.t - cfg.veilDelay) / cfg.veilDur));
      const hasOverlay = !!overlayRef.current;

      if (!mobile) {
        const unit = cw + gap;
        const tx = txNow();
        track.style.transform = `translate3d(${tx}px,0,0)`;
        const trackH = 0.47 * H;
        const selCenter = s.sel >= 0 ? s.sel * unit + cw / 2 + tx : 0;
        for (let i = 0; i < n; i++) {
          const card = cardEls[i];
          const img = imgEls[i];
          if (!card || !img) continue;
          const center = i * unit + cw / 2 + tx;
          const m = i % 3;
          const oy = (m === 0 ? -0.07 : m === 1 ? 0.07 : 0) * trackH;
          let dx = 0;
          if (s.sel >= 0 && i !== s.sel) dx = (center < selCenter ? -1 : 1) * 0.5 * W * p;
          card.style.transform = `translate3d(${dx}px,${oy}px,0)`;
          const par = clamp(-0.25 * (center - W / 2), -0.45 * cw, 0.45 * cw);
          img.style.transform = `translate3d(${par}px,0,0)`;
          card.style.visibility = i === s.sel && hasOverlay ? 'hidden' : '';
        }
      } else {
        for (let i = 0; i < n; i++) {
          const card = cardEls[i];
          const img = imgEls[i];
          if (!card || !img) continue;
          img.style.transform = '';
          if (s.sel >= 0 && i !== s.sel) {
            const order = i < s.sel ? i : i - 1;
            const l = clamp01((s.t - order * 30) / 350);
            card.style.opacity = String(1 - l);
            card.style.transform = `translate3d(0,${20 * l}px,0)`;
          } else {
            card.style.opacity = '';
            card.style.transform = '';
          }
          card.style.visibility = i === s.sel && hasOverlay ? 'hidden' : '';
        }
      }

      const veil = veilRef.current;
      if (veil) veil.style.transform = `translate3d(${s.sel >= 0 ? (1 - q) * 101 : 101}%,0,0)`;

      const overlay = overlayRef.current;
      if (overlay && s.rect) {
        const r = s.rect;
        const to = { l: 0.075 * W, t: 0.19 * H, w: 0.85 * W, h: 0.61 * H };
        overlay.style.left = `${r.l + (to.l - r.l) * p}px`;
        overlay.style.top = `${r.t + (to.t - r.t) * p}px`;
        overlay.style.width = `${r.w + (to.w - r.w) * p}px`;
        overlay.style.height = `${r.h + (to.h - r.h) * p}px`;
      }

      const detail = detailRef.current;
      if (detail) {
        detail.style.opacity = String(q);
        detail.style.transform = `translateY(${(1 - q) * 12}px)`;
        detail.style.pointerEvents = q > 0.9 ? 'auto' : 'none';
      }
    };

    const finishClose = () => {
      const op = s.opener;
      s.t = 0; s.dir = 0; s.sel = -1; s.rect = null; s.opener = null;
      setSelected(null);
      requestAnimationFrame(() => op && op.focus({ preventScroll: true }));
    };

    const openAt = (i, btn, fromKeyboard) => {
      if (s.sel >= 0) return;
      if (!mobile && !fromKeyboard && s.blockClick) { s.blockClick = false; return; }
      s.blockClick = false;
      const secR = sec.getBoundingClientRect();
      const mask = btn.querySelector('.tc-mask');
      const r = (mask || btn).getBoundingClientRect();
      s.rect = { l: r.left - secR.left, t: r.top - secR.top, w: r.width, h: r.height };
      s.sel = i;
      s.opener = btn;
      if (reduced()) { s.t = cfg.T; s.dir = 0; } else { s.t = 0; s.dir = 1; }
      setSelected(i);
    };

    const close = () => {
      if (s.sel < 0 || s.dir < 0) return;
      if (reduced()) { finishClose(); return; }
      s.dir = -1;
    };

    const step = (dir) => {
      if (s.sel >= 0) return;
      if (mobile) {
        const c = cardRefs.current[0];
        if (!c) return;
        track.scrollBy({ top: dir * (c.offsetHeight + s.W * 0.15), behavior: reduced() ? 'auto' : 'smooth' });
      } else {
        s.target += dir * (s.cw + s.gap);
        s.vel = 0;
      }
    };

    const ensureVisible = (el, i) => {
      if (mobile || s.sel >= 0) return;
      if (!el.matches(':focus-visible')) return;
      const unit = s.cw + s.gap;
      const tx = txNow();
      const k = i % count;
      let best = null;
      for (let j = 0; j < 3; j++) {
        const c = (k + j * count) * unit + s.cw / 2 + tx;
        if (best === null || Math.abs(c - s.W / 2) < Math.abs(best - s.W / 2)) best = c;
      }
      if (best - s.cw / 2 < 0 || best + s.cw / 2 > s.W) s.target = s.offset + (best - s.W / 2);
    };

    // ----- Arrastre -----
    const onMove = (e) => {
      if (!s.drag) return;
      const now = performance.now();
      const dx = s.lastX - e.clientX;
      const el = now - s.lastT;
      s.target += dx;
      s.moved += Math.abs(dx);
      s.vel = 0.65 * s.vel + (0.35 * dx) / Math.max(8, el);
      s.lastX = e.clientX;
      s.lastT = now;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      s.drag = false;
      track.classList.remove('is-dragging');
      if (performance.now() - s.lastT > 90) s.vel = 0;
      s.blockClick = s.blockClick || s.moved > 6 || Math.abs(s.vel) > 0.15;
    };
    const onDown = (e) => {
      if (mobile || s.sel >= 0) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      s.blockClick = Math.abs(s.vel) > 0.15;
      s.drag = true;
      s.moved = 0;
      s.lastX = e.clientX;
      s.lastT = performance.now();
      s.vel = 0;
      s.target = s.offset;
      track.classList.add('is-dragging');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    const onKey = (e) => {
      if (e.key === 'Escape' && s.sel >= 0) { close(); return; }
      if (s.sel >= 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    };
    sec.addEventListener('keydown', onKey);

    // ----- Reloj único (se pausa si no está visible) -----
    let raf = 0;
    let last = 0;
    let running = false;
    let visible = true;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      const k = dt / 16.667;
      if (!mobile) {
        if (!s.drag && s.sel < 0) {
          s.target += s.vel * clamp(dt, 8, 32) * 1.7;
          s.vel *= Math.pow(0.91, k);
          if (Math.abs(s.vel) < 0.001) s.vel = 0;
        }
        s.offset += (s.target - s.offset) * (1 - Math.pow(1 - 0.18, k));
      }
      if (s.dir !== 0) {
        s.t += s.dir * dt;
        if (s.dir > 0 && s.t >= cfg.T) { s.t = cfg.T; s.dir = 0; }
        else if (s.dir < 0 && s.t <= 0) finishClose();
      }
      draw();
    };
    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(sec);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver(() => { layout(); draw(); });
    ro.observe(sec);

    layout();
    draw();
    start();

    apiRef.current = {
      draw, onDown, step, close,
      click: (e, i) => openAt(i, e.currentTarget, e.detail === 0),
      focus: (e, i) => ensureVisible(e.currentTarget, i),
    };

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      sec.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      apiRef.current = null;
    };
  }, [mobile, count, n]);

  // Al abrir/cerrar, dibuja el cuadro inmediatamente (evita parpadeos)
  useLayoutEffect(() => {
    apiRef.current?.draw();
  }, [selected]);

  useEffect(() => {
    if (selected !== null) backRef.current?.focus({ preventScroll: true });
  }, [selected]);

  const open = selected !== null;
  const current = open ? trucks[selected % count] : null;

  return (
    <section
      ref={sectionRef}
      className={`tc${mobile ? ' is-mobile' : ''}${open ? ' is-open' : ''}`}
      aria-labelledby="tc-title"
    >
      <h2 id="tc-title" className="tc-title">{title}</h2>

      <div
        ref={trackRef}
        className="tc-track"
        role="list"
        aria-label="Camionetas"
        onPointerDown={(e) => apiRef.current?.onDown(e)}
      >
        {list.map((t, i) => {
          const dup = !mobile && i >= count;
          return (
            <div
              key={`${t.id}-${i}`}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="tc-card"
              role="listitem"
              aria-hidden={dup ? 'true' : undefined}
            >
              <button
                type="button"
                className="tc-btn"
                tabIndex={dup || open ? -1 : 0}
                aria-label={`Ver ${t.name}`}
                aria-expanded={selected === i}
                onClick={(e) => apiRef.current?.click(e, i)}
                onFocus={(e) => apiRef.current?.focus(e, i)}
              >
                <span className="tc-mask">
                  <img
                    ref={(el) => { imgRefs.current[i] = el; }}
                    className="tc-img"
                    src={getTruckImage(t)}
                    alt=""
                    draggable={false}
                    decoding="async"
                  />
                </span>
                <span className="tc-name">{t.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="tc-controls">
        <button
          type="button"
          className="tc-nav"
          aria-label="Anterior"
          disabled={open}
          onClick={() => apiRef.current?.step(-1)}
        >
          <i className={`fa-solid ${mobile ? 'fa-arrow-up' : 'fa-arrow-left'}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="tc-nav"
          aria-label="Siguiente"
          disabled={open}
          onClick={() => apiRef.current?.step(1)}
        >
          <i className={`fa-solid ${mobile ? 'fa-arrow-down' : 'fa-arrow-right'}`} aria-hidden="true" />
        </button>
      </div>

      <div ref={veilRef} className="tc-veil" aria-hidden="true" />

      {open && (
        <>
          <img
            ref={overlayRef}
            className="tc-overlay"
            src={getTruckImage(current)}
            alt=""
            aria-hidden="true"
          />
          <div ref={detailRef} className="tc-detail" role="region" aria-label={current.name}>
            <div className="tc-detail-text">
              <h3>{current.name}</h3>
              <p>{current.description}</p>
            </div>
            <button
              ref={backRef}
              type="button"
              className="tc-back"
              onClick={() => apiRef.current?.close()}
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver a la colección
            </button>
          </div>
        </>
      )}
    </section>
  );
}