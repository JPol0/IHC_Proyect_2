// components/user/TribesPageTemplate.jsx
// Plantilla completa de página de Tribus Indígenas
import React, { useState } from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { Grid5 } from './Grid5';
import { FeatureCard } from './FeatureCard';
import { BackgroundImageContainer } from './ImageContainer';
import { useNavigate } from 'react-router-dom';
import { useUploadImage } from '../../hooks/useUploadImage';

export const TribesPageTemplate = ({
  showNavbar = true,
  showHero = true,
  showCards = true,
  // Navbar props
  navbarLogoText = 'Akaru',
  navbarBackgroundColor = '#1a1a1a',
  navbarItemColor = '#ffffff',
  navbarItemHoverColor = '#ff6b35',
  activeNavItem = 'Tribus',
  // Hero props
  heroImageUrl = 'https://placehold.co/1280x500',
  heroTitle = 'Tribus Indigenas',
  heroTitleColor = '#ffffff',
  heroTitleFontSize = 48,
  heroOverlayColor = 'rgba(0, 0, 0, 0.4)',
  heroHeight = 400,
  // Cards props
  cards = JSON.stringify([
    {
      id: 1,
      image: '',
      title: 'Ubicacion Geografica',
      link: '#',
    },
    {
      id: 2,
      image: '',
      title: 'Organizacion social',
      link: '#',
    },
    {
      id: 3,
      image: '',
      title: 'Idiomas y Comunicacion',
      link: '#',
    },
    {
      id: 4,
      image: '',
      title: 'Musica y Danza',
      link: '#',
    },
    {
      id: 5,
      image: '',
      title: 'Gastronomia',
      link: '#',
    },
    {
      id: 6,
      image: '',
      title: 'Economía y Sustentabilidad',
      link: '#',
    },
    {
      id: 7,
      image: '',
      title: 'Vestimenta y Pintura Corporal',
      link: '#',
    },
    {
      id: 8,
      image: '',
      title: 'Vivienda y Arquitectura',
      link: '#',
    },
  ]),
  cardsColumns = 3,
  cardsGap = 24,
  cardsBackgroundColor = '#000000',
  cardsPadding = 60,
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
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(sidebarLikeCount);

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
    parsedCards = typeof cards === 'string' ? JSON.parse(cards) : cards;
  } catch (e) {
    parsedCards = [];
  }

  // Preparar cards para Grid5: necesitamos 5 cards (3 overlay + 2 horizontal)
  const grid5Cards = parsedCards.slice(0, 5);

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
      <Element is={BackgroundImageContainer} padding={0} background="#000000" canvas>
        {/* Navbar */}
        {showNavbar && (
          <Element is={Navbar}
            id="tribes-navbar"
            logoText={navbarLogoText}
            backgroundColor={navbarBackgroundColor}
            itemColor={navbarItemColor}
            itemHoverColor={navbarItemHoverColor}
            navItems={JSON.stringify([
              { label: "Foro", actionType: "section", sectionName: "foro", active: true },
              { label: "Tribus", actionType: "section", sectionName: "tribus", active: false },
              { label: "Fauna", actionType: "section", sectionName: "fauna", active: false },
              { label: "Flora", actionType: "section", sectionName: "flora", active: false },
              { label: "Usos", actionType: "section", sectionName: "usos", active: false },
              { label: "Agua", actionType: "section", sectionName: "agua", active: false },
              { label: "Cultura", actionType: "section", sectionName: "cultura", active: false },
              { label: "Geografia", actionType: "section", sectionName: "geografia", active: false },
              { label: "Inicio", actionType: "route", route: "/", active: true },
            ])}
          />
        )}

        {/* Hero Section */}
        {showHero && (
          <Element is={HeroSection}
            id="tribes-hero"
            backgroundImage={heroImageUrl}
            overlayColor={heroOverlayColor}
            height={heroHeight}
            minHeight={heroHeight}
            padding={60}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              height: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 40px',
            }}>
              {/* Barra naranja vertical */}
              <div style={{
                width: '6px',
                height: `${heroTitleFontSize * 1.2}px`,
                backgroundColor: '#ff6b35',
                flexShrink: 0,
              }} />
              
              {/* Título */}
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

        {/* Grid de Cards con Sidebar */}
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
              {/* Sidebar izquierdo con iconos de interacción - Posicionado absolutamente */}
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
                  {/* Botón de volver */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Ejecutar siempre, pero en modo edición también prevenir la selección del componente
                      navigate(sidebarBackLink);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '28px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    title="Volver"
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>

                  {/* Botón de like */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Ejecutar siempre, pero en modo edición también prevenir la selección del componente
                        setIsLiked(!isLiked);
                        setCurrentLikeCount(prev => isLiked ? prev - 1 : prev + 1);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isLiked ? '#ff0000' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '28px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      title="Me gusta"
                    >
                      <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                    <span style={{
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '500',
                      fontFamily: 'sans-serif',
                    }}>
                      {currentLikeCount >= 1000 ? `${(currentLikeCount / 1000).toFixed(1)}k` : currentLikeCount}
                    </span>
                  </div>

                  {/* Botón de comentarios */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Ejecutar siempre, pero en modo edición también prevenir la selección del componente
                        if (sidebarCommentLink.startsWith('http')) {
                          window.open(sidebarCommentLink, '_blank');
                        } else {
                          navigate(sidebarCommentLink);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '28px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      title="Comentarios"
                    >
                      <i className="bi bi-chat-dots"></i>
                    </button>
                    {sidebarCommentCount > 0 && (
                      <span style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '500',
                        fontFamily: 'sans-serif',
                      }}>
                        {sidebarCommentCount}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Grid 5 (3+2) */}
              <div style={{
                flex: 1,
                width: '100%',
              }}>
                <Element
                  is={Grid5}
                  id="tribes-grid5"
                  gap={cardsGap}
                  padding={0}
                  backgroundColor="transparent"
                  gridTemplateColumns="repeat(6, 1fr)"
                  canvas
                >
                  {/* Fila 1: 3 tarjetas overlay, cada una ocupa 2 columnas de 6 */}
                  {grid5Cards.slice(0, 3).map((card, index) => (
                    <Element
                      key={card.id || index}
                      is={FeatureCard}
                      id={`tribes-card-${card.id || index}`}
                      variant="overlay"
                      columnSpan={2}
                      title={card.title || ''}
                      imageUrl={card.image || ''}
                      linkUrl={card.link || '#'}
                      height={200}
                      backgroundColor="#ffffff"
                      titleColor="#ffffff"
                      buttonColor="#ffffff"
                    />
                  ))}
                  
                  {/* Fila 2: 2 tarjetas horizontales, cada una ocupa 3 columnas de 6 */}
                  {grid5Cards.slice(3, 5).map((card, index) => (
                    <Element
                      key={card.id || index + 3}
                      is={FeatureCard}
                      id={`tribes-card-${card.id || index + 3}`}
                      variant="horizontal"
                      columnSpan={3}
                      title={card.title || ''}
                      imageUrl={card.image || ''}
                      linkUrl={card.link || '#'}
                      backgroundColor="#000000"
                      titleColor="#ffffff"
                      buttonColor="#ffffff"
                    />
                  ))}
                </Element>
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

const TribesPageTemplateSettings = () => {
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
                <small className="text-muted">Pega aquí el link o URL de la imagen. La imagen aparecerá detrás del título "Tribus Indigenas"</small>
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
                <small className="text-muted">O arrastra y suelta una imagen directamente en el Hero Section</small>
              </div>
              <div>
                <label className="form-label">Color de Overlay</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroOverlayColor || 'rgba(0, 0, 0, 0.4)'}
                  onChange={(e) => setProp((p) => (p.heroOverlayColor = e.target.value))}
                  placeholder="rgba(0, 0, 0, 0.4)"
                />
                <small className="text-muted">Overlay oscuro para mejorar la legibilidad del texto</small>
              </div>
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroTitle || 'Tribus Indigenas'}
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
                  value={props.heroHeight || 400}
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
                <label className="form-label">Columnas</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.cardsColumns || 3}
                  onChange={(e) => setProp((p) => (p.cardsColumns = Number(e.target.value)))}
                  min={1}
                  max={6}
                />
              </div>
              <div>
                <label className="form-label">Gap entre Cards</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.cardsGap || 24}
                  onChange={(e) => setProp((p) => (p.cardsGap = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Padding del Grid</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.cardsPadding || 60}
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

TribesPageTemplate.craft = {
  displayName: 'Página de Tribus Completa',
  props: {
    showNavbar: true,
    showHero: true,
    showCards: true,
    navbarLogoText: 'Akaru',
    navbarBackgroundColor: '#1a1a1a',
    navbarItemColor: '#ffffff',
    navbarItemHoverColor: '#ff6b35',
    activeNavItem: 'Tribus',
    heroImageUrl: 'https://placehold.co/1280x500',
    heroTitle: 'Tribus Indigenas',
    heroTitleColor: '#ffffff',
    heroTitleFontSize: 48,
    heroOverlayColor: 'rgba(0, 0, 0, 0.4)',
    heroHeight: 400,
    cards: JSON.stringify([
      { id: 1, image: '', title: 'Ubicacion Geografica', link: '#' },
      { id: 2, image: '', title: 'Organizacion social', link: '#' },
      { id: 3, image: '', title: 'Idiomas y Comunicacion', link: '#' },
      { id: 4, image: '', title: 'Musica y Danza', link: '#' },
      { id: 5, image: '', title: 'Gastronomia', link: '#' },
      { id: 6, image: '', title: 'Economía y Sustentabilidad', link: '#' },
      { id: 7, image: '', title: 'Vestimenta y Pintura Corporal', link: '#' },
      { id: 8, image: '', title: 'Vivienda y Arquitectura', link: '#' },
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
    settings: TribesPageTemplateSettings
  }
};
