import React, { useRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { SettingsTabs } from "../ui/SettingsTabs";

export const ChevronButton = ({
  to,
  sectionName,
  direction = 'left',
  size = 56,
  stroke = 8,
  color = '#E6E3A1',
  bg = 'transparent',
  rounded = true,
  title,
  ariaLabel,
  className = '',
  style = {},
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
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    let target = to;
    if (!target && sectionName) {
      // Preservar el sitio actual
      const site = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site') : null;
      const qs = new URLSearchParams();
      if (site) qs.set('site', site);
      qs.set('section', sectionName);
      target = `/editor?${qs.toString()}`;
    }
    if (!target) return;

    if (typeof target === 'string' && target.startsWith('#')) {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(target);
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

  const rotation =
    {
      left: 0,
      right: 180,
      up: -90,
      down: 90,
    }[direction] ?? 0;

  const btnStyle = {
    background: bg,
    border: 'none',
    width: size + 16,
    height: size + 16,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rounded ? '9999px' : '8px',
    cursor: 'pointer',
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 0)),
    position: 'relative',
    zIndex: Number(zIndex) || 0,
    ...style,
  };

  return (
    <button
      ref={(ref) => connect(drag(ref))}
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={ariaLabel || title || 'Ir'}
      className={`btn p-0 ${className}`}
      style={btnStyle}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        role="img"
        aria-hidden="true"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <polyline
          points="34,12 18,28 34,44"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
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
  );
};

const ChevronButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Dirección</label>
                <select
                  className="form-select form-select-sm"
                  value={props.direction || 'left'}
                  onChange={(e) => setProp((p) => (p.direction = e.target.value))}
                >
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                  <option value="up">Arriba</option>
                  <option value="down">Abajo</option>
                </select>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Tamaño (px)</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    min={24}
                    max={128}
                    value={Number.isFinite(props.size) ? props.size : 56}
                    onChange={(e) => setProp((p) => (p.size = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Grosor</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    min={2}
                    max={16}
                    value={Number.isFinite(props.stroke) ? props.stroke : 8}
                    onChange={(e) => setProp((p) => (p.stroke = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color Icono</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.color || '#E6E3A1'}
                    onChange={(e) => setProp((p) => (p.color = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Fondo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.bg || '#00000000'}
                    onChange={(e) => setProp((p) => (p.bg = e.target.value))}
                  />
                </div>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="chev-rounded"
                  checked={!!props.rounded}
                  onChange={(e) => setProp((p) => (p.rounded = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="chev-rounded">
                  Bordes redondeados
                </label>
              </div>
            </div>
          )
        },
        {
          label: "Acción",
          content: (
            <div className="d-grid gap-3">
               <div>
                <label className="form-label">Ir a sección (Nombre)</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.sectionName ?? ''}
                  onChange={(e) => setProp((p) => (p.sectionName = e.target.value))}
                  placeholder="Ej: Landing"
                />
              </div>
               <div>
                <label className="form-label">O ir a ruta interna</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.to ?? ''}
                  onChange={(e) => setProp((p) => (p.to = e.target.value))}
                  placeholder="/blog"
                />
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
                <label className="form-label">Z-index</label>
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
                  className="form-range"
                  type="range"
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

ChevronButton.craft = {
  displayName: 'Botón Flecha',
  props: {
    to: '',
    sectionName: '',
    direction: 'left',
    size: 56,
    stroke: 8,
    color: '#E6E3A1',
    bg: 'transparent',
    rounded: true,
    title: '',
    ariaLabel: '',
    className: '',
    style: {},
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: ChevronButtonSettings,
  },
};
