// components/user/NewsSection.jsx
import React, { useMemo } from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Text } from './Text';
import { Image } from './Image';
import { Container } from './Container';

export const NewsSection = ({
  title = 'Noticias Recientes',
  titleColor = '#ffffff',
  titleFontSize = 48,
  accentColor = '#ff6b35',
  backgroundColor = '#1a1a1a',
  padding = 60,
  gap = 24,
  // News items (JSON string for Craft compatibility)
  newsItems = '[]',
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

  const defaultNewsItems = useMemo(() => JSON.stringify([
    {
      id: 1,
      image: '',
      category: 'Ambiente',
      title: 'Por qué la Amazonia no produce realmente el 20% del oxigeno del mundo',
      size: 'large'
    },
    {
      id: 2,
      image: '',
      category: 'Oceano',
      title: 'Descubre las maravillas del oceano',
      size: 'small'
    },
    {
      id: 3,
      image: '',
      category: 'Animales',
      title: '¿Se están domesticando los zorros?',
      size: 'small'
    }
  ]), []);

  const newsItemsToUse = newsItems && newsItems !== '[]' ? newsItems : defaultNewsItems;

  // Parse news items
  const parsedItems = useMemo(() => {
    try {
      return typeof newsItemsToUse === 'string' ? JSON.parse(newsItemsToUse) : newsItemsToUse;
    } catch (e) {
      return [];
    }
  }, [newsItemsToUse]);

  const largeItem = parsedItems.find(item => item.size === 'large') || parsedItems[0];
  const smallItems = parsedItems.filter(item => item.size === 'small' || item.id !== largeItem?.id).slice(0, 2);

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

      {/* News Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr',
        gap: `${gap}px`,
        width: '100%'
      }}>
        {/* Large Card */}
        {largeItem && (
          <div style={{
            position: 'relative',
            minHeight: '400px',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            {largeItem.image && (
              <img 
                src={largeItem.image} 
                alt={largeItem.title}
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
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              padding: '32px',
              color: '#ffffff',
            }}>
              <span style={{
                color: accentColor,
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                {largeItem.category}
              </span>
              <h3 style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 'bold',
                marginTop: '8px',
                marginBottom: 0,
              }}>
                {largeItem.title}
              </h3>
            </div>
          </div>
        )}

        {/* Small Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
          {smallItems.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                position: 'relative',
                minHeight: '190px',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
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
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                padding: '20px',
                color: '#ffffff',
              }}>
                <span style={{
                  color: accentColor,
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {item.category}
                </span>
                <h4 style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '6px',
                  marginBottom: 0,
                }}>
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
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

const NewsSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  // Parse current items
  let currentItems = [];
  try {
    currentItems = typeof props.newsItems === 'string' ? JSON.parse(props.newsItems) : (props.newsItems || []);
  } catch (e) {
    currentItems = [];
  }

  const updateItems = (newItems) => {
    setProp((p) => (p.newsItems = JSON.stringify(newItems)));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateItems(newItems);
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
                  value={props.title ?? 'Noticias Recientes'}
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
          label: "Noticias",
          content: (
            <div className="d-grid gap-3">
              <label className="form-label mb-0">Elementos de noticias</label>
              <div className="border rounded p-2 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentItems.map((item, index) => (
                  <div key={item.id || index} className="card p-2 mb-2">
                    <div className="mb-2">
                      <input
                        className="form-control form-control-sm"
                        placeholder="URL de imagen"
                        value={item.image || ''}
                        onChange={(e) => updateItem(index, 'image', e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        className="form-control form-control-sm"
                        placeholder="Categoría"
                        value={item.category || ''}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <textarea
                        className="form-control form-control-sm"
                        placeholder="Título"
                        rows={2}
                        value={item.title || ''}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <select
                        className="form-select form-select-sm"
                        value={item.size || 'small'}
                        onChange={(e) => updateItem(index, 'size', e.target.value)}
                      >
                        <option value="small">Pequeña</option>
                        <option value="large">Grande</option>
                      </select>
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
                  value={props.gap ?? 24}
                  onChange={(e) => setProp((p) => (p.gap = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.gap ?? 24}px</div>
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

NewsSection.craft = {
  displayName: 'Sección de Noticias',
  props: {
    title: 'Noticias Recientes',
    titleColor: '#ffffff',
    titleFontSize: 48,
    accentColor: '#ff6b35',
    backgroundColor: '#1a1a1a',
    padding: 60,
    gap: 24,
    newsItems: JSON.stringify([
      {
        id: 1,
        image: '',
        category: 'Ambiente',
        title: 'Por qué la Amazonia no produce realmente el 20% del oxigeno del mundo',
        size: 'large'
      },
      {
        id: 2,
        image: '',
        category: 'Oceano',
        title: 'Descubre las maravillas del oceano',
        size: 'small'
      },
      {
        id: 3,
        image: '',
        category: 'Animales',
        title: '¿Se están domesticando los zorros?',
        size: 'small'
      }
    ]),
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: NewsSectionSettings
  }
};
