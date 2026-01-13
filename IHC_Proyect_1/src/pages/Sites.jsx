import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSites, createSite, deleteSite, toSlug } from '../hooks/useSites';
import logo from '../assets/logo.png';

export default function Sites() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const slugPreview = useMemo(() => toSlug(name || ''), [name]);

  async function refresh() {
    setLoading(true);
    setError(null);
    const res = await listSites();
    if (!res.ok) setError(res.error || new Error('Error listando sitios'));
    setSites(res.sites || []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    const nm = (name || '').trim();
    if (!nm) return;
    const res = await createSite(nm);
    if (!res.ok) {
      alert('No se pudo crear el sitio');
    } else {
      setName('');
      await refresh();
    }
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar este sitio? Se eliminarán también sus secciones.')) return;
    const res = await deleteSite(id);
    if (!res.ok) {
      alert('No se pudo eliminar el sitio');
    } else {
      await refresh();
    }
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Navbar - Match Dashboard Theme */}
      <nav className="navbar navbar-dark px-4 shadow-sm" style={{ backgroundColor: '#1a202c', height: '70px' }}>
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center fw-bold fs-3" href="/">
            <img src={logo} alt="NEXUM" style={{ height: '45px', width: 'auto' }} className="me-2" />
          </a>
          <div className="d-flex align-items-center gap-3">
             <button 
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2" 
                onClick={() => navigate('/')}
                style={{ borderRadius: '20px', paddingLeft: '16px', paddingRight: '16px' }}
             >
               <i className="bi bi-arrow-left"></i>
               <span>Home</span>
             </button>
             <div className="text-white opacity-25" style={{ height: '24px', width: '1px', background: 'currentColor' }}></div>
             <div className="d-flex align-items-center text-white" style={{ cursor: 'pointer' }}>
               <i className="bi bi-person-circle fs-4"></i>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Create Card */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                     <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '48px', height: '48px', backgroundColor: '#6d28d9' }}>
                        <i className="bi bi-plus-lg fs-5"></i>
                     </div>
                     <div>
                        <h5 className="card-title fw-bold mb-0 text-dark">Nuevo Sitio</h5>
                        <small className="text-muted">Crea un nuevo espacio de trabajo</small>
                     </div>
                </div>

                <form onSubmit={onCreate} className="d-grid gap-3">
                  <div>
                    <label className="form-label fw-semibold text-secondary small text-uppercase">Nombre del Proyecto</label>
                    <input 
                        className="form-control form-control-lg bg-light border-0" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Ej. Mi Portafolio" 
                        style={{ fontSize: '1rem' }}
                    />
                  </div>
                  
                  <div className="p-3 rounded bg-light border d-flex align-items-center gap-2">
                    <i className="bi bi-link-45deg text-muted fs-5"></i>
                    <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Slug generado</span>
                        <code className="text-truncate text-dark fw-bold" style={{ backgroundColor: 'transparent' }}>{slugPreview || '...'}</code>
                    </div>
                  </div>

                  <div className="mt-2">
                    <button type="submit" className="btn btn-lg w-100 text-white fw-bold shadow-sm" style={{ backgroundColor: '#6d28d9', borderRadius: '8px' }}>
                        Crear Sitio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* List Card */}
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-white border-bottom border-light p-4 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                       <div className="rounded-circle d-flex align-items-center justify-content-center text-secondary bg-light" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-grid-fill fs-5"></i>
                       </div>
                       <h5 className="mb-0 fw-bold text-dark">Mis Sitios</h5>
                  </div>
                  <button 
                    className="btn btn-light btn-sm text-secondary border-0" 
                    onClick={refresh} 
                    disabled={loading}
                    title="Actualizar lista"
                  >
                    <i className={`bi bi-arrow-clockwise ${loading ? 'spin-animation' : ''} fs-5`}></i>
                  </button>
              </div>

              <div className="card-body p-0">
                {loading ? (
                   <div className="d-flex flex-column align-items-center justify-content-center p-5 text-muted opacity-50">
                      <div className="spinner-border text-secondary mb-3" role="status"></div>
                      <span className="small">Cargando sitios...</span>
                   </div>
                ) : error ? (
                   <div className="alert alert-danger m-4 d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      Error cargando sitios
                   </div>
                ) : sites.length === 0 ? (
                  <div className="text-center p-5 text-muted">
                      <div className="mb-3 opacity-25">
                          <i className="bi bi-folder2-open" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h6 className="fw-semibold">No tienes sitios aún</h6>
                      <p className="small mb-0">Utiliza el formulario de la izquierda para crear uno.</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {sites.map(s => (
                      <div key={s.id} className="list-group-item p-4 d-flex flex-wrap gap-3 justify-content-between align-items-center hover-bg-light transition-all">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded d-flex align-items-center justify-content-center bg-dark text-white fw-bold shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                              {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>{s.name}</div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-light text-secondary border fw-normal text-lowercase font-monospace">/{s.slug}</span>
                                <span className="text-muted small">• Última edición: Hoy</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                             <button 
                                className="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm" 
                                onClick={() => navigate(`/editor?site=${encodeURIComponent(s.slug)}`)}
                                style={{ borderRadius: '6px' }}
                             >
                                <i className="bi bi-pencil-square"></i>
                                <span>Editar</span>
                             </button>
                             <div className="dropdown">
                                <button className="btn btn-light text-secondary" style={{ borderRadius: '6px' }} type="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={() => {
                                      if(confirm('¿Eliminar este sitio? Se eliminarán también sus secciones.')) onDelete(s.id); 
                                    }}>
                                    <i className="bi bi-trash"></i>
                                </button>
                             </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
