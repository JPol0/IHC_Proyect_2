// filepath: c:\Users\Helowdas\Documents\GitHub\IHC-Proyect-1-\IHC-Proyect-1\src\components\user\BackgroundImageContainer.jsx
import { useEditor, useNode } from '@craftjs/core';
import { useUploadImage } from '../../hooks/useUploadImage';
import { SettingsTabs } from '../ui/SettingsTabs';
import React from 'react';

export const BackgroundImageContainer = ({
  backgroundImage = 'https://placehold.co/1200x500',
  backgroundSize = 'cover',
  canvasScale = 1,
  targetWidth,
  targetHeight,
  padding = 40,
  minHeight = 200,
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  margin = 0,
  opacity = 1,
  // Layout props (mismas que Container)
  layout = 'flex',
  direction = 'column',
  justify = 'flex-start',
  align = 'flex-start',
  wrap = 'nowrap',
  gap = 8,
  gridColumns = 2,
  gridJustifyItems = 'stretch',
  gridAlignItems = 'stretch',
  // Fondo transparente
  transparentBackground = false,
  backgroundColor,
  children,
}) => {
  const { id, connectors: { connect, drag }, actions: { setProp }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { enabled, actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor((state) => ({ enabled: state.options.enabled }));

  const handleMouseDown = (e) => {
    // No interferir con el ROOT - dejar que Craft.js maneje los clics en el canvas
    if (id === 'ROOT') {
      return;
    }
    
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

  const textAlign = align === 'center' ? 'center' : (align === 'flex-end' ? 'right' : 'left');

  // Eliminado: manejo de movimiento por arrastre del mouse

  // Altura efectiva: permitir crecer si el contenido excede la altura objetivo
  // Nota: algunos estados antiguos no incluyen `targetHeight` en el nodo
  // deserializado. En ese caso, asumimos 720px (tamaño del lienzo por defecto)
  // para evitar que el contenedor renderice “a la mitad” del alto esperado.
  const effectiveMinHeight = (() => {
    const DEFAULT_TARGET_H = 720; // fallback seguro cuando no viene en props
    const t = Number(targetHeight);
    const baseTarget = Number.isFinite(t) && t > 0 ? t : DEFAULT_TARGET_H;
    const m = Number(minHeight) || 0;
    return Math.max(baseTarget, m);
  })();

  const baseStyle = {
    width: targetWidth ? `${targetWidth}px` : '100%',
    // No fijamos height para que el contenido pueda expandirse verticalmente.
    // Usamos minHeight para garantizar un alto base y permitir scroll en el viewport.
    minHeight: `${effectiveMinHeight}px`,
    position: 'relative',
    padding: `${Math.max(5, padding)}px`,
  // Nota: `minHeight` ya aplicado arriba como `effectiveMinHeight`.
    backgroundColor: backgroundColor || 'transparent',
    backgroundImage: (transparentBackground || !backgroundImage) ? 'none' : `url(${backgroundImage})`,
    backgroundSize: backgroundSize || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
  // Mantener posiciones internas estables: no escalar aquí; el escalado visual lo maneja el viewport.
  transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    transformOrigin: 'top left',
    margin: typeof margin === 'number' ? `${margin}px` : (margin || 0),
    opacity: Math.max(0, Math.min(1, Number(opacity) || 0)),
    zIndex: Number(zIndex) || 0,
  };

  const layoutStyle = (layout === 'grid')
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns || 1}, minmax(0, 1fr))`,
        justifyItems: gridJustifyItems,
        alignItems: gridAlignItems,
      }
    : {
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        textAlign,
      };

  return (
    <div
      ref={(ref) => {
        if (!ref) return;
        if (id === 'ROOT') connect(ref);
        else connect(drag(ref));
      }}
      style={{
        ...baseStyle,
        ...layoutStyle,
        width: id === 'ROOT' ? '1280px' : baseStyle.width,
        minHeight: id === 'ROOT' ? '720px' : baseStyle.minHeight,
      }}
    >
      {selected && id !== 'ROOT' && (
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
                ref={(ref) => ref && drag(ref)}
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
      {enabled && id !== 'ROOT' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Borde superior */}
          <div
            ref={(ref) => ref && drag(ref)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, cursor: 'move', pointerEvents: 'auto' }}
            aria-label="Mover contenedor (borde superior)"
          />
          {/* Borde inferior */}
          <div
            ref={(ref) => ref && drag(ref)}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, cursor: 'move', pointerEvents: 'auto' }}
            aria-label="Mover contenedor (borde inferior)"
          />
          {/* Borde izquierdo */}
          <div
            ref={(ref) => ref && drag(ref)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 10, cursor: 'move', pointerEvents: 'auto' }}
            aria-label="Mover contenedor (borde izquierdo)"
          />
          {/* Borde derecho */}
          <div
            ref={(ref) => ref && drag(ref)}
            style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 10, cursor: 'move', pointerEvents: 'auto' }}
            aria-label="Mover contenedor (borde derecho)"
          />
        </div>
      )}

      {children}

      {selected && null}
    </div>
  );
};

export function BackgroundImageContainerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const { upload, isUploading } = useUploadImage("Assets");

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Contenido",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color de Fondo</label>
                <div className="d-flex gap-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.backgroundColor || '#ffffff'}
                    onChange={(e) => setProp((props) => (props.backgroundColor = e.target.value))}
                    title="Elige un color"
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={props.backgroundColor || ''}
                    onChange={(e) => setProp((props) => (props.backgroundColor = e.target.value))}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">URL imagen fondo</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.backgroundImage ?? ''}
                  onChange={(e) => setProp((props) => (props.backgroundImage = e.target.value))}
                  placeholder="https://..."
                  disabled={!!props.transparentBackground}
                />
              </div>

              <div>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept='image/*'
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                        setProp((p) => (p.backgroundImage = url));
                        // Limpiar input para permitir re-subir
                        e.target.value = null;
                    }
                  }}
                  disabled={isUploading || !!props.transparentBackground}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>

              <div className="form-check">
                <input
                  id="bgimg-transparent"
                  type="checkbox"
                  className="form-check-input"
                  checked={!!props.transparentBackground}
                  onChange={(e) => setProp((p) => (p.transparentBackground = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="bgimg-transparent">
                  Fondo transparente
                </label>
              </div>
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Tamaño imagen</label>
                <select
                  className="form-select form-select-sm"
                  value={props.backgroundSize || 'cover'}
                  onChange={(e) => setProp((p) => (p.backgroundSize = e.target.value))}
                >
                  <option value="cover">Cubrir (cover)</option>
                  <option value="contain">Ajustar (contain)</option>
                  <option value="auto">Auto</option>
                  <option value="100% 100%">Estirar</option>
                </select>
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

              <div>
                <label className="form-label">Margin (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={64}
                  step={1}
                  value={typeof props.margin === 'number' ? props.margin : 0}
                  onChange={(e) => setProp((p) => (p.margin = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Padding (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={5}
                  max={100}
                  step={1}
                  value={props.padding != null ? Math.max(5, props.padding) : 40}
                  onChange={(e) => setProp((props) => (props.padding = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Altura (min px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={50}
                  max={500}
                  step={10}
                  value={props.minHeight ?? 200}
                  onChange={(e) => setProp((props) => (props.minHeight = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Distribución</label>
                <select
                  className="form-select form-select-sm"
                  value={props.layout || 'flex'}
                  onChange={(e) => setProp((p) => (p.layout = e.target.value))}
                >
                  <option value="flex">Flex</option>
                  <option value="grid">Grid</option>
                </select>
              </div>

              {(props.layout || 'flex') === 'flex' && (
                <>
                  <div>
                    <label className="form-label">Dirección</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.direction || 'column'}
                      onChange={(e) => setProp((p) => (p.direction = e.target.value))}
                    >
                      <option value="column">Columna</option>
                      <option value="row">Fila</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Alineación</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.align || 'flex-start'}
                      onChange={(e) => setProp((p) => (p.align = e.target.value))}
                    >
                      <option value="flex-start">Inicio</option>
                      <option value="center">Centro</option>
                      <option value="flex-end">Final</option>
                    </select>
                  </div>
                </>
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
                <label className="form-label">Z-index</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        }
      ]}
    />
  );
}


BackgroundImageContainer.craft = {
  displayName: 'Lienzo',
  props: {
    backgroundImage: '',
    backgroundSize: 'cover',
    padding: 40,
    minHeight: 200,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    margin: 0,
    opacity: 1,
    layout: 'flex',
    direction: 'column',
    justify: 'flex-start',
    align: 'flex-start',
    wrap: 'nowrap',
    gap: 8,
    gridColumns: 2,
    gridJustifyItems: 'stretch',
    gridAlignItems: 'stretch',
    transparentBackground: false,
  },
  related: {
    settings: BackgroundImageContainerSettings,
  },
};