// components/user/FeatureGrid.jsx
import React from 'react';
import { useNode, Element } from '@craftjs/core';
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
  gap = 30,
  padding = 40,
  backgroundColor = 'transparent',
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

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
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        padding: `${padding}px`,
        backgroundColor: backgroundColor,
        width: '100%',
        outline: selected ? '2px dashed #3b82f6' : undefined,
      }}
    >
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
          height={index === 0 ? 400 : 300}
          imageHeight={200}
          
          backgroundColor="#ffffff"
          titleColor={index === 0 ? '#ffffff' : "#000000"} 
          buttonColor={index === 0 ? '#ffffff' : "#000000"} 
        />
      ))}
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
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
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
    gap: 30,
    padding: 40,
    backgroundColor: 'transparent',
  },
  related: {
    settings: FeatureGridSettings
  }
};
