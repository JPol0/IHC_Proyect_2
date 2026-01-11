import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSites } from '../hooks/useSites';

function Dashboard() {
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

  // (Exportar) Eliminado: no se usa más

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Header con título y perfil */}
      <div className="bg-white border-bottom d-flex justify-content-between align-items-center px-4 py-3">
        <h1 className="mb-0 fw-bold fs-2 text-dark">Ágora</h1>
        <div className="position-relative">
          <i className="bi bi-person-circle fs-3 text-secondary" style={{ cursor: 'pointer' }}></i>
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span className="visually-hidden">Notificaciones</span>
          </span>
        </div>
      </div>

      {/* Selector de sitio */}
      <div className="bg-white border-bottom px-4 py-2">
        <div className="d-flex gap-2 align-items-center">
          <label className="mb-0">Sitio:</label>
          <select className="form-select form-select-sm" style={{ maxWidth: 260 }} value={selected}
            onChange={(e) => setSelected(e.target.value)} disabled={loading || sites.length === 0}>
            {sites.length === 0 ? (
              <option value="default">default</option>
            ) : (
              sites.map(s => <option key={s.id} value={s.slug}>{s.name} / {s.slug}</option>)
            )}
          </select>
        </div>
      </div>

      {/* Contenido principal centrado */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: '1200px' }}>
          <div className="row g-4 justify-content-center">
            {/* Card 1: Abrir editor */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-3 d-flex justify-content-center">
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: '64px', height: '64px' }}
                    >
                      <i className="bi bi-pencil-square text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                  <h5 className="card-title fw-bold mb-3 text-center">Abrir editor</h5>
                  <p className="card-text text-muted mb-4 text-center flex-grow-1">
                    Abre el editor para el sitio seleccionado en el menú superior.
                  </p>
                  <button 
                    className="btn btn-a50104 mt-auto"
                    onClick={handleViewDesigns}
                  >
                    Abrir editor
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Gestionar Sitios */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-3 d-flex justify-content-center">
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center position-relative"
                      style={{ width: '64px', height: '64px' }}
                    >
                      <i className="bi bi-gear text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                  <h5 className="card-title fw-bold mb-3 text-center">Gestionar sitios</h5>
                  <p className="card-text text-muted mb-4 text-center flex-grow-1">
                    Crea, elimina y administra los sitios de tu proyecto.
                  </p>
                  <button 
                    className="btn btn-outline-secondary mt-auto"
                    onClick={() => navigate('/sites')}
                  >
                    Ir a gestión de sitios
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta de Exportar eliminada */}
            
            {/* Card 3: Gestionar Foro */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-3 d-flex justify-content-center">
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center position-relative"
                      style={{ width: '64px', height: '64px' }}
                    >
                      <i className="bi bi-chat-square-text text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                  <h5 className="card-title fw-bold mb-3 text-center">Gestionar Foro</h5>
                  <p className="card-text text-muted mb-4 text-center flex-grow-1">
                    Administra categorías, temas y respuestas del foro de la comunidad.
                  </p>
                  <button 
                    className="btn btn-outline-secondary mt-auto"
                    onClick={() => navigate('/forum')}
                  >
                    Ir al Foro
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

