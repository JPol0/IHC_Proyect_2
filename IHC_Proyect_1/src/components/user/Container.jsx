// components/user/Container.jsx
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { SettingsTabs } from "../ui/SettingsTabs";
import { useUploadImage } from '../../hooks/useUploadImage';

export const Container = ({ 
  background, 
  backgroundImage = "",
  backgroundSize = "cover",
  padding = 0, 
  borderRadius = 0, 
  boxShadow = "", 
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  margin = 5,
  opacity = 1,
  // Layout props
  layout = 'flex', // 'flex' | 'grid'
  direction = 'column', // flex only
  justify = 'flex-start', // flex only
  align = 'flex-start', // flex or cross-axis
  wrap = 'nowrap', // flex only
  gap = 8,
  gridColumns = 2, // grid only
  gridJustifyItems = 'stretch', // grid only
  gridAlignItems = 'stretch', // grid only
  // Background options
  transparentBackground = false,
  // NUEVO: props de tamaño (opcionales)
  width,
  height,
  minWidth = 100,
  minHeight = 60,
  children 
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
  const textAlign = align === 'center' ? 'center' : (align === 'flex-end' ? 'right' : 'left');

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

  const baseStyle = {
    margin: typeof margin === 'number' ? `${margin}px` : (margin || 0),
    backgroundColor: transparentBackground ? 'transparent' : `${background}`,
    backgroundImage: (transparentBackground || !backgroundImage) ? 'none' : `url(${backgroundImage})`,
    backgroundSize: backgroundSize || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: `${Math.max(5, padding)}px`,
    borderRadius: `${borderRadius}px`,
    boxShadow: boxShadow ? `0 4px 8px ${boxShadow}` : "none",
    // NUEVO: tamaño (si no se especifica, conserva 100%/auto)
    width: typeof width === 'number' ? `${width}px` : (width || '100%'),
    height: typeof height === 'number' ? `${height}px` : (height || 'auto'),
    minWidth: Number(minWidth) || 0,
    minHeight: Number(minHeight) || 0,
    boxSizing: 'border-box',
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 0)),
    position: 'relative',
    zIndex: Number(zIndex) || 0,
    // Opcional: contorno al seleccionar (no afecta layout)
    outline: selected ? '1px dashed #3b82f6' : undefined,
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
      ref={ref => id === 'ROOT' ? connect(ref) : connect(drag(ref))}
      style={{
        ...baseStyle,
        ...layoutStyle,
        // Forzar tamaño si es ROOT para coincidir con el editor
        width: id === 'ROOT' ? '1280px' : baseStyle.width,
        minHeight: id === 'ROOT' ? '720px' : baseStyle.minHeight,
      }}
    >
      {children}
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

// Nota: craft config unificada al final del archivo
export const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));
  
  const { upload, isUploading } = useUploadImage("Assets");

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Fondo</label>
                <div className="d-flex gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={props.background || '#ffffff'}
                      onChange={(e) => setProp((props) => (props.background = e.target.value))}
                      disabled={!!props.transparentBackground}
                    />
                     <input
                      type="text"
                      className="form-control form-control-sm"
                      value={props.background || ''}
                      onChange={(e) => setProp((props) => (props.background = e.target.value))}
                      placeholder="#hex"
                      disabled={!!props.transparentBackground}
                    />
                </div>
              </div>
              
              <div>
                <label className="form-label">Imagen de Fondo (URL)</label>
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
                        e.target.value = null;
                    }
                  }}
                  disabled={isUploading || !!props.transparentBackground}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>

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

              <div className="form-check">
                <input
                  id="container-bg-transparent"
                  type="checkbox"
                  className="form-check-input"
                  checked={!!props.transparentBackground}
                  onChange={(e) => setProp((p) => (p.transparentBackground = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="container-bg-transparent">
                  Fondo transparente
                </label>
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
                <label className="form-label">Bordes redondeados</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={100}
                  step={1}
                  value={typeof props.borderRadius === 'number' ? props.borderRadius : 0}
                  onChange={(e) => setProp((props) => (props.borderRadius = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.borderRadius ?? 0}px</div>
              </div>
              <div>
                <label className="form-label">Sombra</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.boxShadow || '#000000'}
                  onChange={(e) => setProp((props) => (props.boxShadow = e.target.value))}
                  style={{ width: 40, height: 40, padding: 0, border: 'none', background: 'transparent' }}
                />
              </div>
            </div>
          )
        },
        {
          label: "Disposición",
          content: (
            <div className="d-grid gap-3">
               <div>
                <label className="form-label">Dimensiones</label>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">Ancho</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="100% / 320"
                        value={props.width ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProp((p) => (p.width = v === '' ? null : (isNaN(Number(v)) ? v : Number(v))));
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">Alto</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="auto / 240"
                        value={props.height ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setProp((p) => (p.height = v === '' ? null : (isNaN(Number(v)) ? v : Number(v))));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

               <div>
                <label className="form-label">Tipo de distribución</label>
                <select
                  className="form-select form-select-sm"
                  value={props.layout || 'flex'}
                  onChange={(e) => setProp((p) => (p.layout = e.target.value))}
                >
                  <option value="flex">Flexible (Flexbox)</option>
                  <option value="grid">Cuadrícula (Grid)</option>
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
                      <option value="row">Fila (horizontal)</option>
                      <option value="column">Columna (vertical)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Alineación vertical</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.align || 'flex-start'}
                      onChange={(e) => setProp((p) => (p.align = e.target.value))}
                    >
                      <option value="flex-start">Inicio</option>
                      <option value="center">Centro</option>
                      <option value="flex-end">Final</option>
                      <option value="stretch">Estirar</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Alineación horizontal</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.justify || 'flex-start'}
                      onChange={(e) => setProp((p) => (p.justify = e.target.value))}
                    >
                      <option value="flex-start">Inicio</option>
                      <option value="center">Centro</option>
                      <option value="flex-end">Final</option>
                      <option value="space-between">Espacio entre (Between)</option>
                      <option value="space-around">Espacio alrededor (Around)</option>
                      <option value="space-evenly">Espacio uniforme (Evenly)</option>
                    </select>
                  </div>
                   <div>
                    <label className="form-label">Ajuste de línea (Wrap)</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.wrap || 'nowrap'}
                      onChange={(e) => setProp((p) => (p.wrap = e.target.value))}
                    >
                      <option value="nowrap">No ajustar</option>
                      <option value="wrap">Ajustar</option>
                      <option value="wrap-reverse">Ajustar invertido</option>
                    </select>
                  </div>
                </>
              )}

              {(props.layout || 'flex') === 'grid' && (
                <>
                  <div>
                    <label className="form-label">Columnas</label>
                    <input
                      type="range"
                      className="form-range"
                      min={1}
                      max={6}
                      step={1}
                      value={typeof props.gridColumns === 'number' ? props.gridColumns : 2}
                      onChange={(e) => setProp((p) => (p.gridColumns = Number(e.target.value)))}
                    />
                    <div className="small text-muted">{props.gridColumns ?? 2} columnas</div>
                  </div>
                   <div>
                    <label className="form-label">Alineación horizontal</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.gridJustifyItems || 'stretch'}
                      onChange={(e) => setProp((p) => (p.gridJustifyItems = e.target.value))}
                    >
                      <option value="start">Inicio</option>
                      <option value="center">Centro</option>
                      <option value="end">Final</option>
                      <option value="stretch">Estirar</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Alineación vertical (celdas)</label>
                    <select
                      className="form-select form-select-sm"
                      value={props.gridAlignItems || 'stretch'}
                      onChange={(e) => setProp((p) => (p.gridAlignItems = e.target.value))}
                    >
                      <option value="start">Inicio</option>
                      <option value="center">Centro</option>
                      <option value="end">Final</option>
                      <option value="stretch">Estirar</option>
                    </select>
                  </div>
                </>
              )}
               <div>
                <label className="form-label">Espaciado entre elementos (Gap)</label>
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
                <label className="form-label">Espaciado interno (Padding)</label>
                <input
                  type="range"
                  className="form-range"
                  min={5}
                  max={100}
                  step={1}
                  value={typeof props.padding === 'number' ? Math.max(5, props.padding) : 5}
                  onChange={(e) => setProp((props) => (props.padding = Number(e.target.value)))}
                />
                <div className="small text-muted">{Math.max(5, props.padding ?? 5)}px</div>
              </div>
                <div>
                <label className="form-label">Espaciado externo (Margin)</label>
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
            </div>
          )
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Nivel de profundidad (Z-index)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover X (px)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y (px)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
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

export const ContainerDefaultProps = {
  background: "#adb5bd",
  backgroundImage: "",
  backgroundSize: "cover",
  padding: 5,
  borderRadius: 0,
  boxShadow: "",
  translateX: 0,
  translateY: 0,
  zIndex: 0,
  margin: 5,
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
  // NUEVO: defaults de tamaño
  width: null,
  height: null,
  minWidth: 100,
  minHeight: 60,
};

Container.craft = {
  displayName: 'Contenedor',
  props: ContainerDefaultProps,
  related: {
    settings: ContainerSettings
  }
}