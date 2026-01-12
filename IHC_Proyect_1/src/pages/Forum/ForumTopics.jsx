import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCategoryBySlug, getThreads, createThread, getForumSettings } from '../../hooks/useForum';

export default function ForumTopics() {
  const { catSlug } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [settings, setSettings] = useState({
      bg_color: '#000000',
      text_color: '#ffffff',
      primary_color: '#ff5722',
      card_bg_color: '#1e1e1e'
  });
  
  const [showModal, setShowModal] = useState(false);
  
  // New Thread State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    async function load() {
      const [cat, cfg] = await Promise.all([
          getCategoryBySlug(catSlug),
          getForumSettings()
      ]);
      setCategory(cat);
      if (cfg) setSettings(cfg);
      
      if (cat) {
          const t = await getThreads(cat.id);
          setThreads(t);
      }
    }
    load();
  }, [catSlug]);

  const handleCreate = async (e) => {
      e.preventDefault();
      if(!newTitle.trim()) return;
      await createThread(category.id, newTitle, newContent, "Usuario Actual");
      setNewTitle('');
      setNewContent('');
      setShowModal(false);
      // Refresh
      const t = await getThreads(category.id);
      setThreads(t);
  };

  if (!category) return <div className="min-vh-100 p-4" style={{ backgroundColor: settings.bg_color, color: settings.text_color }}>Cargando...</div>;

  return (
    <div className="min-vh-100 p-4" style={{ backgroundColor: settings.bg_color, color: settings.text_color }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div className="d-flex align-items-center mb-1">
            <button onClick={() => navigate('/forum')} className="btn btn-link p-0 me-3" style={{ color: settings.text_color }}>
                <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <div style={{ width: '4px', height: '24px', backgroundColor: settings.primary_color, marginRight: '12px' }}></div>
            <h2 className="fw-bold m-0">Foro {category.name}</h2>
        </div>
        <div className="ms-5 mb-4 opacity-75">Temas</div>

        {/* New Thread Button */}
        <div className="mb-4 text-start">
            <button 
                className="btn fw-bold px-4 py-2 text-white" 
                style={{ backgroundColor: settings.primary_color, borderRadius: '20px', border: 'none' }}
                onClick={() => setShowModal(true)}
            >
                Nuevo tema
            </button>
        </div>

        {/* List */}
        <div className="d-flex flex-column rounded overflow-hidden" style={{ border: `1px solid ${settings.card_bg_color === '#000000' ? '#333' : 'gray'}` }}>
            {threads.length === 0 && <div className="p-4 text-center opacity-50">No hay temas aún en este foro.</div>}
            
            {threads.map((thread, idx) => (
                <div 
                    key={thread.id} 
                    className={`d-flex align-items-center p-3 text-decoration-none`}
                    style={{ 
                        cursor: 'pointer', 
                        backgroundColor: settings.card_bg_color,
                        borderBottom: idx !== threads.length - 1 ? '1px solid #333' : 'none'
                    }}
                    onClick={() => navigate(`/forum/topic/${thread.id}`)}
                >
                    {/* Avatar */}
                    <div className="me-3">
                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderColor: settings.text_color }}>
                            <i className="bi bi-person fs-4"></i>
                        </div>
                    </div>
                    {/* Info */}
                    <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1" style={{ color: settings.text_color }}>{thread.title}</h5>
                        <div className="small opacity-75" style={{ color: settings.text_color }}>
                            {thread.author} <span className="mx-2"></span> {thread.date}
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="text-end">
                        <div className="small opacity-50" style={{ color: settings.text_color }}>Respuestas</div>
                        <div className="fw-bold" style={{ color: settings.text_color }}>{thread.replies}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Modal Simple */}
        {showModal && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000 }}>
                <div className="p-4 rounded shadow" style={{ width: '90%', maxWidth: '500px', backgroundColor: '#222', color: '#fff' }}>
                    <h3 className="mb-3">Nuevo Tema en {category.name}</h3>
                    <form onSubmit={handleCreate}>
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="form-control bg-dark text-white border-secondary" 
                                placeholder="Título del tema" 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <textarea 
                                className="form-control bg-dark text-white border-secondary" 
                                rows="5" 
                                placeholder="Contenido..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" style={{ backgroundColor: settings.primary_color, borderColor: settings.primary_color }}>Publicar</button>
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
