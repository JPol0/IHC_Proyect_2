import React, { useEffect, useState } from 'react';
import { getReplies, createReply } from '../../../hooks/useForum';

export const ThreadView = ({ thread, onBack, settings }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState('Usuario'); // Mock, in real app useAuth
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // object of post being replied to

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  const loadReplies = async () => {
    setLoading(true);
    const data = await getReplies(thread.id);
    setReplies(data);
    setLoading(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    // In a real implementation we would pass replyingTo.id as parentId
    await createReply(thread.id, replyContent, authorName, replyingTo?.id || null);
    setReplyContent('');
    setReplyingTo(null);
    setShowReplyModal(false);
    loadReplies();
  };

  const startReply = (reply = null) => {
      setReplyingTo(reply);
      setShowReplyModal(true);
  };

  const closeReplyModal = () => {
      setReplyingTo(null);
      setShowReplyModal(false);
  };

  if (loading) return <div className="p-4 text-center">Cargando respuestas...</div>;

  return (
    <div className="forum-thread">
        <div className="mb-4 d-flex align-items-center gap-3">
            <button className="btn btn-link text-white p-0" onClick={onBack}>
                <i className="bi bi-arrow-left fs-4"></i>
            </button>
             {/* Header Section for Thread */}
            <div className="d-flex align-items-center gap-3">
                 <div className="rounded-circle border border-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-person fs-2 text-white"></i>
                 </div>
                 <div>
                    <h4 className="mb-0 fw-bold">{thread.author_name || 'UserName'}</h4>
                    <div className="small text-muted">{new Date(thread.created_at).toLocaleDateString()}</div>
                 </div>
            </div>
        </div>

        {/* Main Post Content */}
        <div className="mb-5 pb-3">
             <h3 className="fw-bold mb-4" style={{ color: settings.text_color }}>{thread.title}</h3>
             <div className="mb-4" style={{ color: settings.text_color, fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {thread.content}
             </div>
             
             <button 
                className="btn text-white fw-bold px-4 py-2" 
                style={{ backgroundColor: settings.primary_color, borderRadius: '4px' }}
                onClick={() => startReply(null)}
            >
                Responder
            </button>
        </div>

        {/* Replies List */}
        <div className="d-flex flex-column gap-0 mb-5 border-top border-secondary">
            {replies.map((reply, index) => {
                const parent = reply.parent_id ? replies.find(r => r.id === reply.parent_id) : null;
                return (
                <div key={reply.id} className="d-flex flex-column p-4 border-bottom border-secondary" style={{ backgroundColor: '#1e1e1e' }}>
                    
                    {/* Header Reply */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle border border-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-person fs-5 text-white"></i>
                            </div>
                            <div>
                                <div className="fw-bold fs-5">{reply.author || 'UserName'}</div>
                                <div className="small text-muted">{reply.date}</div>
                            </div>
                        </div>
                        <div className="text-secondary small">#{index + 1}</div>
                    </div>

                    {/* Parent Context Quote */}
                    {parent && (
                         <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: `3px solid ${settings.primary_color}` }}>
                             <div className="fw-bold opacity-75 mb-1" style={{ fontSize: '0.9rem' }}>En respuesta a {parent.author || 'Usuario'}:</div>
                             <div className="fst-italic opacity-50 small">"{parent.content.length > 100 ? parent.content.substring(0, 100) + '...' : parent.content}"</div>
                        </div>
                    )}

                    {/* Content Reply */}
                    <div className="mb-3 text-white opacity-75">
                         {reply.content}
                    </div>

                    {/* Footer Reply */}
                    <div className="d-flex justify-content-end">
                        <button 
                            className="btn btn-sm text-white fw-bold" 
                            style={{ backgroundColor: settings.primary_color }}
                            onClick={() => startReply(reply)}
                        >
                            Responder
                        </button>
                    </div>
                </div>
            )})}
            {replies.length === 0 && <p className="opacity-50 mt-4 text-center">Sé el primero en responder.</p>}
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
            <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content text-white" style={{ backgroundColor: settings.card_bg_color || '#1e1e1e', border: `1px solid ${settings.primary_color}` }}>
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title">
                                {replyingTo ? `Respondiendo a ${replyingTo.author || 'Usuario'}` : 'Tu respuesta'}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" onClick={closeReplyModal}></button>
                        </div>
                        <div className="modal-body">
                            {replyingTo && (
                                <div className="mb-3 p-3 border-start border-4" style={{ 
                                    borderColor: settings.primary_color, 
                                    backgroundColor: 'rgba(255,255,255,0.05)', 
                                    borderLeft: `4px solid ${settings.primary_color}` 
                                }}>
                                    <div className="fst-italic opacity-75">"{replyingTo.content.substring(0, 150)}{replyingTo.content.length > 150 ? '...' : ''}"</div>
                                </div>
                            )}
                            
                            <form onSubmit={handleReply}>
                                <div className="mb-3">
                                    <textarea 
                                        className="form-control" 
                                        rows="6" 
                                        placeholder="Escribe tu respuesta aquí..."
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        style={{ 
                                            backgroundColor: '#2d2d2d', 
                                            color: '#fff', 
                                            border: '1px solid #444',
                                            resize: 'vertical'
                                        }}
                                        autoFocus
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                     <button type="button" className="btn btn-outline-light" onClick={closeReplyModal}>Cancelar</button>
                                     <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: settings.primary_color }}>
                                        Enviar Respuesta
                                     </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
