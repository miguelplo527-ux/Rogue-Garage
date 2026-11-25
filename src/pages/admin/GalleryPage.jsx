import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { galleryService } from '../../services/galleryService';
import { storageService } from '../../services/storageService';

const box = { background: '#1d2430', border: '1px solid #4b576b', borderRadius: 10, padding: '1.25rem' };
const input = { width: '100%', padding: '0.8rem', background: '#10141b', border: '1px solid #4b576b', color: '#fff', borderRadius: 6 };

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [vehicle, setVehicle] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = () => galleryService.getAll().then(setPhotos).catch((e) => { console.error(e); toast.error('No se pudo cargar la galería (¿ejecutaste el SQL?)'); });
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error('Elige una foto');
    setBusy(true);
    try {
      const url = await storageService.uploadImage(file, 'clientes');
      await galleryService.create({ image_url: url, caption: caption.trim(), vehicle: vehicle.trim() });
      toast.success('Foto agregada al carrusel');
      setVehicle(''); setCaption(''); fileRef.current.value = '';
      load();
    } catch (err) {
      toast.error(err.message || 'No se pudo subir la foto');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Quitar esta foto del carrusel?')) return;
    try { await galleryService.remove(id); toast.success('Foto eliminada'); load(); } catch { toast.error('No se pudo eliminar'); }
  };

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: '0.5rem' }}>Galería de clientes</h1>
      <p style={{ color: '#aab2c0', marginBottom: '1.5rem' }}>Estas fotos aparecen en el carrusel de la página de inicio.</p>

      <form onSubmit={upload} style={{ ...box, display: 'grid', gap: '1rem', maxWidth: 560, marginBottom: '2rem' }}>
        <input ref={fileRef} type="file" accept="image/*" style={input} aria-label="Foto" />
        <input placeholder="Vehículo (Ej: Toyota TXL)" value={vehicle} onChange={(e) => setVehicle(e.target.value)} style={input} />
        <input placeholder="Descripción corta (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)} style={input} />
        <button type="submit" disabled={busy} style={{ padding: '0.9rem', background: '#c8a874', color: '#1a1408', fontWeight: 'bold', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {busy ? 'Subiendo...' : 'Agregar foto'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {photos.map((p) => (
          <div key={p.id} style={box}>
            <img src={p.image_url} alt={p.caption || 'Foto de cliente'} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6 }} />
            <p style={{ color: '#fff', margin: '0.5rem 0 0', fontWeight: 600 }}>{p.vehicle || 'Sin título'}</p>
            <p style={{ color: '#aab2c0', fontSize: '0.85rem' }}>{p.caption}</p>
            <button onClick={() => remove(p.id)} style={{ marginTop: 8, background: 'none', border: 'none', color: '#ef6b6f', cursor: 'pointer', fontWeight: 600 }}>Quitar</button>
          </div>
        ))}
        {photos.length === 0 && <p style={{ color: '#aab2c0' }}>Aún no hay fotos. Sube la primera.</p>}
      </div>
    </div>
  );
}
