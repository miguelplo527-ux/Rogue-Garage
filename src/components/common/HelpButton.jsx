import { useNavigate } from 'react-router-dom';

export default function HelpButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/admin/ayuda')}
      style={{
        position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
        background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%',
        width: '60px', height: '60px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      title="Ir al Centro de Ayuda"
    >
      <i className="fa-solid fa-question" style={{ fontSize: '1.5rem', marginBottom: '2px' }}></i>
      <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>Ayuda</span>
    </button>
  );
}