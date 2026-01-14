// components/user/HomepageSection.jsx
// Sección predefinida completa de Homepage con todos los componentes
import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { HeroSection } from './HeroSection';
import { NewsSection } from './NewsSection';
import { CategoryGrid } from './CategoryGrid';
import { FeaturedPhoto } from './FeaturedPhoto';
import { ForumCTA } from './ForumCTA';
import { Navbar } from './Navbar';

export const HomepageSection = ({
  showNavbar = true,
  showHero = true,
  showNews = true,
  showCategories = true,
  showFeaturedPhoto = true,
  showForumCTA = true,
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
    position: 'relative',
    width: '100%',
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    zIndex: Number(zIndex) || 0,
    outline: selected ? '2px dashed #3b82f6' : undefined,
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={containerStyle}
    >
      {/* Navbar */}
      {showNavbar && (
        <Navbar />
      )}

      {/* Hero Section */}
      {showHero && (
        <HeroSection />
      )}

      {/* News Section */}
      {showNews && (
        <NewsSection />
      )}

      {/* Category Grid */}
      {showCategories && (
        <CategoryGrid />
      )}

      {/* Featured Photo */}
      {showFeaturedPhoto && (
        <FeaturedPhoto />
      )}

      {/* Forum CTA */}
      {showForumCTA && (
        <ForumCTA />
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

const HomepageSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Secciones",
          content: (
            <div className="d-grid gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showNavbar !== false}
                  onChange={(e) => setProp((p) => (p.showNavbar = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Navbar</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showHero !== false}
                  onChange={(e) => setProp((p) => (p.showHero = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Hero Section</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showNews !== false}
                  onChange={(e) => setProp((p) => (p.showNews = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Sección de Noticias</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showCategories !== false}
                  onChange={(e) => setProp((p) => (p.showCategories = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Grid de Categorías</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showFeaturedPhoto !== false}
                  onChange={(e) => setProp((p) => (p.showFeaturedPhoto = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Fotografía Destacada</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showForumCTA !== false}
                  onChange={(e) => setProp((p) => (p.showForumCTA = e.target.checked))}
                />
                <label className="form-check-label">Mostrar CTA Foro</label>
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

HomepageSection.craft = {
  displayName: 'Homepage Completa',
  props: {
    showNavbar: true,
    showHero: true,
    showNews: true,
    showCategories: true,
    showFeaturedPhoto: true,
    showForumCTA: true,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: HomepageSectionSettings
  }
};
