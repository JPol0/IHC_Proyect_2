// components/user/CategoryGrid.jsx
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useUploadImage } from '../../hooks/useUploadImage';

export const CategoryGrid = ({
  title = 'Conoce sobre',
  titleColor = '#ffffff',
  titleFontSize = 48,
  accentColor = '#ff6b35',
  backgroundColor = '#1a1a1a',
  padding = 60,
  gap = 16,
  columns = 4,
  // Categories (JSON string for Craft compatibility)
  categories = JSON.stringify([
    { id: 1, name: 'Tribus indigenas', image: '' },
    { id: 2, name: 'Fauna', image: '' },
    { id: 3, name: 'Flora', image: '' },
    { id: 4, name: 'Usos sostenibles', image: '' },
    { id: 5, name: 'Agua', image: '' },
    { id: 6, name: 'Cultura', image: '' },
    { id: 7, name: 'Geografia', image: '' },
  ]),
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

  // Parse categories
  let parsedCategories = [];
  try {
    parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
  } catch (e) {
    parsedCategories = [];
  }

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
      <div style={{ 
        marginBottom: '40px', 
        textAlign: 'center' 
      }}>
        <h2 style={{ 
          color: titleColor, 
          fontSize: `${titleFontSize}px`, 
          fontWeight: 'bold',
          margin: 0,
          display: 'inline-block',
          borderBottom: `3px solid ${accentColor}`,
          paddingBottom: '8px',
        }}>
          {title}
        </h2>
      </div>

      {/* Categories Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        width: '100%'
      }}>
        {parsedCategories.map((category, index) => (
          <div
            key={category.id || index}
            style={{
              position: 'relative',
              aspectRatio: '1',
              minHeight: '200px',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            )}
            {!category.image && (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px',
              }}>
                Sin imagen
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
              padding: '20px',
              color: '#ffffff',
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 'bold',
                margin: 0,
                borderBottom: `2px solid ${accentColor}`,
                paddingBottom: '4px',
                display: 'inline-block',
              }}>
                {category.name}
              </h3>
            </div>
          </div>
        ))}
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

const CategoryGridSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const { upload, isUploading } = useUploadImage("Assets");

  // Parse current categories
  let currentCategories = [];
  try {
    currentCategories = typeof props.categories === 'string' ? JSON.parse(props.categories) : (props.categories || []);
  } catch (e) {
    currentCategories = [];
  }

  const updateCategories = (newCategories) => {
    setProp((p) => (p.categories = JSON.stringify(newCategories)));
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...currentCategories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    updateCategories(newCategories);
  };

  const addCategory = () => {
    const newCategories = [...currentCategories, {
      id: Date.now(),
      name: 'Nueva categoría',
      image: ''
    }];
    updateCategories(newCategories);
  };

  const removeCategory = (index) => {
    const newCategories = currentCategories.filter((_, i) => i !== index);
    updateCategories(newCategories);
  };

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Título",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.title ?? 'Conoce sobre'}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
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
            </div>
          )
        },
        {
          label: "Categorías",
          content: (
            <div className="d-grid gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Categorías</label>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={addCategory}
                >
                  <i className="bi bi-plus"></i> Agregar
                </button>
              </div>
              <div className="border rounded p-2 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentCategories.map((category, index) => (
                  <div key={category.id || index} className="card p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small text-muted">#{index + 1}</span>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeCategory(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <div className="mb-2">
                      <input
                        className="form-control form-control-sm"
                        placeholder="Nombre de categoría"
                        value={category.name || ''}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        className="form-control form-control-sm"
                        placeholder="URL de imagen"
                        value={category.image || ''}
                        onChange={(e) => updateCategory(index, 'image', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="form-control form-control-sm"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await upload(file);
                          if (url) {
                            updateCategory(index, 'image', url);
                            e.target.value = null;
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && <div className="text-info small mt-1">Subiendo...</div>}
                    </div>
                  </div>
                ))}
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
                <label className="form-label">Columnas</label>
                <input
                  type="range"
                  className="form-range"
                  min={2}
                  max={6}
                  step={1}
                  value={props.columns ?? 4}
                  onChange={(e) => setProp((p) => (p.columns = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.columns ?? 4} columnas</div>
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
              <div>
                <label className="form-label">Espaciado entre cards (px)</label>
                <input
                  type="range"
                  className="form-range"
                  min={8}
                  max={48}
                  step={4}
                  value={props.gap ?? 16}
                  onChange={(e) => setProp((p) => (p.gap = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.gap ?? 16}px</div>
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

CategoryGrid.craft = {
  displayName: 'Grid de Categorías',
  props: {
    title: 'Conoce sobre',
    titleColor: '#ffffff',
    titleFontSize: 48,
    accentColor: '#ff6b35',
    backgroundColor: '#1a1a1a',
    padding: 60,
    gap: 16,
    columns: 4,
    categories: JSON.stringify([
      { id: 1, name: 'Tribus indigenas', image: '' },
      { id: 2, name: 'Fauna', image: '' },
      { id: 3, name: 'Flora', image: '' },
      { id: 4, name: 'Usos sostenibles', image: '' },
      { id: 5, name: 'Agua', image: '' },
      { id: 6, name: 'Cultura', image: '' },
      { id: 7, name: 'Geografia', image: '' },
    ]),
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: CategoryGridSettings
  }
};
