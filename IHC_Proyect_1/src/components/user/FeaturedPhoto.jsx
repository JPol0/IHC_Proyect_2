// components/user/FeaturedPhoto.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useUploadImage } from '../../hooks/useUploadImage';

export const FeaturedPhoto = ({
  title = 'Fotografía Destacada',
  titleColor = '#ffffff',
  titleFontSize = 48,
  accentColor = '#ff6b35',
  backgroundColor = '#1a1a1a',
  image = '',
  caption = 'La Densidad Infinita: 24 horas en el Parque Nacional Manú',
  captionColor = '#ffffff',
  captionFontSize = 18,
  padding = 60,
  imageHeight = 500,
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
    backgroundColor,
    padding: `${padding}px`,
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    zIndex: Number(zIndex) || 0,
    position: 'relative',
    outline: selected ? '2px dashed #3b82f6' : undefined,
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={containerStyle}
    >
      {/* Title */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '6px', height: '48px', backgroundColor: accentColor }} />
        <h2 style={{ 
          color: titleColor, 
          fontSize: `${titleFontSize}px`, 
          fontWeight: 'bold',
          margin: 0 
        }}>
          {title}
        </h2>
      </div>

      {/* Featured Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${imageHeight}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        {image ? (
          <img 
            src={image} 
            alt={caption}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '16px',
          }}>
            Sin imagen
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p style={{
          color: captionColor,
          fontSize: `${captionFontSize}px`,
          margin: 0,
          textAlign: 'center',
        }}>
          {caption}
        </p>
      )}

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

const FeaturedPhotoSettings = () => {
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
                <label className="form-label">Título</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.title ?? 'Fotografía Destacada'}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">URL de imagen</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.image ?? ''}
                  onChange={(e) => setProp((p) => (p.image = e.target.value))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="form-label">Subir imagen</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.image = url));
                      e.target.value = null;
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>
              <div>
                <label className="form-label">Descripción/Caption</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={props.caption ?? ''}
                  onChange={(e) => setProp((p) => (p.caption = e.target.value))}
                  placeholder="Descripción de la fotografía..."
                />
              </div>
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color de fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor ?? '#1a1a1a'}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color del título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.titleColor ?? '#ffffff'}
                  onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del título (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={24}
                  max={72}
                  step={2}
                  value={props.titleFontSize ?? 48}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.titleFontSize ?? 48}px</div>
              </div>
              <div>
                <label className="form-label">Color de acento</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.accentColor ?? '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.accentColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Altura de imagen (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={200}
                  max={800}
                  step={20}
                  value={props.imageHeight ?? 500}
                  onChange={(e) => setProp((p) => (p.imageHeight = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.imageHeight ?? 500}px</div>
              </div>
              <div>
                <label className="form-label">Color de caption</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.captionColor ?? '#ffffff'}
                  onChange={(e) => setProp((p) => (p.captionColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño de caption (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={12}
                  max={32}
                  step={1}
                  value={props.captionFontSize ?? 18}
                  onChange={(e) => setProp((p) => (p.captionFontSize = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.captionFontSize ?? 18}px</div>
              </div>
              <div>
                <label className="form-label">Padding (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={20}
                  max={120}
                  step={5}
                  value={props.padding ?? 60}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.padding ?? 60}px</div>
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

FeaturedPhoto.craft = {
  displayName: 'Fotografía Destacada',
  props: {
    title: 'Fotografía Destacada',
    titleColor: '#ffffff',
    titleFontSize: 48,
    accentColor: '#ff6b35',
    backgroundColor: '#1a1a1a',
    image: '',
    caption: 'La Densidad Infinita: 24 horas en el Parque Nacional Manú',
    captionColor: '#ffffff',
    captionFontSize: 18,
    padding: 60,
    imageHeight: 500,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: FeaturedPhotoSettings
  }
};
