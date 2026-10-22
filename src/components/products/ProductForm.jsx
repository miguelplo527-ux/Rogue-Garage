import { useState } from 'react';
import toast from 'react-hot-toast';
import { productsService } from '../../services/productsService';
import { storageService } from '../../services/storageService';
import { CATEGORIES, BRANDS } from '../../utils/constants';

export default function ProductForm({ product, onClose, onSuccess }) {
  const [form, setForm] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || 'Genérico',
    cost_price: product?.cost_price || '',
    sale_price: product?.sale_price || '',
    stock: product?.stock || '',
    category: product?.categories?.name || 'Accesorios',
    image_url: product?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Subir imagen a Supabase Storage
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await storageService.uploadImage(file);
      update('image_url', url);
      toast.success('Imagen subida correctamente');
    } catch (err) {
      toast.error('Error al subir imagen. Revisa los permisos del bucket.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!form.sku || !form.name || !form.sale_price) {
      toast.error('SKU, Nombre y Precio de venta son obligatorios');
      return;
    }

    setSaving(true);
    try {
      // Buscar ID de la categoría
      const { data: catData } = await import('../../services/supabaseClient').then(m => 
        m.supabase.from('categories').select('id').eq('name', form.category).single()
      );

      const payload = {
        sku: form.sku.toUpperCase(),
        name: form.name,
        description: form.description,
        brand: form.brand,
        cost_price: Number(form.cost_price) || 0,
        sale_price: Number(form.sale_price),
        stock: Number(form.stock) || 0,
        image_url: form.image_url,
        category_id: catData?.id || null
      };

      if (product?.id) {
        await productsService.update(product.id, payload);
        toast.success('Producto actualizado');
      } else {
        await productsService.create(payload);
        toast.success('Producto creado');
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div className="modal-content" style={{ background: '#111', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>SKU *</label>
              <input required value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="RE-YAM-FRE-001" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Nombre del Producto *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ej: Kit de arrastre" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Costo (Compra)</label>
              <input type="number" value={form.cost_price} onChange={(e) => update('cost_price', e.target.value)} placeholder="Ej: 50000" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Precio Venta (Público) *</label>
              <input type="number" required value={form.sale_price} onChange={(e) => update('sale_price', e.target.value)} placeholder="Ej: 85000" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Stock *</label>
              <input type="number" required value={form.stock} onChange={(e) => update('stock', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Marca</label>
              <select value={form.brand} onChange={(e) => update('brand', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Categoría</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Imagen del Producto</label>
            <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} style={{ color: '#fff' }} />
            {uploading && <p style={{ color: '#d99a3d', fontSize: '0.8rem', marginTop: '0.5rem' }}>Subiendo imagen...</p>}
            {form.image_url && <img src={form.image_url} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '1rem', borderRadius: '4px' }} />}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Descripción</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows="3" style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving || uploading} style={{ padding: '0.8rem 1.5rem', background: '#d99a3d', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}