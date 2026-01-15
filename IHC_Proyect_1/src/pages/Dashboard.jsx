import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSites } from '../hooks/useSites';
import logo from '../assets/logo.png';

function Dashboard() {
  // --- BUSINESS LOGIC (PRESERVED) ---
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('default');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await listSites();
      if (!cancelled) {
        const arr = res.ok ? (res.sites || []) : [];
        setSites(arr);
        if (arr.length > 0 && !arr.find(s => s.slug === selected)) {
          setSelected(arr[0].slug);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  const handleCreateDesign = () => {
    // TODO: Implementar creación de diseño desde cero
    alert('Funcionalidad de Crear Diseño próximamente');
  };

  const handleViewDesigns = () => {
    const slug = selected || 'default';
    navigate(`/editor?site=${encodeURIComponent(slug)}`);
  };
  // ----------------------------------

  // UI CONFIGURATION (New "NEXUM" Style)
  const cards = [
    {
      title: "Editor del Sitio Web",
      description: "Abre el editor visual para personalizar las páginas y contenido del sitio seleccionado.",
      icon: "bi-pencil-square",
      buttonText: "Abrir Editor",
      color: "#8b5cf6", // Purple
      action: handleViewDesigns // Uses existing logic
    },
    {
      title: "Gestión de Sitios",
      description: "Crea, elimina y administra los sitios y configuraciones de tu proyecto.",
      icon: "bi-gear-fill", // Changed to generic gear
      buttonText: "Administrar Sitios",
      color: "#1e293b", // Dark Blue
      action: () => navigate('/sites') // Uses existing logic
    },
    {
      title: "Foro de la Comunidad",
      description: "Gestiona categorías, temas y respuestas del foro de la comunidad.",
      icon: "bi-chat-square-text-fill",
      buttonText: "Ir al Foro",
      color: "#c084fc", // Light Purple
      action: () => navigate('/forum') // Uses existing logic
    }
    ,{
      title: "Componentes Actualizables",
      description: "Accede a la lista de componentes guardados y edítalos individualmente.",
      icon: "bi-puzzle",
      buttonText: "Componentes",
      color: "#0ea5e9",
      action: () => navigate('/componentes-actualizables')
    }
  ];

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Navbar - Dark Theme (NEXUM Style) */}
      <nav className="navbar navbar-dark px-4" style={{ backgroundColor: '#1a202c', height: '70px' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center fw-bold fs-3" href="/">
            <img src={logo} alt="NEXUM" style={{ height: '45px', width: 'auto' }} className="me-2" />
          </a>
          <div className="d-flex align-items-center text-white">
            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
               <i className="bi bi-person-circle fs-4 me-2"></i>
               <span className="d-none d-md-inline">Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Logic Element: Site Selector (Styled to fit new design) */}
      <div className="bg-white shadow-sm border-bottom py-3 px-4">
        <div className="container d-flex align-items-center justify-content-end">
          <label className="me-2 fw-bold text-secondary small text-uppercase">Sitio Activo:</label>
          <select 
            className="form-select form-select-sm border-secondary-subtle" 
            style={{ maxWidth: '250px', fontWeight: '500' }} 
            value={selected}
            onChange={(e) => setSelected(e.target.value)} 
            disabled={loading || sites.length === 0}
          >
            {sites.length === 0 ? (
              <option value="default">predeterminado</option>
            ) : (
              sites.map(s => <option key={s.id} value={s.slug}>{s.name} / {s.slug}</option>)
            )}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        <div className="row g-4 justify-content-center">
          {cards.map((card, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center transition-hover" 
                   style={{ borderRadius: '16px', transition: 'transform 0.2s' }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="mb-4 pt-2">
                  <i className={`bi ${card.icon}`} style={{ fontSize: '3.5rem', color: card.color }}></i>
                </div>
                <div className="card-body p-0 d-flex flex-column">
                  <h4 className="card-title fw-bold mb-3" style={{ color: '#1e293b' }}>{card.title}</h4>
                  <p className="card-text text-muted mb-4 px-2" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {card.description}
                  </p>
                  <button 
                    onClick={card.action}
                    className="btn w-100 py-2 fw-bold text-white shadow-sm mt-auto"
                    style={{ 
                        backgroundColor: card.color, 
                        border: 'none', 
                        borderRadius: '8px',
                        letterSpacing: '0.5px'
                    }}
                  >
                    {card.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

