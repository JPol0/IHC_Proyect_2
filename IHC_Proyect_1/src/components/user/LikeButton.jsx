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
  initialCount = 1000,
  iconSize = 28,
  iconColor = '#000000',
  countColor = '#000000',
  backgroundColor = 'transparent',
  likedColor = '#ef4444',
  showCount = true,
  gap = 10,
  padding = 8,
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
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  
  // Generar un sectionId único si no se proporciona (usando el ID del componente)
  const effectiveSectionId = sectionId || `like-button-${id}`;

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
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('count')
          .eq('section_id', effectiveSectionId)
          .single();
        
        if (error) {
          // Si no existe registro, crear uno nuevo con el contador inicial
          if (error.code === 'PGRST116') {
            // No existe, crear registro inicial
            const { error: insertError } = await supabase
              .from('likes')
              .insert([{ 
                section_id: effectiveSectionId, 
                count: initialCount 
              }]);
            
            if (insertError) {
              console.error('Error creating initial like record:', insertError);
              setCount(initialCount);
            } else {
              setCount(initialCount);
            }
          } else {
            console.error('Error fetching likes:', error);
            setCount(initialCount);
          }
        } else if (data) {
          // Existe registro, usar el contador de la BD
          setCount(data.count || initialCount);
          setSupabaseConnected(true);
        }
        
        // Si llegamos aquí sin error, Supabase está conectado
        setSupabaseConnected(true);
      } catch (err) {
        console.error('Error in fetchLikes:', err);
        setCount(initialCount);
        setSupabaseConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikes();
  }, [effectiveSectionId, initialCount]);

  // Manejar el click en el botón
  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked || loading) return;
    
    // Cambiar inmediatamente el estado visual (optimistic update)
    setLiked(true);
    const newCount = count + 1;
    setCount(newCount);
    
    // Guardar siempre en Supabase
    try {
      const { error } = await supabase
        .from('likes')
        .upsert(
          { 
            section_id: effectiveSectionId, 
            count: newCount,
            updated_at: new Date().toISOString() 
          },
          { 
            onConflict: 'section_id',
            ignoreDuplicates: false
          }
        );
      
      if (error) {
        console.error('Error updating likes in Supabase:', error);
        // Revertir el cambio si hay error
        setLiked(false);
        setCount(count);
        // Solo mostrar alerta si es un error crítico, no si es solo que no existe la tabla
        if (error.code !== '42P01') { // 42P01 = tabla no existe
          console.warn('No se pudo guardar en Supabase. Funcionando en modo local.');
        }
      } else {
        console.log('✅ Like guardado exitosamente en Supabase:', { section_id: effectiveSectionId, count: newCount });
        setSupabaseConnected(true);
      }
    } catch (err) {
      console.error('Error in handleLike:', err);
      // Revertir el cambio si hay error
      setLiked(false);
      setCount(count);
      alert('Error al guardar el like. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div
      ref={ref => connect(drag(ref))}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${gap}px`,
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        position: 'relative',
        zIndex: Number(zIndex) || 0,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
      }}
    >
      <button
        onClick={handleLike}
        disabled={liked || loading}
        style={{
          background: backgroundColor || 'transparent',
          border: 'none',
          cursor: liked || loading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${padding}px`,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!liked && !loading) {
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Me Gusta"
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 51 49"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'fill 0.3s, stroke 0.3s',
          }}
        >
          <path
            d="M4.25 18.0968C4.25004 15.7321 4.96739 13.4231 6.30728 11.4746C7.64718 9.52616 9.5466 8.02997 11.7547 7.18367C13.9627 6.33737 16.3756 6.18077 18.6745 6.73454C20.9735 7.28832 23.0504 8.52642 24.6309 10.2853C24.7422 10.4044 24.8768 10.4992 25.0263 10.5641C25.1758 10.629 25.337 10.6625 25.5 10.6625C25.663 10.6625 25.8242 10.629 25.9737 10.5641C26.1232 10.4992 26.2578 10.4044 26.3691 10.2853C27.9447 8.51499 30.022 7.26648 32.3247 6.70598C34.6274 6.14548 37.0462 6.29956 39.2591 7.14773C41.472 7.99589 43.3742 9.49791 44.7124 11.4539C46.0505 13.4098 46.7613 15.7269 46.75 18.0968C46.75 22.9631 43.5625 26.5968 40.375 29.7843L28.7045 41.0745C28.3085 41.5292 27.8203 41.8945 27.2723 42.1461C26.7243 42.3977 26.1291 42.5298 25.5261 42.5336C24.9231 42.5374 24.3263 42.4129 23.7751 42.1682C23.224 41.9236 22.7312 41.5645 22.3295 41.1148L10.625 29.7843C7.4375 26.5968 4.25 22.9843 4.25 18.0968Z"
            stroke={liked ? likedColor : iconColor}
            fill={liked ? likedColor : 'none'}
            strokeWidth="4.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {showCount && (
        <span style={{ 
          fontWeight: 500, 
          fontSize: 16,
          color: countColor,
          transition: 'color 0.3s',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {formatCount(count)}
        </span>
      )}
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
    </div>
  );
};

// Configuración de propiedades editables
const LikeButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Tamaño del icono (px)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  min="10"
                  max="100"
                  value={props.iconSize || 28}
                  onChange={(e) => setProp((p) => (p.iconSize = parseInt(e.target.value) || 28))}
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color del icono</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.iconColor || '#000000'}
                    onChange={(e) => setProp((p) => (p.iconColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color cuando está activo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.likedColor || '#ef4444'}
                    onChange={(e) => setProp((p) => (p.likedColor = e.target.value))}
                  />
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color del contador</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.countColor || '#000000'}
                    onChange={(e) => setProp((p) => (p.countColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color de fondo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.backgroundColor || '#000000'}
                    onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value || 'transparent'))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Espaciado entre icono y contador (px)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  min="0"
                  max="50"
                  value={props.gap || 10}
                  onChange={(e) => setProp((p) => (p.gap = parseInt(e.target.value) || 10))}
                />
              </div>

              <div>
                <label className="form-label">Padding del botón (px)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  min="0"
                  max="50"
                  value={props.padding || 8}
                  onChange={(e) => setProp((p) => (p.padding = parseInt(e.target.value) || 8))}
                />
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showCount !== false}
                  onChange={(e) => setProp((p) => (p.showCount = e.target.checked))}
                />
                <label className="form-check-label">
                  Mostrar contador
                </label>
              </div>
            </div>
          )
        },
        {
          label: "Configuración",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Contador inicial</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="0"
                  value={props.initialCount || 1000}
                  onChange={(e) => setProp((p) => (p.initialCount = parseInt(e.target.value) || 1000))}
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                  Valor inicial del contador (se usa si no hay sectionId o si no existe en BD)
                </small>
              </div>
              <div>
                <label className="form-label">ID de Sección (Opcional)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.sectionId || ''}
                  onChange={(e) => setProp((p) => (p.sectionId = e.target.value))}
                  placeholder="Ej: seccion-1, blog-post-123"
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                  Si se proporciona, los likes se guardarán en Supabase. Si no, funcionará solo localmente.
                </small>
              </div>
            </div>
          )
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover X (px)</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y (px)</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Z-index</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Opacidad (0-1)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={Number.isFinite(props.opacity) ? props.opacity : 1}
                  onChange={(e) => setProp((p) => (p.opacity = Math.max(0, Math.min(1, Number(e.target.value)))))}
                />
              </div>
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
    initialCount: 1000,
    iconSize: 28,
    iconColor: '#000000',
    countColor: '#000000',
    backgroundColor: 'transparent',
    likedColor: '#ef4444',
    showCount: true,
    gap: 10,
    padding: 8,
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
