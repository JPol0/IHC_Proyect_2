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
  linkUrl = '#',
  linkNewTab = false,
  
  // Layout
  variant = 'default', // 'default' | 'overlay'
  
  // Styling - Common
  borderRadius = 8,
  imageHeight = 200, // For default variant
  height = 300, // For overlay variant
  padding = 24,
  
  // Styling - Colors
  backgroundColor = '#ffffff',
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
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
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
    if (enabled) return;
    
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, linkNewTab ? '_blank' : '_self');
    } else {
      navigate(linkUrl);
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
    fontFamily: 'sans-serif',
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
          backgroundColor: '#000000', // Fallback
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

const FeatureCardSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

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
                </select>
              </div>
              
              <div>
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.imageUrl || ''}
                  onChange={(e) => setProp((p) => (p.imageUrl = e.target.value))}
                />
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
              
              <div>
                <label className="form-label">Link Url</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.linkUrl || '#'}
                  onChange={(e) => setProp((p) => (p.linkUrl = e.target.value))}
                />
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
    linkUrl: '#',
    variant: 'default',
    borderRadius: 8,
    imageHeight: 200,
    height: 300,
    padding: 24,
    backgroundColor: '#ffffff',
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
