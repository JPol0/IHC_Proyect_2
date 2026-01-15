// components/user/HeroSection.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useUploadImage } from '../../hooks/useUploadImage';

export const HeroSection = ({
  backgroundImage = '',
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  height = 500,
  minHeight = 400,
  padding = 0,
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
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

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: `${height}px`,
    minHeight: `${minHeight}px`,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#1a1a1a',
    padding: `${padding}px`,
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    zIndex: Number(zIndex) || 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    outline: selected ? '2px dashed #3b82f6' : undefined,
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={containerStyle}
    >
      {/* Overlay */}
      {overlayColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor,
            zIndex: 1,
          }}
        />
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
        {children}
      </div>

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

const HeroSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const { upload, isUploading } = useUploadImage("Assets");

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Imagen",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de imagen de fondo</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.backgroundImage ?? ''}
                  onChange={(e) => setProp((p) => (p.backgroundImage = e.target.value))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">Pega aquí el link o URL de la imagen que quieres usar como fondo</small>
              </div>
              <div>
                <label className="form-label">O subir imagen desde tu computadora</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.backgroundImage = url));
                      e.target.value = null;
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
                <small className="text-muted">La imagen se subirá a Supabase y se guardará automáticamente</small>
              </div>
              {props.backgroundImage && (
                <div className="mt-2">
                  <label className="form-label small">Vista previa:</label>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: `url(${props.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }} />
                </div>
              )}
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Altura (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={200}
                  max={800}
                  step={10}
                  value={props.height ?? 500}
                  onChange={(e) => setProp((p) => (p.height = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.height ?? 500}px</div>
              </div>
              <div>
                <label className="form-label">Altura mínima (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={200}
                  max={600}
                  step={10}
                  value={props.minHeight ?? 400}
                  onChange={(e) => setProp((p) => (p.minHeight = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.minHeight ?? 400}px</div>
              </div>
              <div>
                <label className="form-label">Color de overlay</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.overlayColor?.replace(/rgba?\(([^)]+)\)/, (match, values) => {
                    const [r, g, b, a] = values.split(',').map(v => v.trim());
                    if (a) {
                      const hex = [r, g, b].map(x => {
                        const hex = parseInt(x).toString(16);
                        return hex.length === 1 ? '0' + hex : hex;
                      }).join('');
                      return '#' + hex;
                    }
                    return match;
                  }) || '#000000'}
                  onChange={(e) => {
                    const hex = e.target.value;
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    const alpha = props.overlayColor?.includes('rgba') ? 
                      props.overlayColor.match(/[\d.]+$/)?.[0] || '0.3' : '0.3';
                    setProp((p) => (p.overlayColor = `rgba(${r}, ${g}, ${b}, ${alpha})`));
                  }}
                />
                <input
                  type="text"
                  className="form-control form-control-sm mt-2"
                  value={props.overlayColor ?? 'rgba(0, 0, 0, 0.3)'}
                  onChange={(e) => setProp((p) => (p.overlayColor = e.target.value))}
                  placeholder="rgba(0, 0, 0, 0.3)"
                />
              </div>
              <div>
                <label className="form-label">Padding (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={100}
                  step={5}
                  value={props.padding ?? 0}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.padding ?? 0}px</div>
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
};

HeroSection.craft = {
  displayName: 'Hero Section',
  props: {
    backgroundImage: '',
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    height: 500,
    minHeight: 400,
    padding: 0,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: HeroSectionSettings
  }
};
