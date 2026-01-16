import React, { useEffect, useState } from 'react';
import { getThreads, createThread } from '../../../hooks/useForum';

export const TopicList = ({ category, onSelectThread, onBack, settings }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // New Thread State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [authorName, setAuthorName] = useState('Usuario'); // In a real app, from Auth

  useEffect(() => {
    loadThreads();
  }, [category.id]);

  const loadThreads = async () => {
    setLoading(true);
    const data = await getThreads(category.id);
    setThreads(data);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    await createThread(category.id, newTitle, newContent, authorName);
    setNewTitle('');
    setNewContent('');
    setShowCreate(false);
    loadThreads(); // Refresh
  };

  if (loading) return <div className="p-4 text-center">Cargando temas...</div>;

  return (
    <div className="forum-topics">
        {/* Header Navigation */}
        <div className="d-flex align-items-center gap-3 mb-4">
            <button className="btn btn-link text-white p-0" onClick={onBack}>
                <i className="bi bi-arrow-left fs-4"></i>
            </button>
            <h2 className="mb-0 text-white d-flex align-items-center" style={{ fontWeight: 'bold' }}>
                <span style={{ height: '32px', width: '6px', backgroundColor: settings.primary_color, marginRight: '15px' }}></span>
                Foro {category.name}
            </h2>
        </div>

        <div className="mb-4">
             <div className="small text-muted mb-2 ps-4 ms-2">Temas</div>
             <button 
                className="btn text-white fw-bold px-4 py-2 rounded-pill" 
                style={{ backgroundColor: settings.primary_color }}
                onClick={() => setShowCreate(!showCreate)}
            >
                Nuevo tema
            </button>
        </div>

        {showCreate && (
            <div className="card mb-4 border-0" style={{ backgroundColor: settings.card_bg_color, border: '1px solid #444' }}>
                <div className="card-body">
                    <h5 className="card-title mb-3 text-white">Crear Nuevo Tema</h5>
                    <form onSubmit={handleCreate}>
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Título del tema"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444' }}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <textarea 
                                className="form-control" 
                                rows="3" 
                                placeholder="Contenido del mensaje..."
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                style={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #444' }}
                                required
                            ></textarea>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                             <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>Cancelar</button>
                             <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: settings.primary_color, border: 'none' }}>Publicar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <div className="d-flex flex-column gap-0 border border-secondary rounded overflow-hidden">
            {threads.map((thread) => (
                <div 
                    key={thread.id} 
                    className="p-3 d-flex align-items-center"
                    style={{ 
                        backgroundColor: settings.card_bg_color, 
                        color: settings.text_color, 
                        borderBottom: '1px solid #444',
                        cursor: 'pointer'
                    }}
                    onClick={() => onSelectThread(thread)}
                >
                    {/* Avatar Icon */}
                    <div className="me-3">
                        <div className="rounded-circle border border-secondary d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-person fs-4 text-secondary"></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1">
                        <h5 className="mb-1 fw-normal text-white">{thread.title}</h5>
                        <div className="small text-muted">
                            {thread.author_name || 'UserName'} &nbsp;&nbsp; {thread.date}
                        </div>
                    </div>

                    {/* Respuestas */}
                    <div className="text-center px-3">
                        <div className="mb-1" style={{ fontSize: '0.8rem', color: '#ccc' }}>Respuestas</div>
                        <div className="fw-bold fs-5 text-white">{thread.replies || 0}</div>
                    </div>
                </div>
            ))}
            {threads.length === 0 && (
                 <div className="text-center py-5 opacity-50 bg-dark">
                    No hay temas en esta categoría aún via.
                 </div>
            )}
        </div>
    </div>
  );
};
