import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { productsService } from '../../services/productsService';
import { storageService } from '../../services/storageService';
import { formatMoney } from '../../utils/formatters';
import { supabase } from '../../services/supabaseClient';


function ProductForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ sku: '', name: '', description: '', cost_price: '', sale_price: '', stock: '' });
  const [image_url, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null); // Referencia para activar el input oculto
  
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('La imagen es muy pesada. Máximo 3MB.');
      return;
    }
    
    setUploading(true);
    setUploadSuccess(false);
    const toastId = toast.loading('Subiendo imagen a Supabase...');
    
    try { 
      const url = await storageService.uploadImage(file); 
      setImageUrl(url); 
      setUploadSuccess(true);
      toast.success('Imagen lista', { id: toastId }); 
    } catch (error) { 
      console.error(error);
      toast.error(error.message || 'Error al subir imagen.', { id: toastId }); 
    } finally { 
      setUploading(false); 
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return toast.error('Espera a que la imagen termine de subir');
    
    try { 
      // 1. Buscamos el ID de la categoría seleccionada en la base de datos
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', form.category)
        .single();

      // 2. Guardamos el producto con el category_id correcto
      await productsService.create({ 
        ...form, 
        image_url, 
        cost_price: Number(form.cost_price), 
        sale_price: Number(form.sale_price), 
        stock: Number(form.stock),
        category_id: catData?.id || null, // <-- Aquí va el UUID real
        category: form.category           // <-- Mantenemos el texto por si acaso
      }); 
      toast.success('Producto creado exitosamente'); 
      onSuccess(); 
      onClose(); 
    } catch (err) { 
      console.error(err);
      toast.error('Error al guardar: ' + err.message); 
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <form onSubmit={handleSubmit} style={{ background: '#14171d', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>Nuevo Producto</h2>
        
        <input placeholder="SKU (Ej: RE-YAM-001)" required onChange={e => update('sku', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        <input placeholder="Nombre del producto" required onChange={e => update('name', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input type="number" placeholder="Costo (COP)" required onChange={e => update('cost_price', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
          <input type="number" placeholder="Precio Venta" required onChange={e => update('sale_price', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        </div>
        
        <input type="number" placeholder="Stock inicial" required onChange={e => update('stock', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
        
        {/* NUEVA SECCIÓN DE IMAGEN (A PRUEBA DE FALLOS) */}
        <div style={{ background: '#000', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #444', textAlign: 'center' }}>
          
          {/* Input oculto real */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImage} 
            disabled={uploading} 
            ref={fileInputRef}
            style={{ display: 'none' }} 
          />

          {/* Botón visible que activa el input oculto */}
          {!image_url && (
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()} 
              disabled={uploading}
              style={{ background: '#262b34', color: '#fff', border: '1px solid #444', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> 
              {uploading ? 'Subiendo...' : 'Seleccionar Foto de mi PC'}
            </button>
          )}

          {/* Mensajes visuales de estado */}
          {uploading && <p style={{ color: '#d99a3d', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 'bold' }}>⏳ Subiendo archivo, no cierres esta ventana...</p>}
          {uploadSuccess && !uploading && <p style={{ color: '#4caf50', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 'bold' }}>✅ ¡Imagen lista para guardar!</p>}
          
          {/* Miniatura de la foto subida */}
          {image_url && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <img src={image_url} alt="preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4caf50' }} />
              <button type="button" onClick={() => { setImageUrl(''); setUploadSuccess(false); }} style={{ background: 'none', border: 'none', color: '#e5484d', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Cambiar foto</button>
            </div>
          )}
        </div>

        <textarea placeholder="Descripción del producto" rows="3" onChange={e => update('description', e.target.value)} style={{ padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={uploading} style={{ flex: 1, padding: '1rem', background: uploading ? '#555' : '#d99a3d', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'Espera...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProductsPage() {
  const { products, loading, reload } = useProducts();
  const [showForm, setShowForm] = useState(false);
  
  const handleArchive = async (id) => {
    if (!window.confirm('¿Archivar este producto?')) return;
    try { await productsService.archive(id); toast.success('Archivado'); reload(); }
    catch { toast.error('Error al archivar'); }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100&auto=format&fit=crop';

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Gestión de Productos</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '1rem 2rem', background: '#d99a3d', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Nuevo Producto</button>
      </div>
      
      <div style={{ background: '#14171d', borderRadius: '8px', overflow: 'hidden', border: '1px solid #262b34' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead><tr style={{ background: '#000', color: '#9aa0ab', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Img</th>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr> : products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>
                  <img 
                    src={p.image_url || defaultImage} 
                    alt={p.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                  />
                </td>
                <td style={{ color: '#d99a3d', fontFamily: 'monospace' }}>{p.sku}</td>
                <td>{p.name}</td>
                <td>{formatMoney(p.sale_price)}</td>
                <td>{p.stock} unds</td>
                <td>
                  <button onClick={() => handleArchive(p.id)} style={{ background: 'none', border: 'none', color: '#e5484d', cursor: 'pointer', fontWeight: 'bold' }}>Archivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && <ProductForm onClose={() => setShowForm(false)} onSuccess={reload} />}
    </>
  );
}