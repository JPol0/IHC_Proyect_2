import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { supabase } from '../../../SupabaseCredentials';
import { SettingsTabs } from "../ui/SettingsTabs";

// Función para formatear números al estilo 1K, 1M
const formatCount = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

export const LikeButton = ({ 
  sectionId,
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1
}) => {
  const { 
    id, 
    connectors: { connect, drag }, 
    actions: { setProp }, 
    selected 
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = Number(translateX) || 0;
    const initialY = Number(translateY) || 0;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setProp((props) => {
        props.translateX = initialX + deltaX;
        props.translateY = initialY + deltaY;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Cargar el contador inicial desde Supabase
  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      if (!sectionId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('count')
          .eq('section_id', sectionId)
          .single();
        
        if (error) {
          // Si no existe registro, inicializar en 0
          if (error.code === 'PGRST116') {
            setCount(0);
          } else {
            console.error('Error fetching likes:', error);
          }
        } else if (data) {
          setCount(data.count || 0);
        }
      } catch (err) {
        console.error('Error in fetchLikes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikes();
  }, [sectionId]);

  // Manejar el click en el botón
  const handleLike = async () => {
    if (liked || !sectionId || loading) return;
    
    setLiked(true);
    const newCount = count + 1;
    setCount(newCount);
    
    try {
      // Actualizar o insertar en Supabase
      const { error } = await supabase
        .from('likes')
        .upsert(
          { section_id: sectionId, count: newCount, updated_at: new Date().toISOString() },
          { onConflict: 'section_id' }
        );
      
      if (error) {
        console.error('Error updating likes:', error);
        // Revertir el cambio si hay error
        setLiked(false);
        setCount(count);
      }
    } catch (err) {
      console.error('Error in handleLike:', err);
      setLiked(false);
      setCount(count);
    }
  };

  return (
    <button
      ref={ref => connect(drag(ref))}
      onClick={handleLike}
      disabled={liked || loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: liked || loading ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '8px',
        transition: 'transform 0.2s',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        position: 'relative',
        zIndex: Number(zIndex) || 0,
        opacity: Number(opacity) || 1,
      }}
      onMouseEnter={(e) => {
        if (!liked && !loading) {
          e.currentTarget.style.transform = `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px) scale(1.1)`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px) scale(1)`;
      }}
      aria-label="Me Gusta"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 51 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'fill 0.3s, stroke 0.3s',
        }}
      >
        <path
          d="M4.25 18.0968C4.25004 15.7321 4.96739 13.4231 6.30728 11.4746C7.64718 9.52616 9.5466 8.02997 11.7547 7.18367C13.9627 6.33737 16.3756 6.18077 18.6745 6.73454C20.9735 7.28832 23.0504 8.52642 24.6309 10.2853C24.7422 10.4044 24.8768 10.4992 25.0263 10.5641C25.1758 10.629 25.337 10.6625 25.5 10.6625C25.663 10.6625 25.8242 10.629 25.9737 10.5641C26.1232 10.4992 26.2578 10.4044 26.3691 10.2853C27.9447 8.51499 30.022 7.26648 32.3247 6.70598C34.6274 6.14548 37.0462 6.29956 39.2591 7.14773C41.472 7.99589 43.3742 9.49791 44.7124 11.4539C46.0505 13.4098 46.7613 15.7269 46.75 18.0968C46.75 22.9631 43.5625 26.5968 40.375 29.7843L28.7045 41.0745C28.3085 41.5292 27.8203 41.8945 27.2723 42.1461C26.7243 42.3977 26.1291 42.5298 25.5261 42.5336C24.9231 42.5374 24.3263 42.4129 23.7751 42.1682C23.224 41.9236 22.7312 41.5645 22.3295 41.1148L10.625 29.7843C7.4375 26.5968 4.25 22.9843 4.25 18.0968Z"
          stroke={liked ? '#ef4444' : '#000'}
          fill={liked ? '#ef4444' : 'none'}
          strokeWidth="4.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ 
        fontWeight: 600, 
        fontSize: 18,
        color: liked ? '#ef4444' : '#000',
        transition: 'color 0.3s',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {formatCount(count)}
      </span>
      {selected && (
        <div 
            className="position-absolute d-flex align-items-center px-3 rounded-top shadow-sm"
            style={{
                top: 0,
                left: 0,
                transform: 'translateY(-100%)',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                zIndex: 9999,
                height: '42px',
                gap: '16px',
            }}
         >
             <i 
                className="bi bi-arrows-move" 
                title="Mover"
                style={{ cursor: 'move', fontSize: '1.4rem' }}
                onMouseDown={handleMouseDown}
             />
             <i 
                className="bi bi-copy"
                title="Duplicar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const current = node(id).get();
                  const { type, props, parent } = {
                    type: current.data.type,
                    props: current.data.props,
                    parent: current.data.parent,
                  };
                  const parentNode = node(parent).get();
                  const siblings = parentNode.data.nodes || [];
                  const index = Math.max(0, siblings.indexOf(id));
                  const shiftedProps = {
                    ...props,
                    translateX: (Number(props.translateX) || 0) + 10,
                    translateY: (Number(props.translateY) || 0) + 10,
                  };
                  const newNode = createNode(React.createElement(type, shiftedProps));
                  add(newNode, parent, index + 1);
                  selectNode(newNode.id);
                }}
             />
             <i 
                className="bi bi-trash" 
                title="Eliminar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    deleteNode(id);
                }}
             />
         </div>
      )}
    </button>
  );
};

// Configuración de propiedades editables
const LikeButtonSettings = () => {
  const { actions: { setProp }, sectionId } = useNode((node) => ({
    sectionId: node.data.props.sectionId,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Configuración",
          content: (
            <div className="mb-3">
              <label className="form-label small fw-semibold">ID de Sección</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={sectionId}
                onChange={(e) => setProp((props) => (props.sectionId = e.target.value))}
                placeholder="Ej: seccion-1, blog-post-123"
              />
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                Identificador único para rastrear los likes de esta sección
              </small>
            </div>
          )
        }
      ]}
    />
  );
};

LikeButton.craft = {
  displayName: 'Me Gusta',
  props: {
    sectionId: '',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1
  },
  related: {
    settings: LikeButtonSettings,
  },
};

export default LikeButton;
