// components/user/FeatureGrid.jsx
import React from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { FeatureCard } from './FeatureCard';

export const FeatureGrid = ({
  cards = JSON.stringify([
    {
      id: 1,
      image: 'https://placehold.co/800x600',
      title: 'Carta Principal Destacada',
      link: '#',
      buttonText: 'LEER'
    },
    {
      id: 2,
      image: 'https://placehold.co/400x300',
      title: 'Carta Secundaria 1',
      link: '#',
      buttonText: 'LEER'
    },
    {
      id: 3,
      image: 'https://placehold.co/400x300',
      title: 'Carta Secundaria 2',
      link: '#',
      buttonText: 'LEER'
    },
    {
      id: 4,
      image: 'https://placehold.co/400x300',
      title: 'Carta Secundaria 3',
      link: '#',
      buttonText: 'LEER'
    },
    {
      id: 5,
      image: 'https://placehold.co/400x300',
      title: 'Carta Secundaria 4',
      link: '#',
      buttonText: 'LEER'
    }
  ]),
  columns = 3,
  gap = 15,
  padding = 20,
  maxWidth = '1000px',
  backgroundColor = 'transparent',
  opacity = 1,
  translateX = 0,
  translateY = 0,
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
    id
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node }, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

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

  // Parse cards
  let parsedCards = [];
  try {
    parsedCards = JSON.parse(cards);
  } catch (e) {
    console.warn("FeatureGrid: Error parsing cards JSON", e);
  }

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        padding: `${padding}px`,
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        outline: selected ? '2px dashed #3b82f6' : undefined,
      }}
    >
      {/* Fondo con opacidad */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundColor,
          opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {parsedCards.map((card, index) => (
        <Element
          key={card.id || index}
          is={FeatureCard}
          id={`grid-card-${card.id || index}`}
          imageUrl={card.image || ''}
          title={card.title || ''}
          linkUrl={card.link || '#'}
          buttonText={card.buttonText || 'LEER'}
          
          // Layout Logic: First card is large overlay
          variant={index === 0 ? 'overlay' : 'default'}
          columnSpan={index === 0 ? 2 : 1}
          // Adjust height for featured card
          height={index === 0 ? 280 : 200}
          imageHeight={140}
          
          titleColor={index === 0 ? '#ffffff' : "#000000"} 
          buttonColor={index === 0 ? '#ffffff' : "#000000"}
          style={{ position: 'relative', zIndex: 1 }}
        />
      ))}
      
      {/* Floating Action Buttons (Only when selected and in edit mode) */}
      {selected && enabled && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'transparent',
            padding: '8px',
            borderRadius: '6px',
            zIndex: 1000,
            color: '#000000'
          }}
        >
          <i
            className="bi bi-arrows-move"
            title="Mover"
            style={{ cursor: 'move', fontSize: '1.25rem' }}
            onMouseDown={handleMouseDown}
          />
          <i
            className="bi bi-files"
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
                translateX: (Number(props.translateX) || 0) + 20,
                translateY: (Number(props.translateY) || 0) + 20,
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

const FeatureGridSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Configuración',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Columnas</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.columns}
                  onChange={(e) => setProp((p) => (p.columns = Number(e.target.value)))}
                  min={1}
                  max={6}
                />
              </div>
              <div>
                <label className="form-label">Espaciado (Gap)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.gap}
                  onChange={(e) => setProp((p) => (p.gap = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.padding}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Ancho Máximo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.maxWidth}
                  onChange={(e) => setProp((p) => (p.maxWidth = e.target.value))}
                  placeholder="ej: 1000px, 100%, 80vw"
                />
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
                <label className="form-label">Opacidad</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={props.opacity || 1}
                  onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                />
                <small className="text-muted">{((props.opacity || 1) * 100).toFixed(0)}%</small>
              </div>
            </div>
          )
        },
        {
          label: 'Datos (JSON)',
          content: (
            <div>
              <label className="form-label">Cartas (JSON)</label>
              <textarea
                className="form-control form-control-sm"
                rows={10}
                value={props.cards}
                onChange={(e) => setProp((p) => (p.cards = e.target.value))}
                style={{ fontFamily: 'monospace', fontSize: '11px' }}
              />
              <div className="form-text small">
                Edita el JSON para agregar o quitar cartas. La primera carta siempre será la destacada.
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

FeatureGrid.craft = {
  displayName: 'Grid Destacado',
  props: {
    cards: JSON.stringify([
        { id: 1, image: 'https://placehold.co/800x600', title: 'Carta Principal Destacada', link: '#' },
        { id: 2, image: 'https://placehold.co/400x300', title: 'Carta Secundaria 1', link: '#' },
        { id: 3, image: 'https://placehold.co/400x300', title: 'Carta Secundaria 2', link: '#' },
        { id: 4, image: 'https://placehold.co/400x300', title: 'Carta Secundaria 3', link: '#' },
        { id: 5, image: 'https://placehold.co/400x300', title: 'Carta Secundaria 4', link: '#' }
    ]),
    columns: 3,
    gap: 15,
    padding: 20,
    maxWidth: '1000px',
    backgroundColor: 'transparent',
    opacity: 1,
    translateX: 0,
    translateY: 0,
  },
  related: {
    settings: FeatureGridSettings
  }
};
