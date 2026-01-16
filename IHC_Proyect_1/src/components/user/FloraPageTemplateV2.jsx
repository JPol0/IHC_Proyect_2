// components/user/FloraPageTemplateV2.jsx
// Plantilla completa de página de Flora - Variante 2: Grid variado con múltiples cards
import React, { useState } from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { BackgroundImageContainer } from './ImageContainer';
import { ChevronButton } from './ChevronButton';
import { LikeButton } from './LikeButton';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { useNavigate } from 'react-router-dom';
import { useUploadImage } from '../../hooks/useUploadImage';

export const FloraPageTemplateV2 = ({
  showNavbar = true,
  showHero = true,
  showCards = true,
  // Navbar props
  navbarLogoText = 'Akaru',
  navbarBackgroundColor = '#1a1a1a',
  navbarItemColor = '#ffffff',
  navbarItemHoverColor = '#ff6b35',
  activeNavItem = 'Flora',
  // Hero props
  heroImageUrl = 'https://placehold.co/1280x500',
  heroTitle = 'Flora',
  heroTitleColor = '#ffffff',
  heroTitleFontSize = 48,
  heroOverlayColor = 'rgba(0, 0, 0, 0.2)',
  heroHeight = 500,
  // Cards props
  cards = JSON.stringify([
    {
      id: 1,
      image: '',
      title: '¿Contribuyó la selva amazónica a la "Pequeña Edad de Hielo" del siglo XVII?',
      link: '#',
    },
    {
      id: 2,
      image: '',
      title: 'Importancia de la deforestación',
      link: '#',
    },
    {
      id: 3,
      image: '',
      title: 'Biodiversidad del Amazonas',
      link: '#',
    },
    {
      id: 4,
      image: '',
      title: 'hongos en el amazonas',
      link: '#',
    },
    {
      id: 5,
      image: '',
      title: '¿Dónde comienza el río del amazonas?',
      link: '#',
    },
   

  ]),
  cardsColumns = 3,
  cardsGap = 30,
  cardsBackgroundColor = '#000000',
  cardsPadding = 80,
  // Sidebar props
  showSidebar = true,
  sidebarBackLink = '/',
  sidebarLikeCount = 1000,
  sidebarCommentLink = '/forum',
  sidebarCommentCount = 0,
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
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node }, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  
  const navigate = useNavigate();

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

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        position: 'relative',
        width: '100%',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        zIndex: Number(zIndex) || 0,
        outline: selected ? '2px dashed #3b82f6' : undefined,
      }}
    >
      <Element id="flora-v2-background" is={BackgroundImageContainer} padding={0} background="#000000" canvas>
        {showNavbar && (
          <Element is={Navbar}
            id="flora-v2-navbar"
            logoText={navbarLogoText}
            backgroundColor={navbarBackgroundColor}
            itemColor={navbarItemColor}
            itemHoverColor={navbarItemHoverColor}
            navItems={JSON.stringify([
              { label: "Foro", actionType: "section", sectionName: "foro", active: false },
              { label: "Tribus", actionType: "section", sectionName: "tribus", active: false },
              { label: "Fauna", actionType: "section", sectionName: "fauna", active: false },
              { label: "Flora", actionType: "section", sectionName: "flora", active: true },
              { label: "Usos", actionType: "section", sectionName: "usos", active: false },
              { label: "Agua", actionType: "section", sectionName: "agua", active: false },
              { label: "Cultura", actionType: "section", sectionName: "cultura", active: false },
              { label: "Geografia", actionType: "section", sectionName: "geografia", active: false },
              { label: "Inicio", actionType: "route", route: "/", active: false },
            ])}
          />
        )}

        {showHero && (
          <Element is={HeroSection}
            id="flora-v2-hero"
            backgroundImage={heroImageUrl}
            overlayColor={heroOverlayColor}
            height={heroHeight}
            minHeight={heroHeight}
            padding={60}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 40px',
            }}>
              <div style={{
                width: '6px',
                height: `${heroTitleFontSize * 1.2}px`,
                backgroundColor: '#ff6b35',
                flexShrink: 0,
              }} />
              
              <h1 style={{
                color: heroTitleColor,
                fontSize: `${heroTitleFontSize}px`,
                fontWeight: 'bold',
                margin: 0,
                fontFamily: 'sans-serif',
              }}>
                {heroTitle}
              </h1>
            </div>
          </Element>
        )}

        {showCards && (
          <div style={{
            backgroundColor: cardsBackgroundColor,
            padding: `${cardsPadding}px`,
            position: 'relative',
            minHeight: '100vh',
          }}>
            <div style={{
              display: 'flex',
              gap: '60px',
              maxWidth: '1400px',
              margin: '0 auto',
              position: 'relative',
            }}>
              {showSidebar && (
                <div style={{
                  position: 'sticky',
                  top: '100px',
                  alignSelf: 'flex-start',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '40px',
                  flexShrink: 0,
                  width: '80px',
                  paddingTop: '0',
                }}>
                  {/* Botón Volver */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Element
                      is={ChevronButton}
                      id="flora-v2-back-btn"
                      direction="left"
                      to={sidebarBackLink}
                      color="#ffffff"
                      bg="transparent"
                      size={28}
                      padding={10}
                    />
                  </div>

                  {/* Botón Like con contador interno */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Element
                      is={LikeButton}
                      id="flora-v2-like-btn"
                      sectionId="flora-v2-page"
                    />
                  </div>

                  {/* Botón Comentarios */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <Element
                      is={IconButton}
                      id="flora-v2-comment-btn"
                      iconName="chat-dots"
                      iconSize={28}
                      iconColor="#ffffff"
                      to={sidebarCommentLink}
                      actionType="route"
                    />
                    
                    {sidebarCommentCount > 0 && (
                      <Element
                        is={Text}
                        id="flora-v2-comment-count"
                        text={String(sidebarCommentCount)}
                        fontSize={16}
                        textColor="#ffffff"
                        fontWeight="500"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Grid Destacado */}
              <div style={{
                flex: 1,
                width: '100%',
              }}>
                <Element
                  is={FeatureGrid}
                  id="flora-v2-feature-grid"
                  cards={cards}
                  columns={cardsColumns}
                  gap={cardsGap}
                  padding={0}
                  backgroundColor="transparent"
                />
              </div>
            </div>
          </div>
        )}
      </Element>

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
              e.stopPropagation();
              deleteNode(id);
            }}
          />
        </div>
      )}
    </div>
  );
};

const FloraPageTemplateV2Settings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));
  
  const { upload, isUploading } = useUploadImage("Assets");

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Secciones',
          content: (
            <div className="d-grid gap-2">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showNavbar}
                  onChange={(e) => setProp((p) => (p.showNavbar = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Navbar</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showHero}
                  onChange={(e) => setProp((p) => (p.showHero = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Hero Section</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showCards}
                  onChange={(e) => setProp((p) => (p.showCards = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Grid de Cards</label>
              </div>
            </div>
          )
        },
        {
          label: 'Hero',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de Imagen de Fondo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroImageUrl || ''}
                  onChange={(e) => setProp((p) => (p.heroImageUrl = e.target.value))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              {props.heroImageUrl && (
                <div className="mt-2">
                  <label className="form-label small">Vista previa:</label>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: `url(${props.heroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }} />
                </div>
              )}
              <div>
                <label className="form-label">Subir Imagen de Fondo</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.heroImageUrl = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>
              <div>
                <label className="form-label">Color de Overlay</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroOverlayColor || 'rgba(0, 0, 0, 0.2)'}
                  onChange={(e) => setProp((p) => (p.heroOverlayColor = e.target.value))}
                  placeholder="rgba(0, 0, 0, 0.2)"
                />
              </div>
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroTitle || 'Flora'}
                  onChange={(e) => setProp((p) => (p.heroTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del Título</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroTitleFontSize || 48}
                  onChange={(e) => setProp((p) => (p.heroTitleFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Color del Título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.heroTitleColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.heroTitleColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Altura del Hero</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroHeight || 500}
                  onChange={(e) => setProp((p) => (p.heroHeight = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Cards',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">JSON de Cards (editar manualmente)</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={12}
                  value={props.cards || '[]'}
                  onChange={(e) => setProp((p) => (p.cards = e.target.value))}
                  placeholder='[{"id": 1, "image": "", "title": "...", "link": "#"}]'
                />
                <small className="text-muted">Formato: Array JSON con objetos {`{id, image, title, link}`}</small>
              </div>
              <div>
                <label className="form-label">Columnas del Grid (para cards después de la primera fila)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={1}
                  max={6}
                  value={props.cardsColumns || 3}
                  onChange={(e) => setProp((p) => (p.cardsColumns = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Gap entre Cards</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.cardsGap || 30}
                  onChange={(e) => setProp((p) => (p.cardsGap = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Padding del Grid</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.cardsPadding || 80}
                  onChange={(e) => setProp((p) => (p.cardsPadding = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Color de Fondo del Grid</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.cardsBackgroundColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.cardsBackgroundColor = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Sidebar',
          content: (
            <div className="d-grid gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showSidebar}
                  onChange={(e) => setProp((p) => (p.showSidebar = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Sidebar de Interacción</label>
              </div>
              <div>
                <label className="form-label">Link del Botón Volver</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.sidebarBackLink || '/'}
                  onChange={(e) => setProp((p) => (p.sidebarBackLink = e.target.value))}
                  placeholder="/ o https://..."
                />
              </div>
              <div>
                <label className="form-label">Cantidad de Likes</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.sidebarLikeCount || 1000}
                  onChange={(e) => setProp((p) => (p.sidebarLikeCount = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Link del Botón de Comentarios</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.sidebarCommentLink || '/forum'}
                  onChange={(e) => setProp((p) => (p.sidebarCommentLink = e.target.value))}
                  placeholder="/forum o https://..."
                />
              </div>
              <div>
                <label className="form-label">Cantidad de Comentarios</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.sidebarCommentCount || 0}
                  onChange={(e) => setProp((p) => (p.sidebarCommentCount = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Avanzado',
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

FloraPageTemplateV2.craft = {
  displayName: 'Página de Flora V2 (Grid Variado)',
  props: {
    showNavbar: true,
    showHero: true,
    showCards: true,
    navbarLogoText: 'Akaru',
    navbarBackgroundColor: '#1a1a1a',
    navbarItemColor: '#ffffff',
    navbarItemHoverColor: '#ff6b35',
    activeNavItem: 'Flora',
    heroImageUrl: 'https://placehold.co/1280x500',
    heroTitle: 'Flora',
    heroTitleColor: '#ffffff',
    heroTitleFontSize: 48,
    heroOverlayColor: 'rgba(0, 0, 0, 0.2)',
    heroHeight: 500,
    cards: JSON.stringify([
      {
        id: 1,
        image: '',
        title: '¿Contribuyó la selva amazónica a la "Pequeña Edad de Hielo" del siglo XVII?',
        link: '#',
      },
      {
        id: 2,
        image: '',
        title: 'Importancia de la deforestación',
        link: '#',
      },
      {
        id: 3,
        image: '',
        title: 'Biodiversidad del Amazonas',
        link: '#',
      },
      {
        id: 4,
        image: '',
        title: 'hongos en el amazonas',
        link: '#',
      },
      {
        id: 5,
        image: '',
        title: '¿Dónde comienza el río del amazonas?',
        link: '#',
      },
    ]),
    cardsColumns: 3,
    cardsGap: 30,
    cardsBackgroundColor: '#000000',
    cardsPadding: 80,
    showSidebar: true,
    sidebarBackLink: '/',
    sidebarLikeCount: 1000,
    sidebarCommentLink: '/forum',
    sidebarCommentCount: 0,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: FloraPageTemplateV2Settings
  }
};
