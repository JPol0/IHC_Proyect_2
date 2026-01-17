// components/user/Rectangle.jsx
import React from 'react';
import { useNode } from '@craftjs/core';
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
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

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
    />
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
