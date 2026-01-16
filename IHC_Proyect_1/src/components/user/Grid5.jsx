// components/user/Grid5.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';

export const Grid5 = ({
  gap = 20,
  padding = 20,
  backgroundColor = 'transparent',
  gridTemplateColumns = 'repeat(6, 1fr)',
  translateX = 0,
  translateY = 0,
  children
}) => {
  const {
    id,
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((node) => ({
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

  const containerStyles = {
    display: 'grid',
    justifyContent: 'center',
    gridTemplateColumns: gridTemplateColumns,
    gap: `${gap}px`,
    padding: `${padding}px`,
    backgroundColor: backgroundColor,
    width: 'fit-content',
    margin: '0 auto',
    outline: selected ? '2px dashed #3b82f6' : undefined,
    outlineOffset: '-2px',
    position: 'relative',
    minHeight: '100px',
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`
  };

  return (
    <div 
      ref={ref => connect(drag(ref))}
      style={containerStyles}
    >
       {children}
       
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
                  try {
                    const currentNode = node(id).get();
                    const freshNode = createNode(
                      React.createElement(
                        currentNode.data.type,
                        { ...currentNode.data.props }
                      )
                    );
                    add(freshNode, currentNode.data.parent);
                    selectNode(freshNode.id);
                  } catch (err) {
                    console.error('Error al duplicar:', err);
                  }
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

export const Grid5Settings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props,
    }));

    return (
        <SettingsTabs
            tabs={[
                {
                    label: 'Diseño',
                    content: (
                        <div className="d-grid gap-3">
                            <div>
                                <label className="form-label">Espacio entre tarjetas (Gap)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={props.gap}
                                    onChange={(e) => setProp((p) => (p.gap = Number(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className="form-label">Relleno (Padding)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={props.padding}
                                    onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                                />
                            </div>
                            <div>
                                <label className="form-label">Color de Fondo</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="color"
                                        className="form-control form-control-color form-control-sm"
                                        value={props.backgroundColor}
                                        onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                                        title="Elegir color"
                                    />
                                    <input 
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={props.backgroundColor}
                                        onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    label: 'Columnas',
                    content: (
                        <div className="d-grid gap-3">
                             <div>
                                <label className="form-label">Plantilla de Columnas (CSS)</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={props.gridTemplateColumns}
                                    onChange={(e) => setProp((p) => (p.gridTemplateColumns = e.target.value))}
                                    placeholder="e.g. 1fr 1fr 1fr 1fr 1fr"
                                />
                                <div className="form-text" style={{fontSize: '0.75rem'}}>
                                    Usa sintaxis CSS Grid. Ej: <code>1fr 1fr 1fr 1fr 1fr</code> para 5 columnas iguales, o <code>repeat(5, 200px)</code>.
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
        />
    );
};

Grid5.craft = {
  displayName: 'Grid 5 (3+2)',
  isCanvas: true,
  props: {
    gap: 20,
    padding: 20,
    backgroundColor: 'transparent',
    gridTemplateColumns: 'repeat(6, 1fr)',
    translateX: 0,
    translateY: 0,
  },
  related: {
    settings: Grid5Settings
  }
};
