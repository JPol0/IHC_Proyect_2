import React from 'react';
import { Element, useEditor, useNode } from '@craftjs/core';
import { Container } from './Container';
import { SettingsTabs } from '../ui/SettingsTabs';

/**
 * ColumnsContainer (Contenedor de columnas)
 * Reimplementado tomando como base el Container que ya funciona,
 * pero usando CSS Grid para crear N columnas iguales (1fr c/u) y
 * convirtiendo cada columna en un canvas independiente.
 */
function BaseColumnsContainer({
  // Layout de columnas
  columns = 2, // número fijo por variante
  gap = 8,
  // Apariencia
  background = '#ffffff',
  transparentBackground = false,
  padding = 10,
  // Posicionamiento
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  margin = 5,
  opacity = 1,
  // Tamaño
  width = '100%',
  height = 20, // minHeight del contenedor
}) {
  const { id, connectors: { connect, drag }, actions: { setProp }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { enabled, actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor((state) => ({ enabled: state.options.enabled }));

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

  const cols = Math.min(6, Math.max(2, Number(columns) || 2));

  const baseStyle = {
    // Igual que Container, pero forzamos grid
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    justifyItems: 'stretch',
    alignItems: 'stretch',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    padding: `${Math.max(5, padding)}px`,
    borderRadius: 0,
    boxShadow: 'none',
    width: typeof width === 'number' ? `${width}px` : (width || '100%'),
    height: 'auto',
    minWidth: 0,
    minHeight: Number.isFinite(height) ? height : 20,
    boxSizing: 'border-box',
    background: transparentBackground ? 'transparent' : (background || '#ffffff'),
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    position: 'relative',
    margin: typeof margin === 'number' ? `${margin}px` : (margin || 0),
    zIndex: Number(zIndex) || 0,
    outline: selected ? '1px dashed #3b82f6' : undefined,
  };

  // Renderizamos exactamente N slots para que Craft mantenga el árbol estable
  const slots = new Array(cols).fill(0).map((_, i) => i);

  return (
    <div ref={(ref) => connect(drag(ref))} style={baseStyle}>
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

      {/* Zonas activas para facilitar selección cuando está vacío */}
      {enabled && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 8, pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 8, pointerEvents: 'auto' }} />
        </div>
      )}

      {slots.map((n) => (
        <div key={n} style={{ minHeight: Number.isFinite(height) ? height : 20 }}>
          <Element
            is={Container}
            canvas
            padding={16}
            background="#ffffff"
            transparentBackground={false}
          />
        </div>
      ))}
    </div>
  );
}

// Componentes fijos: 2, 3 y 4 columnas
export function Columns2(props) {
  return <BaseColumnsContainer {...props} columns={2} />;
}

export function Columns3(props) {
  return <BaseColumnsContainer {...props} columns={3} />;
}

export function Columns4(props) {
  return <BaseColumnsContainer {...props} columns={4} />;
}

export function ColumnsContainerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const cols = Math.min(6, Math.max(2, Number(props.columns) || 2));
  const locked = !!props.lockedColumns;

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              {!locked && (
                <div>
                  <label className="form-label">Columnas</label>
                  <input
                    type="range"
                    className="form-range"
                    min={2}
                    max={6}
                    step={1}
                    value={cols}
                    onChange={(e) => setProp((p) => (p.columns = Number(e.target.value)))}
                  />
                  <div className="small text-muted">{cols} columnas</div>
                </div>
              )}
              
              <div>
                <label className="form-label">Espacio entre columnas</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={48}
                  step={1}
                  value={typeof props.gap === 'number' ? props.gap : 8}
                  onChange={(e) => setProp((p) => (p.gap = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.gap ?? 8}px</div>
              </div>

              <div>
                <label className="form-label">Relleno (Padding)</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={100}
                  step={1}
                  value={typeof props.padding === 'number' ? props.padding : 10}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.padding ?? 10}px</div>
              </div>

              <div>
                <label className="form-label">Margen</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={64}
                  step={1}
                  value={typeof props.margin === 'number' ? props.margin : 5}
                  onChange={(e) => setProp((p) => (p.margin = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.margin ?? 5}px</div>
              </div>

              <div className="form-check">
                <input
                  id="cols-transparent"
                  type="checkbox"
                  className="form-check-input"
                  checked={!!props.transparentBackground}
                  onChange={(e) => setProp((p) => (p.transparentBackground = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="cols-transparent">Fondo transparente</label>
              </div>
              
              <div>
                <label className="form-label">Color de fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.background || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.background = e.target.value))}
                  disabled={!!props.transparentBackground}
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
}

Columns2.craft = {
  props: {
    lockedColumns: true,
    columns: 2,
    gap: 8,
    padding: 10,
    background: '#ffffff',
    transparentBackground: false,
    margin: 5,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    width: '100%',
    height: 20,
    opacity: 1,
  },
  related: { settings: ColumnsContainerSettings },
};

Columns3.craft = {
  props: {
    lockedColumns: true,
    columns: 3,
    gap: 8,
    padding: 10,
    background: '#ffffff',
    transparentBackground: false,
    margin: 5,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    width: '100%',
    height: 20,
    opacity: 1,
  },
  related: { settings: ColumnsContainerSettings },
};

Columns4.craft = {
  props: {
    lockedColumns: true,
    columns: 4,
    gap: 8,
    padding: 10,
    background: '#ffffff',
    transparentBackground: false,
    margin: 5,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    width: '100%',
    height: 20,
    opacity: 1,
  },
  related: { settings: ColumnsContainerSettings },
};
