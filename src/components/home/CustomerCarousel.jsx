import { useCallback, useEffect, useRef, useState } from 'react';
import { galleryService } from '../../services/galleryService';

const FALLBACK = [{ id: 'demo', image_url: '/images/hero-suv.svg', caption: 'Tu camioneta puede ser la próxima', vehicle: '', fallback: true }];

/** Carrusel de fotos de clientes (se alimenta de la tabla customer_photos). */
export default function CustomerCarousel() {
  const [slides, setSlides] = useState(FALLBACK);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    let alive = true;
    galleryService.getActive().then((rows) => { if (alive && rows.length) setSlides(rows); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const count = slides.length;
  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  // Avance automático (se detiene con el mouse encima o si el usuario prefiere menos movimiento)
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section
      className="carousel"
      aria-roledescription="carrusel"
      aria-label="Fotos de nuestros clientes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <figure className="carousel-slide" key={s.id} aria-hidden={i !== index} aria-label={`${i + 1} de ${count}`}>
            <img src={s.image_url} alt={s.caption || 'Camioneta de un cliente de Rogue Garage'} loading={i === 0 ? 'eager' : 'lazy'} className={s.fallback ? 'is-illustration' : ''} />
            {(s.caption || s.vehicle) && (
              <figcaption>
                {s.vehicle && <strong>{s.vehicle}</strong>}
                {s.caption && <span>{s.caption}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="carousel-btn prev" aria-label="Foto anterior" onClick={() => go(index - 1)}><i className="fa-solid fa-chevron-left" /></button>
          <button type="button" className="carousel-btn next" aria-label="Foto siguiente" onClick={() => go(index + 1)}><i className="fa-solid fa-chevron-right" /></button>
          <div className="carousel-dots">
            {slides.map((s, i) => (
              <button type="button" key={s.id} className={i === index ? 'active' : ''} aria-label={`Ir a la foto ${i + 1}`} aria-current={i === index} onClick={() => go(i)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
