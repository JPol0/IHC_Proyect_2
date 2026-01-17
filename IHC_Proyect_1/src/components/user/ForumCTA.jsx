// components/user/ForumCTA.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { SettingsTabs } from '../ui/SettingsTabs';
import { navigateToSection } from '../../utils/navigation';

export const ForumCTA = ({
  title = 'Visita el foro',
  titleColor = '#ffffff',
  titleFontSize = 48,
  accentColor = '#ff6b35',
  backgroundColor = '#1a1a1a',
  description = 'Un espacio diseñado para conectar, aprender y compartir experiencias. ¡Te estamos esperando!',
  descriptionColor = '#ffffff',
  descriptionFontSize = 18,
  buttonText = 'Entrar ahora',
  buttonColor = '#ff6b35',
  buttonTextColor = '#ffffff',
  buttonHoverColor = '#e55a2b',
  padding = 60,
  // Navigation
  actionType = 'route', // 'route' | 'section' | 'external'
  route = '/forum',
  sectionName = '',
  externalUrl = '',
  externalNewTab = true,
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
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
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
    
    if (actionType === 'section') {
      navigateToSection(navigate, sectionName);
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
    const routePath = (route || '').trim();
    if (routePath) {
      navigate(routePath);
    }
  };

  const containerStyle = {
    backgroundColor,
    padding: `${padding}px`,
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    zIndex: Number(zIndex) || 0,
    position: 'relative',
    outline: selected ? '2px dashed #3b82f6' : undefined,
    textAlign: 'center',
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={containerStyle}
    >
      {/* Title */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '6px', height: '48px', backgroundColor: accentColor }} />
        <h2 style={{ 
          color: titleColor, 
          fontSize: `${titleFontSize}px`, 
          fontWeight: 'bold',
          margin: 0 
        }}>
          {title}
        </h2>
      </div>

      {/* Description */}
      {description && (
        <p style={{
          color: descriptionColor,
          fontSize: `${descriptionFontSize}px`,
          marginBottom: '32px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      )}

      {/* CTA Button */}
      <button
        onClick={handleButtonClick}
        style={{
          backgroundColor: buttonColor,
          color: buttonTextColor,
          border: 'none',
          padding: '16px 48px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = buttonHoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = buttonColor;
        }}
      >
        {buttonText}
      </button>

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

const ForumCTASettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Contenido",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.title ?? 'Visita el foro'}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={props.description ?? ''}
                  onChange={(e) => setProp((p) => (p.description = e.target.value))}
                  placeholder="Descripción del CTA..."
                />
              </div>
              <div>
                <label className="form-label">Texto del botón</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.buttonText ?? 'Entrar ahora'}
                  onChange={(e) => setProp((p) => (p.buttonText = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: "Acción",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Tipo de acción</label>
                <select
                  className="form-select form-select-sm"
                  value={props.actionType || 'route'}
                  onChange={(e) => setProp((p) => (p.actionType = e.target.value))}
                >
                  <option value="route">Ruta interna</option>
                  <option value="section">Ir a sección</option>
                  <option value="external">Enlace externo</option>
                </select>
              </div>

              {(props.actionType || 'route') === 'route' && (
                <div>
                  <label className="form-label">Ruta (Ej: /forum)</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.route ?? '/forum'}
                    onChange={(e) => setProp((p) => (p.route = e.target.value))}
                    placeholder="/forum"
                  />
                </div>
              )}

              {(props.actionType || 'route') === 'section' && (
                <div>
                  <label className="form-label">Nombre de sección</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.sectionName ?? ''}
                    onChange={(e) => setProp((p) => (p.sectionName = e.target.value))}
                    placeholder="foro"
                  />
                </div>
              )}

              {(props.actionType || 'route') === 'external' && (
                <div className="d-grid gap-2">
                  <div>
                    <label className="form-label">URL externa</label>
                    <input
                      className="form-control form-control-sm"
                      type="text"
                      value={props.externalUrl ?? ''}
                      onChange={(e) => setProp((p) => (p.externalUrl = e.target.value))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-check">
                    <input
                      id="forum-cta-ext-newtab"
                      className="form-check-input"
                      type="checkbox"
                      checked={!!props.externalNewTab}
                      onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
                    />
                    <label className="form-check-label" htmlFor="forum-cta-ext-newtab">Abrir en nueva pestaña</label>
                  </div>
                </div>
              )}
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color de fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor ?? '#1a1a1a'}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color del título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.titleColor ?? '#ffffff'}
                  onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del título (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={24}
                  max={72}
                  step={2}
                  value={props.titleFontSize ?? 48}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.titleFontSize ?? 48}px</div>
              </div>
              <div>
                <label className="form-label">Color de acento</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.accentColor ?? '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.accentColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color de descripción</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.descriptionColor ?? '#ffffff'}
                  onChange={(e) => setProp((p) => (p.descriptionColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño de descripción (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={12}
                  max={32}
                  step={1}
                  value={props.descriptionFontSize ?? 18}
                  onChange={(e) => setProp((p) => (p.descriptionFontSize = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.descriptionFontSize ?? 18}px</div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color botón</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonColor ?? '#ff6b35'}
                    onChange={(e) => setProp((p) => (p.buttonColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color texto botón</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonTextColor ?? '#ffffff'}
                    onChange={(e) => setProp((p) => (p.buttonTextColor = e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Color hover botón</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.buttonHoverColor ?? '#e55a2b'}
                  onChange={(e) => setProp((p) => (p.buttonHoverColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Padding (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={20}
                  max={120}
                  step={5}
                  value={props.padding ?? 60}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.padding ?? 60}px</div>
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

ForumCTA.craft = {
  displayName: 'CTA Foro',
  props: {
    title: 'Visita el foro',
    titleColor: '#ffffff',
    titleFontSize: 48,
    accentColor: '#ff6b35',
    backgroundColor: '#1a1a1a',
    description: 'Un espacio diseñado para conectar, aprender y compartir experiencias. ¡Te estamos esperando!',
    descriptionColor: '#ffffff',
    descriptionFontSize: 18,
    buttonText: 'Entrar ahora',
    buttonColor: '#ff6b35',
    buttonTextColor: '#ffffff',
    buttonHoverColor: '#e55a2b',
    padding: 60,
    actionType: 'route',
    route: '/forum',
    sectionName: '',
    externalUrl: '',
    externalNewTab: true,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: ForumCTASettings
  }
};
