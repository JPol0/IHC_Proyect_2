// components/user/Text.js
import React, { useEffect, useState } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { SettingsTabs } from "../ui/SettingsTabs";

export const Text = ({ text, fontSize, fontClass, translateX = 0, translateY = 0, zIndex = 0, opacity = 1, textColor = '#000000', textShadowX = 0, textShadowY = 0, textShadowBlur = 0, textShadowColor = '#000000', textAlign = 'left', lineHeight = 1.5 }) => {
  const { id, connectors: { connect, drag }, hasSelectedNode, hasDraggedNode, actions: { setProp } } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
    hasDraggedNode: state.events.dragged
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

  const [editable, setEditable] = useState(false);
  useEffect(() => {!hasSelectedNode && setEditable(false)},[hasSelectedNode])

  // Eliminado: manejo de movimiento por arrastre del mouse

  return (
    <div 
      ref={ref => connect(drag(ref))}
      onClick={() => setEditable(true)}
      style={{ 
        display: 'inline-block', // Permite que el texto se coloque al lado de otros
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`, 
        opacity: Math.max(0, Math.min(1, Number(opacity) || 0)), 
        position: 'relative', 
        zIndex: Number(zIndex) || 0 
      }}
    >
      <p
        className={fontClass || undefined}
        style={{
          fontSize,
          color: textColor || '#000000',
          textAlign: textAlign || 'left',
          lineHeight: (typeof lineHeight === 'number' && Number.isFinite(lineHeight)) ? lineHeight : (parseFloat(lineHeight) || 1.5),
          textShadow: `${Number(textShadowX) || 0}px ${Number(textShadowY) || 0}px ${Number(textShadowBlur) || 0}px ${textShadowColor || '#000000'}`,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </p>

      {hasSelectedNode && (
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
    </div>
  )
}

const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Texto",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Texto</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={props.text ?? ''}
                  onChange={(e) => setProp(p => p.text = e.target.value)}
                  placeholder="Escribe el contenido..."
                />
              </div>
              <div>
                <label className="form-label">Tipografía</label>
                <select
                  className="form-select form-select-sm"
                  value={props.fontClass ?? ''}
                  onChange={(e) => setProp(p => p.fontClass = e.target.value)}
                >
                  <option value="">Predeterminada del tema</option>
                  <option value="font-amazonica">Amazonica</option>
                  <option value="font-jungle-camp">Jungle Camp</option>
                </select>
              </div>
              <div>
                <label className="form-label">Tamaño de fuente</label>
                <input
                  type="range"
                  className="form-range"
                  min={8}
                  max={200}
                  step={1}
                  value={typeof props.fontSize === 'number' ? props.fontSize : 20}
                  onChange={(e) => setProp(props => props.fontSize = Number(e.target.value))}
                />
                <div className="small text-muted">{props.fontSize ?? 20}px</div>
              </div>
              <div>
                <label className="form-label">Alineación de texto</label>
                <select
                  className="form-select form-select-sm"
                  value={props.textAlign || 'left'}
                  onChange={(e) => setProp((p) => (p.textAlign = e.target.value))}
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                  <option value="justify">Justificado</option>
                </select>
              </div>
              <div>
                <label className="form-label">Interlineado</label>
                <input
                  type="range"
                  className="form-range"
                  min={0.8}
                  max={3}
                  step={0.1}
                  value={Number.isFinite(props.lineHeight) ? props.lineHeight : 1.5}
                  onChange={(e) => setProp((p) => (p.lineHeight = Number(e.target.value)))}
                />
                <div className="small text-muted">{(Number.isFinite(props.lineHeight) ? props.lineHeight : 1.5).toFixed(1)}x</div>
              </div>
              <div>
                <label className="form-label">Color de texto</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.textColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.textColor = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: "Efectos",
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label">Sombra X</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.textShadowX) ? props.textShadowX : 0}
                    onChange={(e) => setProp((p) => (p.textShadowX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Sombra Y</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.textShadowY) ? props.textShadowY : 0}
                    onChange={(e) => setProp((p) => (p.textShadowY = Number(e.target.value)))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Desenfoque</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    min={0}
                    value={Number.isFinite(props.textShadowBlur) ? props.textShadowBlur : 0}
                    onChange={(e) => setProp((p) => (p.textShadowBlur = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Color de la sombra</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.textShadowColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.textShadowColor = e.target.value))}
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
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Orden de capas (Z-index)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover horizontal</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                    placeholder="px"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover vertical</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                    placeholder="px"
                  />
                </div>
              </div>
            </div>
          )
        }
      ]}
    />
  )
}

Text.craft = {
  displayName: 'Texto',
  props: {
    text: "Texto de ejemplo",
    fontSize: 20,
    fontClass: '',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
    textColor: '#000000',
    textShadowX: 0,
    textShadowY: 0,
    textShadowBlur: 0,
    textShadowColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.5
  },
  rules:{
    canDrag: (node) => node.data.props.text !== "Drag",
  },
  related: {
    settings: TextSettings
  }
}