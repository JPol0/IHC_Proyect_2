import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { SettingsTabs } from "../ui/SettingsTabs";
import { navigateToSection } from '../../utils/navigation';

export const BackButton = ({
  iconSize = 28,
  iconColor = '#000000',
  backgroundColor = 'transparent',
  actionType = 'none',
  to = '',
  sectionName = '',
  externalUrl = '',
  externalNewTab = true,
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
  padding = 12
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

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (actionType === 'route' && to) {
      navigate(to);
    } else if (actionType === 'section' && sectionName) {
      navigateToSection(navigate, sectionName);
    } else if (actionType === 'external' && externalUrl) {
      if (externalNewTab) {
        window.open(externalUrl, '_blank');
      } else {
        window.location.href = externalUrl;
      }
    } else if (actionType === 'back') {
      navigate(-1);
    }
  };

  return (
    <button
      ref={ref => connect(drag(ref))}
      onClick={handleClick}
      style={{
        background: backgroundColor || 'transparent',
        border: 'none',
        cursor: actionType !== 'none' ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${padding}px`,
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        position: 'relative',
        zIndex: Number(zIndex) || 0,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        transition: 'transform 0.2s, opacity 0.2s',
      }}
      onMouseEnter={(e) => {
        if (actionType !== 'none') {
          e.currentTarget.style.transform = `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px) scale(1.1)`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px) scale(1)`;
      }}
      aria-label="Volver"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

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

const BackButtonSettings = () => {
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
                <label className="form-label">Padding (px)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  min="0"
                  max="50"
                  value={props.padding || 12}
                  onChange={(e) => setProp((p) => (p.padding = parseInt(e.target.value) || 12))}
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
                  value={props.actionType || 'none'}
                  onChange={(e) => setProp((p) => (p.actionType = e.target.value))}
                >
                  <option value="none">Ninguna</option>
                  <option value="back">Volver (historial)</option>
                  <option value="route">Ruta interna</option>
                  <option value="section">Sección</option>
                  <option value="external">URL externa</option>
                </select>
              </div>

              {props.actionType === 'route' && (
                <div>
                  <label className="form-label">Ruta</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.to || ''}
                    onChange={(e) => setProp((p) => (p.to = e.target.value))}
                    placeholder="/ruta"
                  />
                </div>
              )}

              {props.actionType === 'section' && (
                <div>
                  <label className="form-label">Nombre de sección</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.sectionName || ''}
                    onChange={(e) => setProp((p) => (p.sectionName = e.target.value))}
                    placeholder="nombre-seccion"
                  />
                </div>
              )}

              {props.actionType === 'external' && (
                <div>
                  <label className="form-label">URL externa</label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={props.externalUrl || ''}
                    onChange={(e) => setProp((p) => (p.externalUrl = e.target.value))}
                    placeholder="https://..."
                  />
                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={props.externalNewTab !== false}
                      onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
                    />
                    <label className="form-check-label">
                      Abrir en nueva pestaña
                    </label>
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

BackButton.craft = {
  displayName: 'Botón Retroceso',
  props: {
    iconSize: 28,
    iconColor: '#000000',
    backgroundColor: 'transparent',
    actionType: 'back',
    to: '',
    sectionName: '',
    externalUrl: '',
    externalNewTab: true,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
    padding: 12
  },
  related: {
    settings: BackButtonSettings
  }
};

export default BackButton;
