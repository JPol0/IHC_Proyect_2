// components/user/TribesCard.jsx
// Card individual para el grid de Tribus Indígenas
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useNavigate } from 'react-router-dom';

export const TribesCard = ({
  imageUrl = 'https://placehold.co/400x300',
  title = 'Título del Card',
  titleColor = '#000000',
  titleFontSize = 18,
  buttonText = 'LEER',
  buttonColor = '#000000',
  buttonTextColor = '#ffffff',
  buttonHoverColor = '#ff6b35',
  linkUrl = '#',
  linkNewTab = false,
  // Estilos
  backgroundColor = '#ffffff',
  borderRadius = 8,
  padding = 0,
  imageHeight = 200,
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

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (enabled) return;
    
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, linkNewTab ? '_blank' : '_self');
    } else {
      navigate(linkUrl);
    }
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: backgroundColor,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        zIndex: Number(zIndex) || 0,
        outline: selected ? '2px dashed #3b82f6' : undefined,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Imagen */}
      <div
        style={{
          width: '100%',
          height: `${imageHeight}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Contenido */}
      <div style={{ padding: `${padding || 24}px` }}>
        {/* Título */}
        <h3
          style={{
            color: titleColor,
            fontSize: `${titleFontSize}px`,
            fontWeight: '600',
            marginBottom: '20px',
            marginTop: 0,
            fontFamily: 'sans-serif',
            lineHeight: '1.3',
          }}
        >
          {title}
        </h3>

        {/* Botón LEER */}
        <button
          onClick={handleButtonClick}
          onMouseDown={(e) => {
            if (!enabled) {
              e.stopPropagation();
            }
          }}
          style={{
            background: 'transparent',
            color: buttonTextColor,
            border: 'none',
            padding: '0',
            cursor: enabled ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'opacity 0.2s',
            pointerEvents: enabled ? 'none' : 'auto',
            fontFamily: 'sans-serif',
          }}
          onMouseEnter={(e) => {
            if (!enabled) {
              e.currentTarget.style.opacity = '0.7';
            }
          }}
          onMouseLeave={(e) => {
            if (!enabled) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          <i className="bi bi-list" style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '1' }}></i>
          <span style={{ letterSpacing: '0.5px' }}>{buttonText}</span>
        </button>
      </div>

      {/* Indicador de selección */}
      {selected && id !== 'ROOT' && (
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

const TribesCardSettings = () => {
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
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.imageUrl || ''}
                  onChange={(e) => setProp((p) => (p.imageUrl = e.target.value))}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.title || ''}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                  placeholder="Título del card..."
                />
              </div>
              
              <div>
                <label className="form-label">Texto del Botón</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.buttonText || 'LEER'}
                  onChange={(e) => setProp((p) => (p.buttonText = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Link del Botón</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.linkUrl || '#'}
                  onChange={(e) => setProp((p) => (p.linkUrl = e.target.value))}
                  placeholder="/ruta o https://..."
                />
                <small className="text-muted">Ruta interna o URL externa</small>
              </div>
              
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.linkNewTab || false}
                  onChange={(e) => setProp((p) => (p.linkNewTab = e.target.checked))}
                />
                <label className="form-check-label">Abrir en nueva pestaña</label>
              </div>
            </div>
          )
        },
        {
          label: 'Estilos',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.titleColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Tamaño del Título</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.titleFontSize || 18}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Botón</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.buttonColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.buttonColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Texto del Botón</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.buttonTextColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.buttonTextColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Color Hover del Botón</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.buttonHoverColor || '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.buttonHoverColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Altura de la Imagen</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.imageHeight || 200}
                  onChange={(e) => setProp((p) => (p.imageHeight = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.padding || 20}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Border Radius</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.borderRadius || 8}
                  onChange={(e) => setProp((p) => (p.borderRadius = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Avanzado',
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover X</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Z-Index</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Opacidad</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number.isFinite(props.opacity) ? props.opacity : 1}
                  onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                />
                <div className="small text-muted">{(props.opacity ?? 1).toFixed(2)}</div>
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

TribesCard.craft = {
  displayName: 'Card Tribus',
  props: {
    imageUrl: 'https://placehold.co/400x300',
    title: 'Título del Card',
    titleColor: '#000000',
    titleFontSize: 18,
    buttonText: 'LEER',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff',
    buttonHoverColor: '#ff6b35',
    linkUrl: '#',
    linkNewTab: false,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    imageHeight: 200,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: TribesCardSettings
  }
};
