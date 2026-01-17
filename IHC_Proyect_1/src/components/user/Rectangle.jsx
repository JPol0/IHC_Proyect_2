// components/user/Rectangle.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';

export const Rectangle = ({
  width = 200,
  height = 50,
  backgroundColor = '#ff6b35',
  borderRadius = 0,
  rotation = 0, 
  marginX = 0,
  marginY = 0,
  opacity = 1,
  translateX = 0,
  translateY = 0,
}) => {
  const { id, connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();

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

  return (
    <div
      ref={ref => connect(drag(ref))}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
        margin: `${marginY}px ${marginX}px`,
        opacity,
        display: 'inline-block',
        position: 'relative',
        boxSizing: 'border-box',
        border: selected ? '2px dashed #3b82f6' : 'none',
      }}
    >
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

const RectangleSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Estilo',
          content: (
            <div className="d-grid gap-3">
               <div className="row g-2">
                 <div className="col-6">
                    <label className="form-label">Ancho (Width)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={props.width}
                      onChange={(e) => setProp((p) => (p.width = Number(e.target.value)))}
                    />
                 </div>
                 <div className="col-6">
                    <label className="form-label">Alto (Height)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={props.height}
                      onChange={(e) => setProp((p) => (p.height = Number(e.target.value)))}
                    />
                 </div>
               </div>

               <div>
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>

               <div>
                <label className="form-label">Radio del Borde</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={Math.min(props.width, props.height) / 2}
                  value={props.borderRadius}
                  onChange={(e) => setProp((p) => (p.borderRadius = Number(e.target.value)))}
                />
                 <div className="small text-muted">{props.borderRadius}px</div>
              </div>

              <div>
                <label className="form-label">Rotación</label>
                <select
                  className="form-select"
                  value={props.rotation}
                  onChange={(e) => setProp((p) => (p.rotation = Number(e.target.value)))}
                >
                    <option value={0}>0° (Horizontal)</option>
                    <option value={90}>90° (Vertical)</option>
                    <option value={180}>180°</option>
                    <option value={270}>270°</option>
                </select>
              </div>
            </div>
          )
        },
        {
            label: 'Espaciado',
            content: (
                <div className="d-grid gap-3">
                    <div>
                        <label className="form-label">Margen Horizontal (X)</label>
                        <input
                            type="range"
                            className="form-range"
                            min={0}
                            max={200}
                             value={props.marginX}
                             onChange={(e) => setProp((p) => (p.marginX = Number(e.target.value)))}
                        />
                         <div className="small text-muted">{props.marginX}px</div>
                    </div>
                     <div>
                        <label className="form-label">Margen Vertical (Y)</label>
                        <input
                            type="range"
                            className="form-range"
                            min={0}
                            max={200}
                             value={props.marginY}
                             onChange={(e) => setProp((p) => (p.marginY = Number(e.target.value)))}
                        />
                         <div className="small text-muted">{props.marginY}px</div>
                    </div>
                     <div>
                        <label className="form-label">Opacidad</label>
                        <input
                            type="range"
                            className="form-range"
                            min={0}
                            max={1}
                            step={0.1}
                             value={props.opacity}
                             onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                        />
                         <div className="small text-muted">{props.opacity}</div>
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
                    className="form-control form-control-sm"
                    type="number"
                    value={props.translateX}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={props.translateY}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                  />
                </div>
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

Rectangle.craft = {
  displayName: 'Rectangulo/Linea',
  props: {
    width: 200,
    height: 10,
    backgroundColor: '#ff6b35',
    borderRadius: 0,
    rotation: 0,
    marginX: 0,
    marginY: 0,
    opacity: 1,
    translateX: 0,
    translateY: 0,
  },
  related: {
    settings: RectangleSettings
  }
};
