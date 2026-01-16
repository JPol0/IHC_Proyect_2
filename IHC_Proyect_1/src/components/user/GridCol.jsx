// components/user/GridCol.jsx
import React from 'react';
import { useNode } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';

export const GridCol = ({
  gap = 20,
  padding = 20,
  backgroundColor = 'transparent',
  gridTemplateColumns = '1fr', // Una sola columna por defecto para lista vertical
  children
}) => {
  const {
    connectors: { connect, drag },
    selected
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const containerStyles = {
    display: 'grid',
    justifyContent: 'center',
    gridTemplateColumns: gridTemplateColumns,
    gap: `${gap}px`,
    padding: `${padding}px`,
    backgroundColor: backgroundColor,
    width: '100%',
    maxWidth: '800px', // Ancho máximo razonable para una lista de artículos
    margin: '0 auto',
    outline: selected ? '2px dashed #3b82f6' : undefined,
    outlineOffset: '-2px',
    position: 'relative',
    minHeight: '100px'
  };

  return (
    <div 
      ref={ref => connect(drag(ref))}
      style={containerStyles}
    >
       {children}
    </div>
  );
};

export const GridColSettings = () => {
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
                         
                            <div>
                                <label className="form-label">Ancho Máximo (CSS)</label>
                                <input
                                   type="text" 
                                   className="form-control form-control-sm"
                                   defaultValue="800px"
                                   disabled
                                   title="Fijo por diseño en código (se puede exponer si es necesario)"
                                />
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
                                    placeholder="e.g. 1fr"
                                />
                                <div className="form-text" style={{fontSize: '0.75rem'}}>
                                    Usa sintaxis CSS Grid. Ej: <code>1fr</code> para una lista vertical.
                                </div>
                            </div>
                        </div>
                    )
                }
            ]}
        />
    );
};

GridCol.craft = {
  displayName: 'Grid Lista (Col)',
  props: {
    gap: 20,
    padding: 20,
    backgroundColor: 'transparent',
    gridTemplateColumns: '1fr',
  },
  related: {
    settings: GridColSettings
  }
};
