import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, createCategory, getForumSettings, saveForumSettings, deleteCategory } from '../../hooks/useForum';
import { uploadImage, supabase } from '../../../SupabaseCredentials';

export default function ForumCategories() {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
      bg_color: '#000000',
      text_color: '#ffffff',
      primary_color: '#ff5722',
      card_bg_color: '#1e1e1e'
  });
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(true); // Simulation of admin role
  const navigate = useNavigate();

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // New Category State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImageFile, setCatImageFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      setLoading(true);
      const [cats, cfg] = await Promise.all([
          getCategories(), 
          getForumSettings()
      ]);
      setCategories(cats || []);
      if (cfg) setSettings(cfg);
      setLoading(false);
  };

  const handleCreateCategory = async (e) => {
      e.preventDefault();
      if (!catName.trim()) return;

      let imageUrl = null;
      if (catImageFile) {
           const res = await uploadImage(catImageFile, 'imagenes_user', 'forum');
           if (res) imageUrl = res.publicUrl || res; // Check how uploadImage returns
      }

      await createCategory(catName, catDesc, imageUrl);
      setCatName('');
      setCatDesc('');
      setCatImageFile(null);
      setShowCatModal(false);
      await loadData();
  };

  const handleSaveSettings = async (e) => {
      e.preventDefault();
      await saveForumSettings(settings);
      setShowConfigModal(false);
      await loadData();
  };

  const handleDelete = async (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      if(!window.confirm("¿Seguro que deseas eliminar esta categoría? Se borrarán todos los temas dentro.")) return;
      await deleteCategory(id);
      await loadData();
  };

  if (loading) return <div className="min-vh-100 p-4" style={{ backgroundColor: settings.bg_color, color: settings.text_color }}>Cargando foros...</div>;

  return (
    <div className="min-vh-100" style={{ backgroundColor: settings.bg_color, color: settings.text_color, padding: '1.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header with Tools */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
                <div style={{ width: '6px', height: '32px', backgroundColor: settings.primary_color, marginRight: '12px' }}></div>
                <h1 className="fw-bold m-0">Foros</h1>
            </div>
            <div className="d-flex gap-2 align-items-center">
                {/* Admin Mode Toggle */}
                <div className="form-check form-switch me-2" title="Simular Vista Admin/Usuario">
                    <input className="form-check-input" type="checkbox" checked={isAdminMode} onChange={e => setIsAdminMode(e.target.checked)} />
                    <label className="form-check-label small opacity-50" style={{color: settings.text_color}}>Admin</label>
                </div>

                {isAdminMode && (
                <>
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowConfigModal(true)}
                    title="Configurar Estilo"
                >
                    <i className="bi bi-palette"></i>
                </button>
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowCatModal(true)}
                    title="Nueva Categoría"
                >
                    <i className="bi bi-plus-lg"></i>
                </button>
                </>
                )}
            </div>
        </div>

        <div className="mb-4">
            <button 
                onClick={() => navigate('/')} 
                className="btn btn-sm" 
                style={{ color: settings.text_color, borderColor: settings.text_color, opacity: 0.7 }}
            >
                <i className="bi bi-arrow-left"></i> Volver al Dashboard
            </button>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
            <div className="text-center py-5 opacity-50">
                <h3>No hay categorías creadas.</h3>
                <p>Crea una pulsando el botón + arriba.</p>
            </div>
        ) : (
            <div className="d-flex flex-column gap-3">
            {categories.map((cat) => (
                <Link 
                    key={cat.id} 
                    to={`/forum/${cat.slug}`} 
                    className="text-decoration-none"
                >
                    <div 
                        className="d-flex align-items-center p-0 overflow-hidden" 
                        style={{ 
                            backgroundColor: settings.card_bg_color, 
                            borderRadius: '4px', 
                            transition: 'transform 0.2s',
                            border: `1px solid ${settings.card_bg_color === '#000000' ? '#333' : 'transparent'}`
                        }}
                    >
                        {/* Image */}
                        <div style={{ width: '120px', height: '80px', flexShrink: 0, backgroundColor: '#333', position: 'relative' }}>
                            {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small bg-secondary">Sin img</div>
                            )}
                        </div>
                        {/* Content */}
                        <div className="p-3 flex-grow-1 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-0" style={{ color: settings.text_color }}>{cat.name}</h5>
                                {cat.description && <small className="opacity-75" style={{ color: settings.text_color }}>{cat.description}</small>}
                            </div>
                            <div className="text-end d-flex align-items-center gap-3">
                                <div>
                                    <div className="small opacity-50" style={{ color: settings.text_color }}>Temas</div>
                                    <div className="fw-bold" style={{ color: settings.text_color }}>{cat.topic_count || 0}</div>
                                </div>
                                {isAdminMode && (
                                    <button 
                                        className="btn btn-sm btn-outline-danger" 
                                        onClick={(e) => handleDelete(e, cat.id)}
                                        title="Eliminar categoría"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            </div>
        )}

        {/* Modal: New Category */}
        {showCatModal && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
                <div className="p-4 rounded shadow" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#222', color: '#fff' }}>
                    <h3 className="mb-3">Nueva Categoría</h3>
                    <form onSubmit={handleCreateCategory}>
                        <div className="mb-3">
                            <label className="form-label">Nombre</label>
                            <input type="text" className="form-control" value={catName} onChange={e => setCatName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descripción</label>
                            <input type="text" className="form-control" value={catDesc} onChange={e => setCatDesc(e.target.value)} />
                        </div>
                        <div className="mb-3">
                             <label className="form-label">Imagen</label>
                             <input 
                                type="file" 
                                className="form-control" 
                                onChange={e => setCatImageFile(e.target.files[0])} 
                                accept="image/*"
                             />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ backgroundColor: settings.primary_color, borderColor: settings.primary_color }}>Crear</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Modal: Settings */}
        {showConfigModal && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
                <div className="p-4 rounded shadow" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#222', color: '#fff' }}>
                    <h3 className="mb-3">Configurar Estilo Foro</h3>
                    <form onSubmit={handleSaveSettings}>
                        <div className="row g-3">
                            <div className="col-6">
                                <label className="form-label">Color Fondo</label>
                                <input type="color" className="form-control form-control-color w-100" value={settings.bg_color} onChange={e => setSettings({...settings, bg_color: e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Color Texto</label>
                                <input type="color" className="form-control form-control-color w-100" value={settings.text_color} onChange={e => setSettings({...settings, text_color: e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Color Primario (Acento)</label>
                                <input type="color" className="form-control form-control-color w-100" value={settings.primary_color} onChange={e => setSettings({...settings, primary_color: e.target.value})} />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Fondo Tarjetas</label>
                                <input type="color" className="form-control form-control-color w-100" value={settings.card_bg_color} onChange={e => setSettings({...settings, card_bg_color: e.target.value})} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Floating Dashboard Button */}
        <button 
            onClick={() => navigate('/')}
            className="btn rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                backgroundColor: settings.primary_color,
                color: '#fff',
                border: 'none',
                zIndex: 2000
            }}
            title="Volver al Dashboard"
        >
            <i className="bi bi-house-door-fill fs-4"></i>
        </button>

      </div>
    </div>
  );
}
