import { useState } from 'react';

export const FALLBACK_IMG = '/images/hero-suv.svg';

/** Imagen que se amplía siguiendo el cursor (en pantallas con mouse). */
export default function ZoomImage({ src, alt, scale = 2 }) {
  const [style, setStyle] = useState({});
  const [failed, setFailed] = useState(false);

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setStyle({ transformOrigin: `${x}% ${y}%`, transform: `scale(${scale})` });
  };

  return (
    <div className="zoom-box" onMouseMove={move} onMouseLeave={() => setStyle({})}>
      <img
        src={failed || !src ? FALLBACK_IMG : src}
        alt={alt}
        style={style}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
