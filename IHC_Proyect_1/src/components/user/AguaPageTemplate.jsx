// components/user/AguaPageTemplate.jsx
// Plantilla completa de página de Agua
import React, { useState } from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { Text } from './Text';
import { Image } from './Image';
import { BackgroundImageContainer } from './ImageContainer';
import { useNavigate } from 'react-router-dom';
import { useUploadImage } from '../../hooks/useUploadImage';

export const AguaPageTemplate = ({
  showNavbar = true,
  showHero = true,
  showContentSections = true,
  // Navbar props
  navbarLogoText = 'Akaru',
  navbarBackgroundColor = '#1a1a1a',
  navbarItemColor = '#ffffff',
  navbarItemHoverColor = '#ff6b35',
  activeNavItem = 'Agua',
  // Hero props
  heroImageUrl = 'https://placehold.co/1280x500',
  heroTitle = 'AGUA',
  heroSubtitle = 'LA VENA VITAL DE LA AMAZONÍA',
  heroDescription = 'Explora el sistema circulatorio de la Tierra',
  heroTitleColor = '#ffffff',
  heroSubtitleColor = '#ffffff',
  heroDescriptionColor = '#ff6b35',
  heroTitleFontSize = 48,
  heroSubtitleFontSize = 24,
  heroDescriptionFontSize = 16,
  heroOverlayColor = 'rgba(0, 0, 0, 0.4)',
  heroHeight = 500,
  // Content sections props
  section1Title = 'El Corazón Climático',
  section1LeftImage = '',
  section1LeftTitle = 'El señor de los ríos',
  section1LeftText = 'El río Amazonas cuenta con más de 1,100 afluentes y contribuye con el 20% del agua dulce líquida del mundo. Su caudal es tan poderoso que diluye la sal del océano a lo largo de cientos de kilómetros, creando un estuario único donde prospera la vida.',
  section1RightImage = '',
  section1RightTitle = 'Ríos Voladores: La Magia Atmosférica',
  section1RightText = 'Los árboles liberan vapor de agua a través de la evapotranspiración, formando "ríos voladores" invisibles en la atmósfera. Estas corrientes transportan lluvia esencial miles de kilómetros hasta los Andes y las fértiles llanuras del sur del continente.',
  section2Image = '',
  section2Title = 'UN UNIVERSO SUMERGIDO',
  section3Title = 'Un Equilibrio Frágil',
  section3Text = 'La deforestación y la contaminación por mercurio amenazan el ciclo hidrológico. Sin la selva, el agua desaparece. Sin agua, el Amazonas se convertiría en una sabana árida. Proteger los ríos es, literalmente, salvaguardar el futuro de la humanidad.',
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
      <Element id="agua-container" is={BackgroundImageContainer} padding={0} background="#000000" canvas>
        {/* Navbar */}
        {showNavbar && (
          <Element is={Navbar}
            id="agua-navbar"
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
            id="agua-hero"
            backgroundImage={heroImageUrl}
            overlayColor={heroOverlayColor}
            height={heroHeight}
            minHeight={heroHeight}
            padding={60}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 40px',
              position: 'relative',
            }}>
              {/* Título y Subtítulo a la izquierda */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
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
                
                {/* Subtítulo */}
                <h2 style={{
                  color: heroSubtitleColor,
                  fontSize: `${heroSubtitleFontSize}px`,
                  fontWeight: 'normal',
                  margin: 0,
                  fontFamily: 'sans-serif',
                  paddingLeft: '26px',
                }}>
                  {heroSubtitle}
                </h2>
              </div>
              
              {/* Descripción en esquina inferior derecha */}
              <div style={{
                alignSelf: 'flex-end',
                marginTop: 'auto',
              }}>
                <p style={{
                  color: heroDescriptionColor,
                  fontSize: `${heroDescriptionFontSize}px`,
                  margin: 0,
                  fontFamily: 'sans-serif',
                  fontWeight: '500',
                }}>
                  {heroDescription}
                </p>
              </div>
            </div>
          </Element>
        )}

        {/* Content Sections */}
        {showContentSections && (
          <div style={{
            backgroundColor: '#000000',
            position: 'relative',
          }}>
            {/* Sección 1: El Corazón Climático */}
            <div style={{
              padding: '80px 60px',
              maxWidth: '1400px',
              margin: '0 auto',
            }}>
              {/* Título de sección */}
              <h2 style={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '60px',
                fontFamily: 'sans-serif',
              }}>
                {section1Title}
              </h2>
              
              {/* Dos columnas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
              }}>
                {/* Columna izquierda - Editable */}
                <Element id="agua-columna-izquierda" is={BackgroundImageContainer} padding={0} background="transparent" canvas>
                  <div style={{ marginBottom: '24px' }}>
                    <Element is={Image}
                      id="agua-col-izq-imagen"
                      src={section1LeftImage || 'https://placehold.co/600x300/2a2a2a/666666?text=Sin+imagen'}
                      alt={section1LeftTitle}
                      width={100}
                      height={300}
                      fit="cover"
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Element is={Text}
                      id="agua-col-izq-titulo"
                      text={section1LeftTitle}
                      fontSize={24}
                      textColor="#ff6b35"
                      textAlign="left"
                      lineHeight={1.2}
                    />
                  </div>
                  <Element is={Text}
                    id="agua-col-izq-texto"
                    text={section1LeftText}
                    fontSize={16}
                    textColor="#ffffff"
                    textAlign="left"
                    lineHeight={1.6}
                  />
                </Element>
                
                {/* Columna derecha - Editable */}
                <Element id="agua-columna-derecha" is={BackgroundImageContainer} padding={0} background="transparent" canvas>
                  <div style={{ marginBottom: '24px' }}>
                    <Element is={Image}
                      id="agua-col-der-imagen"
                      src={section1RightImage || 'https://placehold.co/600x300/2a2a2a/666666?text=Sin+imagen'}
                      alt={section1RightTitle}
                      width={100}
                      height={300}
                      fit="cover"
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Element is={Text}
                      id="agua-col-der-titulo"
                      text={section1RightTitle}
                      fontSize={24}
                      textColor="#ff6b35"
                      textAlign="left"
                      lineHeight={1.2}
                    />
                  </div>
                  <Element is={Text}
                    id="agua-col-der-texto"
                    text={section1RightText}
                    fontSize={16}
                    textColor="#ffffff"
                    textAlign="left"
                    lineHeight={1.6}
                  />
                </Element>
              </div>
            </div>
            
            {/* Sección 2: UN UNIVERSO SUMERGIDO - Editable */}
            <Element id="agua-seccion-2" is={BackgroundImageContainer} 
              padding={0} 
              background={section2Image ? `url(${section2Image})` : '#1a1a1a'}
              backgroundSize="cover"
              backgroundPosition="center"
              canvas
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '500px',
                marginTop: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Element is={Text}
                id="agua-seccion-2-titulo"
                text={section2Title}
                fontSize={48}
                textColor="#ffffff"
                textAlign="center"
                lineHeight={1.2}
                textShadowX={2}
                textShadowY={2}
                textShadowBlur={4}
                textShadowColor="rgba(0,0,0,0.8)"
              />
            </Element>
            
            {/* Sección 3: Un Equilibrio Frágil */}
            <div style={{
              padding: '80px 60px',
              maxWidth: '1000px',
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <h2 style={{
                color: '#ff6b35',
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '32px',
                fontFamily: 'sans-serif',
              }}>
                {section3Title}
              </h2>
              <p style={{
                color: '#ffffff',
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: 'sans-serif',
              }}>
                {section3Text}
              </p>
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

const AguaPageTemplateSettings = () => {
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
                  checked={props.showContentSections}
                  onChange={(e) => setProp((p) => (p.showContentSections = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Secciones de Contenido</label>
              </div>
            </div>
          )
        },
        {
          label: 'Hero',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL o Link de Imagen de Fondo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroImageUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setProp((p) => (p.heroImageUrl = url));
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">Pega aquí el link o URL de la imagen. La imagen aparecerá detrás del título "AGUA"</small>
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
              </div>
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroTitle || 'AGUA'}
                  onChange={(e) => setProp((p) => (p.heroTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Subtítulo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroSubtitle || 'LA VENA VITAL DE LA AMAZONÍA'}
                  onChange={(e) => setProp((p) => (p.heroSubtitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroDescription || 'Explora el sistema circulatorio de la Tierra'}
                  onChange={(e) => setProp((p) => (p.heroDescription = e.target.value))}
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
          label: 'Sección 1',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título de Sección</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section1Title || 'El Corazón Climático'}
                  onChange={(e) => setProp((p) => (p.section1Title = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">URL o Link de Imagen Columna Izquierda</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section1LeftImage || ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setProp((p) => (p.section1LeftImage = url));
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">Pega aquí el link o URL de la imagen</small>
              </div>
              {props.section1LeftImage && (
                <div className="mt-2">
                  <label className="form-label small">Vista previa:</label>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: `url(${props.section1LeftImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f0f0f0',
                  }} />
                </div>
              )}
              <div>
                <label className="form-label">Subir Imagen Columna Izquierda</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.section1LeftImage = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
                <small className="text-muted">Selecciona un archivo de imagen desde tu computadora</small>
              </div>
              <div>
                <label className="form-label">Título Columna Izquierda</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section1LeftTitle || 'El señor de los ríos'}
                  onChange={(e) => setProp((p) => (p.section1LeftTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto Columna Izquierda</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  value={props.section1LeftText || ''}
                  onChange={(e) => setProp((p) => (p.section1LeftText = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">URL o Link de Imagen Columna Derecha</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section1RightImage || ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setProp((p) => (p.section1RightImage = url));
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">Pega aquí el link o URL de la imagen</small>
              </div>
              {props.section1RightImage && (
                <div className="mt-2">
                  <label className="form-label small">Vista previa:</label>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: `url(${props.section1RightImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f0f0f0',
                  }} />
                </div>
              )}
              <div>
                <label className="form-label">Subir Imagen Columna Derecha</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.section1RightImage = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
                <small className="text-muted">Selecciona un archivo de imagen desde tu computadora</small>
              </div>
              <div>
                <label className="form-label">Título Columna Derecha</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section1RightTitle || 'Ríos Voladores: La Magia Atmosférica'}
                  onChange={(e) => setProp((p) => (p.section1RightTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto Columna Derecha</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  value={props.section1RightText || ''}
                  onChange={(e) => setProp((p) => (p.section1RightText = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Sección 2',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL o Link de Imagen de Fondo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section2Image || ''}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    setProp((p) => (p.section2Image = url));
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">Pega aquí el link o URL de la imagen</small>
              </div>
              {props.section2Image && (
                <div className="mt-2">
                  <label className="form-label small">Vista previa:</label>
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: `url(${props.section2Image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f0f0f0',
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
                      setProp((p) => (p.section2Image = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
                <small className="text-muted">Selecciona un archivo de imagen desde tu computadora</small>
              </div>
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section2Title || 'UN UNIVERSO SUMERGIDO'}
                  onChange={(e) => setProp((p) => (p.section2Title = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Sección 3',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.section3Title || 'Un Equilibrio Frágil'}
                  onChange={(e) => setProp((p) => (p.section3Title = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={6}
                  value={props.section3Text || ''}
                  onChange={(e) => setProp((p) => (p.section3Text = e.target.value))}
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

AguaPageTemplate.craft = {
  displayName: 'Página de Agua Completa',
  props: {
    showNavbar: true,
    showHero: true,
    showContentSections: true,
    navbarLogoText: 'Akaru',
    navbarBackgroundColor: '#1a1a1a',
    navbarItemColor: '#ffffff',
    navbarItemHoverColor: '#ff6b35',
    activeNavItem: 'Agua',
    heroImageUrl: 'https://placehold.co/1280x500',
    heroTitle: 'AGUA',
    heroSubtitle: 'LA VENA VITAL DE LA AMAZONÍA',
    heroDescription: 'Explora el sistema circulatorio de la Tierra',
    heroTitleColor: '#ffffff',
    heroSubtitleColor: '#ffffff',
    heroDescriptionColor: '#ff6b35',
    heroTitleFontSize: 48,
    heroSubtitleFontSize: 24,
    heroDescriptionFontSize: 16,
    heroOverlayColor: 'rgba(0, 0, 0, 0.4)',
    heroHeight: 500,
    section1Title: 'El Corazón Climático',
    section1LeftImage: '',
    section1LeftTitle: 'El señor de los ríos',
    section1LeftText: 'El río Amazonas cuenta con más de 1,100 afluentes y contribuye con el 20% del agua dulce líquida del mundo. Su caudal es tan poderoso que diluye la sal del océano a lo largo de cientos de kilómetros, creando un estuario único donde prospera la vida.',
    section1RightImage: '',
    section1RightTitle: 'Ríos Voladores: La Magia Atmosférica',
    section1RightText: 'Los árboles liberan vapor de agua a través de la evapotranspiración, formando "ríos voladores" invisibles en la atmósfera. Estas corrientes transportan lluvia esencial miles de kilómetros hasta los Andes y las fértiles llanuras del sur del continente.',
    section2Image: '',
    section2Title: 'UN UNIVERSO SUMERGIDO',
    section3Title: 'Un Equilibrio Frágil',
    section3Text: 'La deforestación y la contaminación por mercurio amenazan el ciclo hidrológico. Sin la selva, el agua desaparece. Sin agua, el Amazonas se convertiría en una sabana árida. Proteger los ríos es, literalmente, salvaguardar el futuro de la humanidad.',
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
    settings: AguaPageTemplateSettings
  }
};
