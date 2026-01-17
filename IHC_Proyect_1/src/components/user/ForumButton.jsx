import React, { useState } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useNavigate } from "react-router-dom";
import { SettingsTabs } from "../ui/SettingsTabs";
import { navigateToSection } from '../../utils/navigation';

export const ForumButton = ({ 
  text = "",
  backgroundColor = 'transparent',
  textColor = '#000000',
  hoverColor = '#000000',
  iconColor = '#000000',
  iconSize = 28,
  fontSize = 16,
  padding = '12px',
  borderRadius = 0,
  borderWidth = 0,
  borderColor = 'transparent',
  showIcon = true,
  showText = false,
  
  // Link properties
  actionType = 'route', // 'none', 'route', 'section', 'external'
  to = '/forum', // route path
  sectionName = '', // search param for section '?section=name'
  externalUrl = '', // for external links
  externalNewTab = false,
  
  // Legacy
  route,

  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
  ...props 
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
  
  // Migration for legacy props
  React.useEffect(() => {
    if (route) {
        setProp(props => {
          if (!props.to) props.to = route;
          props.route = undefined;
        });
    }
  }, [route, setProp]);

  // Handle click logic from Button.jsx
  const handleClick = (e) => {
    e.preventDefault();
    if (enabled) return;

    if (actionType === 'section') {
      navigateToSection(navigate, sectionName);
      return;
    }
    
    // External link
    if (actionType === 'external') {
      const url = (externalUrl || '').trim();
      if (!url) return;
      if (typeof window !== 'undefined') {
        window.open(url, externalNewTab ? '_blank' : '_self');
      }
      return;
    }

    // Default: internal route
    const r = (to || '').trim();
    if (r) {
      if (r.startsWith('#')) {
        const el = document.querySelector(r);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(r);
    }
  };

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

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      {...props}
      ref={(ref) => connect(drag(ref))}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}

      className="d-inline-flex align-items-center justify-content-center gap-2"
      style={{ 
        backgroundColor: backgroundColor || 'transparent',
        border: 'none',
        color: textColor,
        padding: padding,
        fontSize: `${fontSize}px`,
        borderRadius: `${borderRadius}px`,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px) scale(${isHovered ? 1.1 : 1})`,
        zIndex: Number(zIndex) || 0,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        position: 'relative',
        ...props.style 
      }}
    >
      {showIcon && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Burbuja de chat rectangular con bordes redondeados */}
          <rect
            x="3"
            y="3"
            width="18"
            height="14"
            rx="2"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Cola triangular pequeña apuntando hacia abajo desde la esquina inferior izquierda */}
          <path
            d="M4 17L6 20L8 17H4Z"
            fill={iconColor}
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tres líneas horizontales de diferentes longitudes (centradas) */}
          <line
            x1="7"
            y1="8"
            x2="17"
            y2="8"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="7"
            y1="11"
            x2="14"
            y2="11"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="7"
            y1="14"
            x2="11"
            y2="14"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {showText && text && (
        <span>{text}</span>
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
    </button>
  );
};

export const ForumButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "General",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Texto del botón</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.text || 'Ir al Foro'}
                  onChange={(e) => setProp((p) => (p.text = e.target.value))}
                />
              </div>
              
              {/* Sistema de navegación */}
              <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
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
                        checked={props.externalNewTab !== false}
                        onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
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
                      value={props.to || ''}
                      onChange={(e) => setProp((p) => (p.to = e.target.value))}
                    />
                    <small className="text-muted">Usa # para ir a una sección de la página</small>
                  </div>
                )}
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showIcon !== false}
                  onChange={(e) => setProp((p) => (p.showIcon = e.target.checked))}
                />
                <label className="form-check-label">
                  Mostrar icono
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showText || false}
                  onChange={(e) => setProp((p) => (p.showText = e.target.checked))}
                />
                <label className="form-check-label">
                  Mostrar texto
                </label>
              </div>
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color de fondo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.backgroundColor || '#ff5722'}
                    onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color hover</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.hoverColor || '#e64a19'}
                    onChange={(e) => setProp((p) => (p.hoverColor = e.target.value))}
                  />
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color del texto</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.textColor || '#ffffff'}
                    onChange={(e) => setProp((p) => (p.textColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color del icono</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.iconColor || '#ffffff'}
                    onChange={(e) => setProp((p) => (p.iconColor = e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Tamaño del texto (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="10"
                  max="32"
                  value={props.fontSize || 16}
                  onChange={(e) => setProp((p) => (p.fontSize = parseInt(e.target.value) || 16))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del icono (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="10"
                  max="40"
                  value={props.iconSize || 20}
                  onChange={(e) => setProp((p) => (p.iconSize = parseInt(e.target.value) || 20))}
                />
              </div>
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.padding || '12px 24px'}
                  onChange={(e) => setProp((p) => (p.padding = e.target.value))}
                  placeholder="12px 24px"
                />
              </div>
              <div>
                <label className="form-label">Bordes redondeados (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="0"
                  max="50"
                  value={props.borderRadius || 8}
                  onChange={(e) => setProp((p) => (p.borderRadius = parseInt(e.target.value) || 8))}
                />
              </div>
              <div>
                <label className="form-label">Ancho del borde (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="0"
                  max="10"
                  value={props.borderWidth || 0}
                  onChange={(e) => setProp((p) => (p.borderWidth = parseInt(e.target.value) || 0))}
                />
              </div>
              {props.borderWidth > 0 && (
                <div>
                  <label className="form-label">Color del borde</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.borderColor || '#000000'}
                    onChange={(e) => setProp((p) => (p.borderColor = e.target.value))}
                  />
                </div>
              )}
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

ForumButton.craft = {
  displayName: "Botón Foro",
  props: {
    text: "",
    backgroundColor: 'transparent',
    textColor: '#000000',
    hoverColor: '#000000',
    iconColor: '#000000',
    iconSize: 28,
    fontSize: 16,
    padding: '12px',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    showIcon: true,
    showText: false,
    actionType: 'route',
    to: '/forum',
    sectionName: '',
    externalUrl: '',
    externalNewTab: false,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1
  },
  related: {
    settings: ForumButtonSettings,
  },
};
