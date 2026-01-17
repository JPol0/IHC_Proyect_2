// components/user/FeatureCard.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useNavigate } from 'react-router-dom';

export const FeatureCard = ({
  // Content
  imageUrl = 'https://placehold.co/400x300',
  title = 'Título del Card',
  buttonText = 'LEER',
  
  // Navigation (mismo sistema que Navbar)
  actionType = 'route', // 'route' | 'section' | 'external'
  to = '',             // internal route
  sectionName = '',    // Para actionType: 'section'
  externalUrl = '',    // Para actionType: 'external'
  externalNewTab = true, // Para links externos
  
  // DEPRECATED: Compatibilidad hacia atrás
  linkUrl,             // Old prop - se convierte automáticamente
  linkNewTab,          // Old prop - se convierte automáticamente
  
  // Layout
  variant = 'default', // 'default' | 'overlay'
  
  // Styling - Common
  borderRadius = 8,
  imageHeight = 200, // For default variant
  height = 300, // For overlay variant
  padding = 24,
  
  // Styling - Colors
  backgroundColor = 'transparent',
  titleColor = '#000000',
  titleFontSize = 18,
  buttonColor = '#000000',
  buttonTextColor = '#ffffff', // Not used in current design but kept for compatibility
  buttonHoverColor = '#ff6b35',
  overlayColor = 'rgba(0,0,0,0.4)', // For overlay variant
  
  // Layout in Grid
  columnSpan = 1,

  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
}) => {
  // Migración automática de props antiguas a nuevas (solo una vez)
  const hasMigrated = React.useRef(false);
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  
  React.useEffect(() => {
    if (hasMigrated.current) return;
    
    if (linkUrl !== undefined && actionType === 'none') {
      hasMigrated.current = true;
      // Detectar y migrar linkUrl antiguo
      if (linkUrl.startsWith('http')) {
        setProp((props) => {
          props.actionType = 'external';
          props.externalUrl = linkUrl;
          props.externalNewTab = linkNewTab !== undefined ? linkNewTab : false;
          delete props.linkUrl;
          delete props.linkNewTab;
        });
      } else if (linkUrl.startsWith('#')) {
        setProp((props) => {
          props.actionType = 'route';
          props.to = linkUrl;
          delete props.linkUrl;
          delete props.linkNewTab;
        });
      } else if (linkUrl && linkUrl !== '#') {
        setProp((props) => {
          props.actionType = 'route';
          props.to = linkUrl;
          delete props.linkUrl;
          delete props.linkNewTab;
        });
      }
    }
  }, []); // Solo ejecutar una vez al montar

  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node }, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  
  const navigate = useNavigate();

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

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Sistema de navegación igual que Navbar (sin bloquear en modo editor)
    if (actionType === 'section') {
      const site = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site') : null;
      const qs = new URLSearchParams();
      if (site) qs.set('site', site);
      if (sectionName) qs.set('section', sectionName);
      const target = sectionName ? `/editor?${qs.toString()}` : '';
      if (!target) return;
      if (target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(target);
      return;
    }
    
    if (actionType === 'external') {
      const url = (externalUrl || '').trim();
      if (!url) return;
      if (typeof window !== 'undefined') {
        window.open(url, externalNewTab ? '_blank' : '_self');
      }
      return;
    }
    
    // Default: internal route
    const route = (to || '').trim();
    if (route) {
      if (route.startsWith('#')) {
        const el = document.querySelector(route);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(route);
    }
  };

  const commonStyle = {
    position: 'relative',
    width: '100%',
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    zIndex: Number(zIndex) || 0,
    outline: selected ? '2px dashed #3b82f6' : undefined,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    // fontFamily: 'sans-serif', // Removed to allow global font inheritance
    gridColumn: `span ${columnSpan}`,
  };

  // Render content function to avoid duplication
  const renderContent = (isOverlay) => (
    <>
      <h3
        style={{
          color: isOverlay ? '#ffffff' : titleColor,
          fontSize: `${titleFontSize}px`,
          fontWeight: '700',
          marginBottom: '20px',
          marginTop: 0,
          lineHeight: '1.2',
          textShadow: isOverlay ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {title}
      </h3>

      <button
        onClick={handleLinkClick}
        style={{
          background: 'transparent',
          color: isOverlay ? '#ffffff' : buttonColor,
          border: 'none',
          padding: '0',
          cursor: enabled ? 'default' : 'pointer',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'opacity 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        <i className="bi bi-justify-left" style={{ fontSize: '18px' }}></i>
        <span>{buttonText}</span>
      </button>
    </>
  );

  if (variant === 'overlay') {
    return (
      <div
        ref={(ref) => connect(drag(ref))}
        style={{
          ...commonStyle,
          height: `${height}px`,
          backgroundColor: 'transparent', // Fallback
        }}
      >
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}>
          <img
            src={imageUrl}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Use specific gradient for overlay style to make text readable */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)`,
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: `${padding}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end', // Text at bottom
        }}>
           {renderContent(true)}
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
      return (
        <div
            ref={(ref) => connect(drag(ref))}
            style={{
                ...commonStyle,
                flexDirection: 'row',
                backgroundColor: backgroundColor,
                height: 'auto', 
                minHeight: '150px',
                overflow: 'hidden' // Ensure image doesn't overflow
            }}
        >
            {/* Image Left */}
            <div style={{
                width: '40%', // Fixed width percentage for now
                position: 'relative',
                minHeight: '100%',
                flexShrink: 0,
            }}>
                <img
                    src={imageUrl}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
                />
            </div>
            {/* Content Right */}
            <div style={{
                flex: 1,
                padding: `${padding}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '12px'
            }}>
                 {renderContent(false)}
            </div>
            
             {/* Floating Delete Button (Only when selected) */}
             {selected && enabled && (
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-10px',
                    zIndex: 100,
                    backgroundColor: 'transparent',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                }}
                 onClick={(e) => {
                    e.stopPropagation();
                    // Simple delete placeholder if needed, usually craft handles this via UI
                 }}
                >
                     {/* Placeholder handle */}
                </div>
            )}
        </div>
      );
  }

  // Default Variant (Image Top, Text Bottom)
  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        ...commonStyle,
        backgroundColor: backgroundColor,
      }}
    >
      {/* Image Top */}
      <div style={{
        height: `${imageHeight}px`,
        width: '100%',
        position: 'relative',
      }}>
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Content Bottom */}
      <div style={{
        padding: `${padding}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>{renderContent(false)}</div>
      </div>
      
      {selected && (
        <div 
            className="position-absolute d-flex align-items-center px-3 rounded-top shadow-sm"
            style={{
                top: 0,
                left: 0,
                transform: 'translateY(-100%)',
                backgroundColor: 'transparent',
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

const FeatureCardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProp((p) => (p.imageUrl = event.target.result));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Contenido',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Columnas (Grid)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={1}
                  max={12}
                  value={props.columnSpan || 1}
                  onChange={(e) => setProp((p) => (p.columnSpan = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Variante (Estilo)</label>
                <select
                  className="form-select form-select-sm"
                  value={props.variant || 'default'}
                  onChange={(e) => setProp((p) => (p.variant = e.target.value))}
                >
                  <option value="default">Estándar (Imagen Arriba)</option>
                  <option value="overlay">Overlay (Texto sobre Imagen)</option>
                  <option value="horizontal">Horizontal (Lista)</option>
                </select>
              </div>
              
              {/* Sección de Imagen Mejorada */}
              <div className="border rounded p-2" style={{ backgroundColor: 'transparent' }}>
                <label className="form-label fw-bold mb-2">
                  <i className="bi bi-image me-1"></i> Imagen
                </label>
                
                {/* Preview de la imagen actual */}
                {props.imageUrl && (
                  <div className="mb-2 text-center">
                    <img 
                      src={props.imageUrl} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                      }} 
                    />
                  </div>
                )}
                
                {/* Subir desde computadora */}
                <div className="mb-2">
                  <label className="form-label small text-muted mb-1">Subir desde computadora:</label>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                
                {/* URL de imagen */}
                <div>
                  <label className="form-label small text-muted mb-1">O ingresar URL:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={props.imageUrl || ''}
                    onChange={(e) => setProp((p) => (p.imageUrl = e.target.value))}
                  />
                </div>
                
                {/* Botón para limpiar imagen */}
                {props.imageUrl && props.imageUrl !== 'https://placehold.co/400x300' && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 mt-2"
                    onClick={() => setProp((p) => (p.imageUrl = 'https://placehold.co/400x300'))}
                  >
                    <i className="bi bi-x-circle me-1"></i> Restablecer imagen
                  </button>
                )}
              </div>
              
              <div>
                <label className="form-label">Título</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={props.title || ''}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                />
              </div>
              
              {/* Sistema de navegación como en Navbar */}
              <div className="border rounded p-2" style={{ backgroundColor: 'transparent' }}>
                <label className="form-label fw-bold mb-2">
                  <i className="bi bi-link-45deg me-1"></i> Acción del Botón
                </label>
                
                <div className="mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={props.actionType || 'none'}
                    onChange={(e) => setProp((p) => (p.actionType = e.target.value))}
                  >
                    <option value="none">Sin acción</option>
                    <option value="section">Ir a Sección</option>
                    <option value="external">Link Externo</option>
                    <option value="route">Ruta Interna</option>
                  </select>
                </div>
                
                {props.actionType === 'section' && (
                  <input
                    className="form-control form-control-sm"
                    placeholder="Nombre sección (ej: foro, fauna)"
                    value={props.sectionName || ''}
                    onChange={(e) => setProp((p) => (p.sectionName = e.target.value))}
                  />
                )}
                
                {props.actionType === 'external' && (
                  <div className="d-grid gap-2">
                    <input
                      className="form-control form-control-sm"
                      placeholder="URL (https://...)"
                      value={props.externalUrl || ''}
                      onChange={(e) => setProp((p) => (p.externalUrl = e.target.value))}
                    />
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={props.newTab !== false}
                        onChange={(e) => setProp((p) => (p.newTab = e.target.checked))}
                      />
                      <label className="form-check-label small">Abrir en nueva pestaña</label>
                    </div>
                  </div>
                )}
                
                {props.actionType === 'route' && (
                  <div>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Ruta (ej: /login o #seccion)"
                      value={props.route || ''}
                      onChange={(e) => setProp((p) => (p.route = e.target.value))}
                    />
                    <small className="text-muted">Usa # para ir a una sección de la página</small>
                  </div>
                )}
              </div>
            </div>
          )
        },
        {
          label: 'Estilos',
          content: (
            <div className="d-grid gap-3">
              {props.variant === 'overlay' ? (
                 <div>
                   <label className="form-label">Altura Total</label>
                   <input
                     type="number"
                     className="form-control form-control-sm"
                     value={props.height || 300}
                     onChange={(e) => setProp((p) => (p.height = Number(e.target.value)))}
                   />
                 </div>
              ) : (
                <>
                  <div>
                    <label className="form-label">Altura Imagen</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={props.imageHeight || 200}
                      onChange={(e) => setProp((p) => (p.imageHeight = Number(e.target.value)))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Color de Fondo Card</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={props.backgroundColor || '#ffffff'}
                      onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Color Título</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={props.titleColor || '#000000'}
                      onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="form-label">Tamaño Fuente Título</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.titleFontSize || 18}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Color Botón</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.buttonColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.buttonColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Radio Borde</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.borderRadius || 8}
                  onChange={(e) => setProp((p) => (p.borderRadius = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        }
      ]}
    
    />
  );
};

FeatureCard.craft = {
  displayName: 'Feature Card',
  props: {
    imageUrl: 'https://placehold.co/400x300',
    title: 'Título del Card',
    buttonText: 'LEER',
    actionType: 'none',
    sectionName: '',
    externalUrl: '',
    route: '',
    newTab: false,
    variant: 'default',
    borderRadius: 8,
    imageHeight: 200,
    height: 300,
    padding: 24,
    backgroundColor: 'transparent',
    titleColor: '#000000',
    titleFontSize: 18,
    buttonColor: '#000000',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: FeatureCardSettings
  }
};
