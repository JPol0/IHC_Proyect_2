// components/user/Button.jsx (Bootstrap/Tailwind)
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useNavigate } from "react-router-dom";
import { SettingsTabs } from "../ui/SettingsTabs";
import { navigateToSection } from '../../utils/navigation';

export const Button = ({
  size = "small",
  variant = "contained",
  color = "primary",
  // Custom colors
  buttonTextColor = '',
  buttonBgColor = '',
  buttonBorderColor = '',
  // Navigation/action
  actionType = 'route', // 'route' | 'section' | 'external'
  to = "", // internal route (react-router)
  sectionName = "", // for section navigation
  externalUrl = "", // for external link
  externalNewTab = true,
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  text = "Haz clic aquí",
  opacity = 1,
  className = "",
  children
}) => {
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected,
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

  const handleClick = (e) => {
    e.preventDefault();
    // Section navigation
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

  // Eliminado: manejo de movimiento por arrastre del mouse

  // Map props -> Bootstrap classes and merge with custom className
  const colorToken = (color || "primary").toLowerCase();
  const isOutline = variant === "outlined";
  const isLink = variant === "text";
  const hasCustomColors = !!(buttonTextColor || buttonBgColor || buttonBorderColor);
  const base = hasCustomColors
    ? "btn"
    : (isLink ? "btn btn-link" : `btn ${isOutline ? "btn-outline-" : "btn-"}${colorToken}`);
  const sizeCls = size === "large" ? "btn-lg" : size === "small" ? "btn-sm" : "";
  const classes = [base, sizeCls, className].filter(Boolean).join(" ");

  const computedStyle = {
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 0)),
    position: 'relative',
    zIndex: Number(zIndex) || 0
  };

  if (hasCustomColors) {
    if (isLink) {
      computedStyle.backgroundColor = 'transparent';
      if (buttonTextColor) computedStyle.color = buttonTextColor;
      computedStyle.border = 'none';
    } else if (isOutline) {
      computedStyle.backgroundColor = 'transparent';
      if (buttonTextColor) computedStyle.color = buttonTextColor;
      computedStyle.borderStyle = 'solid';
      computedStyle.borderWidth = 1;
      if (buttonBorderColor) computedStyle.borderColor = buttonBorderColor;
      else if (buttonTextColor) computedStyle.borderColor = buttonTextColor;
    } else {
      if (buttonBgColor) computedStyle.backgroundColor = buttonBgColor;
      if (buttonTextColor) computedStyle.color = buttonTextColor;
      computedStyle.borderStyle = 'solid';
      computedStyle.borderWidth = 1;
      if (buttonBorderColor) computedStyle.borderColor = buttonBorderColor;
      else if (buttonBgColor) computedStyle.borderColor = buttonBgColor;
    }
  }

  return (
    <button
      ref={(ref) => connect(drag(ref))}
      type="button"
      className={`${classes} justify-content-center`}
      style={computedStyle}
      onClick={handleClick}
    >
      {text}
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
             {/* Move */}
             <i 
                className="bi bi-arrows-move" 
                title="Mover"
                style={{ cursor: 'move', fontSize: '1.4rem' }}
                onMouseDown={handleMouseDown}
             />

             {/* Duplicate */}
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

             {/* Delete */}
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
  )
}

const ButtonSettings = () => {
  const { actions: {setProp}, props } = useNode((node) => ({
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
                <label className="form-label">Texto del botón</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.text ?? ""}
                  onChange={(e) => setProp((props) => (props.text = e.target.value))}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Tamaño</label>
                  <select
                    className="form-select form-select-sm"
                    value={props.size || 'small'}
                    onChange={(e) => setProp((props) => (props.size = e.target.value))}
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Variante</label>
                  <select
                    className="form-select form-select-sm"
                    value={props.variant || 'contained'}
                    onChange={(e) => setProp((props) => (props.variant = e.target.value))}
                  >
                    <option value="text">Texto</option>
                    <option value="outlined">Con borde</option>
                    <option value="contained">Relleno</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Color predefinido</label>
                <select
                  className="form-select form-select-sm"
                  value={props.color || 'primary'}
                  onChange={(e) => setProp((props) => (props.color = e.target.value))}
                >
                  <option value="primary">Principal</option>
                  <option value="secondary">Secundario</option>
                  <option value="success">Éxito</option>
                  <option value="danger">Peligro</option>
                  <option value="warning">Advertencia</option>
                  <option value="info">Información</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              
              <hr className="my-1" />
              <label className="form-label text-muted small">Colores personalizados</label>
              
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small">Texto</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonTextColor || '#ffffff'}
                    onChange={(e) => setProp((p) => (p.buttonTextColor = e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small">Fondo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonBgColor || '#0d6efd'}
                    onChange={(e) => setProp((p) => (p.buttonBgColor = e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small">Borde</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonBorderColor || '#0d6efd'}
                    onChange={(e) => setProp((p) => (p.buttonBorderColor = e.target.value))}
                  />
                </div>
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
                  <label className="form-label">Ruta (Ej: /contacto)</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.to ?? ''}
                    onChange={(e) => setProp((p) => (p.to = e.target.value))}
                    placeholder="/mi-pagina"
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
                    placeholder="Landing, Home..."
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
                      placeholder="https://google.com"
                    />
                  </div>
                  <div className="form-check">
                    <input
                      id="btn-ext-newtab"
                      className="form-check-input"
                      type="checkbox"
                      checked={!!props.externalNewTab}
                      onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
                    />
                    <label className="form-check-label" htmlFor="btn-ext-newtab">Abrir en nueva pestaña</label>
                  </div>
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
                  <label className="form-label">Mover X</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Z-Index</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
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
                  step={0.1}
                  value={Number.isFinite(props.opacity) ? props.opacity : 1}
                  onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        }
      ]}
    />
  )
};

Button.craft = {
  displayName: 'Botón',
  props: { 
    size: "small", 
    variant: "contained",
    color: "primary",
    buttonTextColor: '',
    buttonBgColor: '',
    buttonBorderColor: '',
    actionType: 'route',
    text: "Haz clic aquí",
    to: "",
    sectionName: "",
    externalUrl: "",
    externalNewTab: true,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
    className: ""
  },
  related: {
    settings: ButtonSettings
  }
}
