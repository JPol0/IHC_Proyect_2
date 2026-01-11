import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getThread, getReplies, createReply, getForumSettings } from '../../hooks/useForum';

export default function ForumThread() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [settings, setSettings] = useState({
        bg_color: '#000000',
        text_color: '#ffffff',
        primary_color: '#ff5722',
        card_bg_color: '#1e1e1e'
  });
  
  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false); 
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    async function load() {
      const [t, cfg] = await Promise.all([
          getThread(topicId),
          getForumSettings()
      ]);
      setThread(t);
      if (cfg) setSettings(cfg);

      if (t) {
          const r = await getReplies(t.id);
          setReplies(r);
      }
    }
    load();
  }, [topicId]);

  const handleReply = async () => {
      if(!replyContent.trim()) return;
      // Pass replyingTo.id as parentId if it exists
      await createReply(thread.id, replyContent, "Usuario Actual", replyingTo?.id);
      setReplyContent('');
      setReplyingTo(null);
      // Refresh
      const r = await getReplies(thread.id);
      setReplies(r);
      setShowReplyBox(false);
  };

  const openReplyBox = (parentReply = null) => {
      setReplyingTo(parentReply);
      setShowReplyBox(true);
      // Scroll to reply box could go here
  };

  if (!thread) return <div className="min-vh-100 p-4" style={{ backgroundColor: settings.bg_color, color: settings.text_color }}>Cargando...</div>;

  return (
    <div className="min-vh-100 p-4" style={{ backgroundColor: settings.bg_color, color: settings.text_color }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header Back */}
        <div className="mb-4">
            <button onClick={() => navigate(-1)} className="btn btn-link p-0" style={{ color: settings.text_color }}>
                <i className="bi bi-arrow-left fs-3"></i>
            </button>
        </div>

        {/* Original Post */}
        <div className="mb-5">
             {/* User Header */}
             <div className="d-flex align-items-center mb-3">
                 <div className="rounded-circle border d-flex align-items-center justify-content-center me-3" style={{ width: '64px', height: '64px', borderColor: settings.text_color }}>
                     <i className="bi bi-person fs-1"></i>
                 </div>
                 <div>
                     <h4 className="fw-bold m-0" style={{ color: settings.text_color }}>{thread.author}</h4>
                     <div className="opacity-75 small" style={{ color: settings.text_color }}>{thread.date}</div>
                 </div>
             </div>
             
             {/* Title */}
             <h3 className="fw-bold mb-3" style={{ color: settings.text_color }}>{thread.title}</h3>
             
             {/* Content */}
             <div className="mb-4" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: settings.text_color }}>
                 {thread.content}
             </div>

             {/* Main Reply Button */}
             <div>
                 <button 
                    className="btn fw-bold px-4 text-white" 
                    style={{ backgroundColor: settings.primary_color, borderRadius: '4px', border: 'none' }}
                    onClick={() => openReplyBox(null)}
                 >
                     Responder al Tema
                 </button>
             </div>
        </div>

        {/* Global Reply Box */}
        {showReplyBox && (
            <div className="mb-5 p-3" style={{ backgroundColor: settings.card_bg_color, borderRadius: '4px' }}>
                <div className="d-flex justify-content-between mb-2">
                    <h5 className="m-0" style={{ color: settings.text_color }}>
                        {replyingTo ? `Respondiendo a ${replyingTo.author}` : 'Tu respuesta'}
                    </h5>
                    {replyingTo && (
                        <button onClick={() => setReplyingTo(null)} className="btn btn-sm btn-outline-secondary py-0">
                            Cancelar respuesta a usuario
                        </button>
                    )}
                </div>
                {replyingTo && (
                    <div className="mb-2 p-2 small opacity-75 border-start border-4" style={{ borderColor: settings.primary_color, fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        "{replyingTo.content.substring(0, 100)}{replyingTo.content.length > 100 ? '...' : ''}"
                    </div>
                )}
                <textarea 
                    className="form-control bg-dark text-white border-secondary mb-3" 
                    rows="4"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                ></textarea>
                <div className="text-end">
                    <button onClick={handleReply} className="btn text-white" style={{ backgroundColor: settings.primary_color }}>
                        Enviar Respuesta
                    </button>
                </div>
            </div>
        )}

        {/* Replies List */}
        <div className="d-flex flex-column gap-3">
            {replies.map((reply, idx) => {
                // Find parent author if exists
                const parent = reply.parent_id ? replies.find(r => r.id === reply.parent_id) : null;
                
                return (
                <div key={reply.id} className="p-3" style={{ backgroundColor: settings.card_bg_color, borderRadius: '4px' }}>
                    <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle border d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', borderColor: settings.text_color }}>
                            <i className="bi bi-person fs-4"></i>
                        </div>
                        <div className="flex-grow-1">
                            <div className="fw-bold" style={{ color: settings.text_color }}>{reply.author}</div>
                            <div className="small opacity-75" style={{ color: settings.text_color }}>{reply.date}</div>
                        </div>
                        <div className="opacity-50" style={{ color: settings.text_color }}>#{idx + 1}</div>
                    </div>
                    
                    {/* Parent Context Quote */}
                    {parent && (
                        <div className="mb-3 p-2 rounded small" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: `3px solid ${settings.primary_color}` }}>
                             <div className="fw-bold opacity-75">En respuesta a {parent.author}:</div>
                             <div className="fst-italic opacity-50">"{parent.content.substring(0, 60)}..."</div>
                        </div>
                    )}

                    <div className="mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', color: settings.text_color }}>
                        {reply.content}
                    </div>
                    <div className="text-end">
                        <button 
                            className="btn btn-sm text-white px-3" 
                            style={{ backgroundColor: settings.primary_color, border: 'none' }}
                            onClick={() => openReplyBox(reply)}
                        >
                            Responder
                        </button>
                    </div>
                </div>
                );
            })}
        </div>

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
