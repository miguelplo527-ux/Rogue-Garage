import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TIDAL_LENS, getLensImages } from '../../data/tidalLens';
import './TidalLens.css';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uBefore;
uniform sampler2D uAfter;
uniform vec2 uRes;
uniform vec2 uSizeB;
uniform vec2 uSizeA;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec2 uVel;
uniform float uTime;
uniform float uRipple;
varying vec2 vUv;

vec2 cover(vec2 uv, vec2 img) {
  float rs = uRes.x / uRes.y;
  float ri = img.x / img.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 splitBefore(vec2 uv, vec2 o) {
  float r = texture2D(uBefore, cover(uv + o, uSizeB)).r;
  float g = texture2D(uBefore, cover(uv, uSizeB)).g;
  float b = texture2D(uBefore, cover(uv - o, uSizeB)).b;
  return vec3(r, g, b);
}

vec3 splitAfter(vec2 uv, vec2 o) {
  float r = texture2D(uAfter, cover(uv + o, uSizeA)).r;
  float g = texture2D(uAfter, cover(uv, uSizeA)).g;
  float b = texture2D(uAfter, cover(uv - o, uSizeA)).b;
  return vec3(r, g, b);
}

void main() {
  vec2 px = vUv * uRes;
  vec2 d = px - uCenter;
  float r = length(d);
  vec2 n = d / max(r, 0.0001);
  float ang = atan(d.y, d.x);
  float t = uTime * uRipple;

  // borde orgánico + deformación por velocidad del puntero
  float wob = 0.035 * sin(ang * 3.0 + t * 0.9)
            + 0.022 * sin(ang * 5.0 - t * 1.3)
            + 0.012 * sin(ang * 8.0 + t * 1.9);
  float sp = length(uVel);
  vec2 vd = sp > 0.001 ? uVel / sp : vec2(0.0);
  float stretch = min(sp * 0.005, 0.18);
  float R = uRadius * (1.0 + wob + stretch * dot(n, vd));
  float sd = (r - R) / uRadius;

  float aa = 1.5 / uRadius;
  float inside = 1.0 - smoothstep(-aa, aa, sd);

  // distorsión del muestreo cerca del borde
  float kIn = smoothstep(-0.38, 0.0, sd);
  float kOut = 1.0 - smoothstep(0.0, 0.3, sd);
  float band = exp(-pow(sd / 0.07, 2.0));
  float ripple = sin(r * 0.045 - uTime * 2.2) * uRipple;

  vec2 offIn = (-n * kIn * kIn * 0.16 * uRadius + n * ripple * band * 3.0) / uRes;
  vec2 offOut = (n * kOut * kOut * 0.05 * uRadius) / uRes;

  // separación RGB en el borde
  vec2 oSplit = n * (0.02 * uRadius * band) / uRes;

  vec3 colA = splitAfter(vUv + offIn, oSplit);
  vec3 colB = splitBefore(vUv + offOut, oSplit);
  vec3 col = mix(colB, colA, inside);

  // brillos de cristal en movimiento
  float hAng = t * 0.35 + 0.9;
  float h1 = pow(max(0.0, cos(ang - hAng)), 22.0);
  float h2 = pow(max(0.0, cos(ang - hAng - 3.14159)), 40.0) * 0.5;
  float ring = smoothstep(-0.16, -0.03, sd) * (1.0 - smoothstep(-0.03, 0.012, sd));
  col += vec3(1.0, 0.96, 0.88) * (h1 + h2) * ring * 0.55;
  col += vec3(0.78, 0.66, 0.45) * band * 0.10 * (0.5 + 0.5 * sin(ang * 2.0 - t));
  col += vec3(1.0) * (1.0 - smoothstep(0.0, 0.012, abs(sd))) * 0.22;

  gl_FragColor = vec4(col, 1.0);
}`;

export default function TidalLens() {
  const [mode, setMode] = useState('gl'); // 'gl' | 'css'
  const [diameter, setDiameter] = useState(55);
  const [locked, setLocked] = useState(false);

  const imgs = useMemo(() => getLensImages(), []);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef('gl');
  modeRef.current = mode;

  const S = useRef({
    tx: 0.5, ty: 0.5, cx: 0.5, cy: 0.5, vx: 0, vy: 0,
    d: 55, locked: false, down: false, dirty: true, reduced: false,
    ready: false, sizeB: [4, 3], sizeA: [4, 3],
  });

  // Respaldo sin WebGL: círculo CSS con la imagen "después"
  const syncCss = useCallback(() => {
    const st = stageRef.current;
    if (!st || modeRef.current !== 'css') return;
    const s = S.current;
    s.cx = s.tx;
    s.cy = s.ty;
    const r = st.getBoundingClientRect();
    st.style.setProperty('--lx', `${s.cx * 100}%`);
    st.style.setProperty('--ly', `${s.cy * 100}%`);
    st.style.setProperty('--lr', `${(s.d / 100) * Math.min(r.width, r.height) * 0.5}px`);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => { S.current.reduced = mql.matches; S.current.dirty = true; };
    on();
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    S.current.d = diameter;
    S.current.dirty = true;
    syncCss();
  }, [diameter, syncCss]);

  useEffect(() => { S.current.locked = locked; }, [locked]);

  useEffect(() => {
    if (mode !== 'css' || !stageRef.current) return undefined;
    syncCss();
    const ro = new ResizeObserver(syncCss);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [mode, syncCss]);

  // Motor WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return undefined;
    const s = S.current;
    s.ready = false;
    delete stage.dataset.ready;

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) { setMode('css'); return undefined; }

    let disposed = false;
    const fail = () => { if (!disposed) setMode('css'); };

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { fail(); return undefined; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fail(); return undefined; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ['uBefore', 'uAfter', 'uRes', 'uSizeB', 'uSizeA', 'uCenter', 'uRadius', 'uVel', 'uTime', 'uRipple']
      .forEach((name) => { u[name] = gl.getUniformLocation(prog, name); });
    gl.uniform1i(u.uBefore, 0);
    gl.uniform1i(u.uAfter, 1);

    const textures = [0, 1].map((unit) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([16, 20, 27, 255]));
      return tex;
    });

    let loaded = 0;
    const load = (src, unit) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (disposed) return;
        try {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } catch (err) {
          fail();
          return;
        }
        const size = [img.naturalWidth || 4, img.naturalHeight || 3];
        if (unit === 0) s.sizeB = size; else s.sizeA = size;
        loaded += 1;
        if (loaded === 2) {
          s.ready = true;
          s.dirty = true;
          stage.dataset.ready = '1';
        }
      };
      img.onerror = fail;
      img.src = src;
    };
    load(imgs.before, 0);
    load(imgs.after, 1);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(stage.clientWidth * dpr));
      const h = Math.max(1, Math.round(stage.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      s.dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const render = (now) => {
      const W = canvas.width;
      const H = canvas.height;
      gl.viewport(0, 0, W, H);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform2f(u.uSizeB, s.sizeB[0], s.sizeB[1]);
      gl.uniform2f(u.uSizeA, s.sizeA[0], s.sizeA[1]);
      gl.uniform2f(u.uCenter, s.cx * W, (1 - s.cy) * H);
      gl.uniform1f(u.uRadius, (s.d / 100) * Math.min(W, H) * 0.5);
      gl.uniform2f(u.uVel, s.vx * W, -s.vy * H);
      gl.uniform1f(u.uTime, now / 1000);
      gl.uniform1f(u.uRipple, s.reduced ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // Un solo reloj, se pausa si la sección no se ve o la pestaña está oculta
    let raf = 0;
    let last = 0;
    let running = false;
    let visible = true;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      const k = dt / 16.667;
      if (s.reduced) {
        if (s.cx !== s.tx || s.cy !== s.ty) { s.cx = s.tx; s.cy = s.ty; s.dirty = true; }
        s.vx = 0;
        s.vy = 0;
      } else {
        const a = 1 - Math.pow(1 - 0.12, k);
        const dx = (s.tx - s.cx) * a;
        const dy = (s.ty - s.cy) * a;
        s.cx += dx;
        s.cy += dy;
        s.vx += (dx / k - s.vx) * 0.25;
        s.vy += (dy / k - s.vy) * 0.25;
      }
      if (!s.ready) return;
      if (!s.reduced || s.dirty) {
        render(now);
        s.dirty = false;
      }
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
    io.observe(stage);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    start();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      textures.forEach((tex) => gl.deleteTexture(tex));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [imgs]);

  // ----- Entradas: mouse, touch, teclado -----
  const setNorm = (nx, ny) => {
    const s = S.current;
    s.tx = clamp(nx, 0, 1);
    s.ty = clamp(ny, 0, 1);
    s.dirty = true;
    syncCss();
  };
  const moveTo = (clientX, clientY) => {
    const st = stageRef.current;
    if (!st) return;
    const r = st.getBoundingClientRect();
    setNorm((clientX - r.left) / r.width, (clientY - r.top) / r.height);
  };
  const onPointerDown = (e) => {
    const s = S.current;
    if (s.locked) return;
    if (e.pointerType !== 'mouse') {
      s.down = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    }
    moveTo(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => {
    const s = S.current;
    if (s.locked) return;
    if (e.pointerType === 'mouse' || s.down) moveTo(e.clientX, e.clientY);
  };
  const onPointerEnd = () => { S.current.down = false; };
  const onKeyDown = (e) => {
    const s = S.current;
    if (s.locked) return;
    const step = e.shiftKey ? 0.15 : 0.05;
    const dir = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    }[e.key];
    if (!dir) return;
    e.preventDefault();
    setNorm(s.tx + dir[0], s.ty + dir[1]);
  };

  return (
    <div className="tl">
      <div
        ref={stageRef}
        className={`tl-stage${locked ? ' is-locked' : ''}`}
        role="group"
        tabIndex={0}
        aria-label={`Comparador: ${TIDAL_LENS.beforeLabel} y ${TIDAL_LENS.afterLabel}`}
        aria-describedby="tl-help"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        {mode === 'gl' ? (
          <canvas ref={canvasRef} className="tl-canvas" aria-hidden="true" />
        ) : (
          <>
            <img className="tl-img" src={imgs.before} alt={TIDAL_LENS.beforeLabel} draggable={false} />
            <img className="tl-img tl-after" src={imgs.after} alt={TIDAL_LENS.afterLabel} draggable={false} />
          </>
        )}
      </div>

      <div className="tl-controls">
        <label className="tl-size" htmlFor="tl-size">
          <span>Tamaño del lente</span>
          <input
            id="tl-size"
            type="range"
            min="25"
            max="90"
            step="1"
            value={diameter}
            onChange={(e) => setDiameter(Number(e.target.value))}
          />
        </label>
        <button
          type="button"
          className="tl-lock"
          aria-pressed={locked}
          onClick={() => setLocked((v) => !v)}
        >
          <i className={`fa-solid ${locked ? 'fa-lock' : 'fa-lock-open'}`} aria-hidden="true" /> Fijar posición
        </button>
      </div>
      <p id="tl-help" className="tl-hint">
        Mueve el lente para ver la Toyota TXL con Rogue Garage. Con teclado usa las flechas.
      </p>
    </div>
  );
}