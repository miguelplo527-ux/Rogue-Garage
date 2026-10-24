import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProducts } from '../../hooks/useProducts';
import { productsService } from '../../services/productsService';
import { storageService } from '../../services/storageService';
import { formatMoney } from '../../utils/formatters';
import { supabase } from '../../services/supabaseClient';

function ProductForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ 
    sku: '', name: '', description: '', cost_price: '', sale_price: '', stock: '',
    brand: 'Genérico', category: 'Repuestos', supplier_id: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [image_url, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    supabase.from('suppliers').select('*').order('name').then(({ data }) => setSuppliers(data || []));
  }, []);

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
      // FIX: maybeSingle() evita los errores 406 y 400 si no encuentra la categoría
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', form.category)
        .maybeSingle();

      if (catError) {
        console.warn('Aviso: No se pudo obtener el ID de la categoría, se guardará solo el texto.', catError);
      }

      await productsService.create({ 
        ...form, 
        image_url, 
        cost_price: Number(form.cost_price), 
        sale_price: Number(form.sale_price), 
        stock: Number(form.stock),
        category_id: catData?.id || null, // Si falla, guarda null
        category: form.category,
        supplier_id: form.supplier_id || null
      }); 
      toast.success('Producto creado exitosamente'); 
      onSuccess(); 
      onClose(); 
    } catch (err) { 
      console.error(err);
      toast.error('Error al guardar: ' + err.message); 
    }
  };

  const inputStyle = { padding: '0.8rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', width: '100%' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <form onSubmit={handleSubmit} style={{ background: '#14171d', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>Nuevo Producto</h2>
        
        <input placeholder="SKU (Ej: RE-YAM-001)" required onChange={e => update('sku', e.target.value)} style={inputStyle} />
        <input placeholder="Nombre del producto" required onChange={e => update('name', e.target.value)} style={inputStyle} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ color: '#9aa0ab', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Marca</label>
            <select value={form.brand} onChange={e => update('brand', e.target.value)} style={inputStyle}>
              <option value="Genérico">Genérico</option>
              <option value="Yamaha">Yamaha</option>
              <option value="Honda">Honda</option>
              <option value="Suzuki">Suzuki</option>
              <option value="Bajaj">Bajaj</option>
              <option value="KTM">KTM</option>
              <option value="AKT">AKT</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#9aa0ab', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Categoría</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} style={inputStyle}>
              <option value="Repuestos">Repuestos</option>
              <option value="Indumentaria">Indumentaria</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ color: '#9aa0ab', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Proveedor Principal (Opcional)</label>
          <select value={form.supplier_id} onChange={e => update('supplier_id', e.target.value)} style={inputStyle}>
            <option value="">-- Sin proveedor asignado --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input type="number" placeholder="Costo (COP)" required onChange={e => update('cost_price', e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Precio Venta" required onChange={e => update('sale_price', e.target.value)} style={inputStyle} />
        </div>
        
        <input type="number" placeholder="Stock inicial" required onChange={e => update('stock', e.target.value)} style={inputStyle} />
        
        <div style={{ background: '#000', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #444', textAlign: 'center' }}>
          <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} ref={fileInputRef} style={{ display: 'none' }} />
          
          {!image_url && (
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} style={{ background: '#262b34', color: '#fff', border: '1px solid #444', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-cloud-arrow-up"></i> {uploading ? 'Subiendo...' : 'Seleccionar Foto'}
            </button>
          )}

          {uploading && <p style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 'bold' }}>⏳ Subiendo archivo...</p>}
          {uploadSuccess && !uploading && <p style={{ color: '#4caf50', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 'bold' }}>✅ ¡Imagen lista!</p>}
          
          {image_url && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <img src={image_url} alt="preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4caf50' }} />
              <button type="button" onClick={() => { setImageUrl(''); setUploadSuccess(false); }} style={{ background: 'none', border: 'none', color: '#e5484d', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Cambiar foto</button>
            </div>
          )}
        </div>

        <textarea 
          placeholder="Descripción del producto" 
          rows="4" 
          onChange={e => update('description', e.target.value)} 
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} 
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
          <button type="submit" disabled={uploading} style={{ flex: 1, padding: '1rem', background: uploading ? '#555' : '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
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
  
  const [editingStockProduct, setEditingStockProduct] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  const handleArchive = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try { await productsService.archive(id); toast.success('Producto eliminado'); reload(); }
    catch { toast.error('Error al eliminar'); }
  };

  const openStockModal = (product) => {
    setEditingStockProduct(product);
    setNewStockValue(product.stock);
  };

  const saveStock = async () => {
    if (newStockValue !== null && newStockValue !== '' && !isNaN(newStockValue)) {
      try {
        await supabase.from('products').update({ stock: Number(newStockValue) }).eq('id', editingStockProduct.id);
        toast.success('Stock actualizado');
        setEditingStockProduct(null);
        reload();
      } catch (error) {
        toast.error('Error al actualizar stock');
      }
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100&auto=format&fit=crop';

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Gestión de Productos</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '1rem 2rem', background: '#3b82f6', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Nuevo Producto</button>
      </div>
      
      <div style={{ background: '#14171d', borderRadius: '8px', overflow: 'hidden', border: '1px solid #262b34' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead><tr style={{ background: '#000', color: '#9aa0ab', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Img</th>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr> : products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>
                  <img src={p.image_url || defaultImage} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
                </td>
                <td style={{ color: '#3b82f6', fontFamily: 'monospace' }}>{p.sku}</td>
                <td>{p.name}</td>
                <td>{formatMoney(p.sale_price)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{p.stock} unds</span>
                    <button onClick={() => openStockModal(p)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#3b82f6', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Editar</button>
                  </div>
                </td>
                <td style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                  <button onClick={() => openStockModal(p)} style={{ background: '#262b34', border: '1px solid #444', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-pen"></i> Editar
                  </button>
                  <button onClick={() => handleArchive(p.id)} style={{ background: 'rgba(229, 72, 77, 0.1)', border: '1px solid #e5484d', color: '#e5484d', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingStockProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#14171d', padding: '2rem', borderRadius: '10px', width: '100%', maxWidth: '400px', border: '1px solid #262b34' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '1rem' }}>Corregir Stock</h3>
            <p style={{ color: '#9aa0ab', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Producto: <strong style={{color:'#fff'}}>{editingStockProduct.name}</strong></p>
            
            <input 
              type="number" 
              value={newStockValue} 
              onChange={(e) => setNewStockValue(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '1rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none', fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setEditingStockProduct(null)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid #555', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button onClick={saveStock} style={{ flex: 1, padding: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && <ProductForm onClose={() => setShowForm(false)} onSuccess={reload} />}
    </>
  );
}