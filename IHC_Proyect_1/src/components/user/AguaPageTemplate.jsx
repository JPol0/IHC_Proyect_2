// components/user/AguaPageTemplate.jsx
// Plantilla completa de página de Agua
import React from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { BackgroundImageContainer } from './ImageContainer';
import { Text } from './Text';
import { Image } from './Image';
import { useUploadImage } from '../../hooks/useUploadImage';

export const AguaPageTemplate = ({
  showNavbar = true,
  showHero = true,
  showContent = true,
  // Navbar props
  navbarLogoText = 'Akaru',
  navbarBackgroundColor = '#1a1a1a',
  navbarItemColor = '#ffffff',
  navbarItemHoverColor = '#ff6b35',
  activeNavItem = 'Agua',
  // Hero props
  heroImageUrl = 'https://placehold.co/1280x720',
  heroMainTitle = 'AGUA',
  heroSubtitle1 = 'LA VENA VITAL',
  heroSubtitle2 = 'DE LA AMAZONÍA',
  heroDescription = 'Explora el sistema circulatorio de la Tierra',
  heroTitleColor = '#ffffff',
  heroDescriptionColor = '#ff6b35',
  heroTitleFontSize = 72,
  heroSubtitleFontSize = 36,
  heroDescriptionFontSize = 18,
  heroOverlayColor = 'rgba(0, 0, 0, 0.3)',
  heroHeight = 600,
  // Section divider
  sectionDividerText = 'El Corazón Climático',
  sectionDividerColor = '#ffffff',
  sectionDividerFontSize = 32,
  // Content Block 1: Two columns
  contentBlock1ImageUrl = 'https://placehold.co/600x400',
  contentBlock1Title1 = 'El señor de los ríos',
  contentBlock1Text1 = 'El Amazonas no es solo un río, es un sistema de más de 1.100 afluentes que se extienden por más de 6.400 kilómetros. Su desembocadura forma el estuario más grande del mundo, vertiendo al océano Atlántico aproximadamente 209.000 metros cúbicos de agua por segundo.',
  contentBlock1Title2 = 'Ríos Voladores: La Magia Atmosférica',
  contentBlock1Text2 = 'La evapotranspiración de la selva amazónica genera "ríos voladores": masas de vapor de agua que viajan por la atmósfera y alimentan las lluvias en regiones distantes. Este fenómeno es crucial para el clima de Sudamérica y más allá.',
  contentBlock1TitleColor = '#ff6b35',
  contentBlock1TextColor = '#ffffff',
  contentBlock1TitleFontSize = 24,
  contentBlock1TextFontSize = 16,
  contentBlock1BackgroundColor = '#000000',
  contentBlock1Padding = 80,
  // Content Block 2: Full width image with overlay text
  contentBlock2ImageUrl = 'https://placehold.co/1280x500',
  contentBlock2Text = 'UN UNIVERSO SUMERGIDO',
  contentBlock2TextColor = '#ffffff',
  contentBlock2TextFontSize = 64,
  contentBlock2OverlayColor = 'rgba(0, 0, 0, 0.4)',
  contentBlock2Height = 500,
  // Content Block 3: Text section
  contentBlock3Title = 'Un Equilibrio Frágil',
  contentBlock3Text = 'La deforestación y la contaminación por mercurio amenazan los ríos amazónicos. Proteger estos ecosistemas acuáticos es esencial para mantener el equilibrio climático global y preservar la biodiversidad única que albergan.',
  contentBlock3TitleColor = '#ff6b35',
  contentBlock3TextColor = '#ffffff',
  contentBlock3TitleFontSize = 32,
  contentBlock3TextFontSize = 18,
  contentBlock3BackgroundColor = '#000000',
  contentBlock3Padding = 80,
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
      <Element id="agua-background" is={BackgroundImageContainer} padding={0} background="#000000" canvas>
        {showNavbar && (
          <Element is={Navbar}
            id="agua-navbar"
            logoText={navbarLogoText}
            backgroundColor={navbarBackgroundColor}
            itemColor={navbarItemColor}
            itemHoverColor={navbarItemHoverColor}
            navItems={JSON.stringify([
              { label: "Foro", actionType: "section", sectionName: "foro", active: false },
              { label: "Tribus", actionType: "section", sectionName: "tribus", active: false },
              { label: "Fauna", actionType: "section", sectionName: "fauna", active: false },
              { label: "Flora", actionType: "section", sectionName: "flora", active: false },
              { label: "Usos", actionType: "section", sectionName: "usos", active: false },
              { label: "Agua", actionType: "section", sectionName: "agua", active: true },
              { label: "Cultura", actionType: "section", sectionName: "cultura", active: false },
              { label: "Geografia", actionType: "section", sectionName: "geografia", active: false },
              { label: "Inicio", actionType: "route", route: "/", active: false },
            ])}
          />
        )}

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
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '20px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 60px',
            }}>
              {/* Main title with orange bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '10px',
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
                  lineHeight: 1.2,
                }}>
                  {heroMainTitle}
                </h1>
              </div>
              
              {/* Subtitles */}
              <h2 style={{
                color: heroTitleColor,
                fontSize: `${heroSubtitleFontSize}px`,
                fontWeight: 'bold',
                margin: 0,
                fontFamily: 'sans-serif',
                lineHeight: 1.2,
              }}>
                {heroSubtitle1}
              </h2>
              <h2 style={{
                color: heroTitleColor,
                fontSize: `${heroSubtitleFontSize}px`,
                fontWeight: 'bold',
                margin: 0,
                fontFamily: 'sans-serif',
                lineHeight: 1.2,
              }}>
                {heroSubtitle2}
              </h2>
              
              {/* Description */}
              <p style={{
                color: heroDescriptionColor,
                fontSize: `${heroDescriptionFontSize}px`,
                fontWeight: 'normal',
                margin: '20px 0 0 0',
                fontFamily: 'sans-serif',
              }}>
                {heroDescription}
              </p>
            </div>
          </Element>
        )}

        {showContent && (
          <div>
            {/* Section Divider */}
            {sectionDividerText && (
              <div style={{
                backgroundColor: '#000000',
                padding: '60px 80px',
                textAlign: 'center',
              }}>
                <Element id="agua-section-divider" is={Text}
                  text={sectionDividerText}
                  fontSize={sectionDividerFontSize}
                  textColor={sectionDividerColor}
                  textAlign="center"
                />
              </div>
            )}

            {/* Content Block 1: Two columns */}
            <div style={{
              backgroundColor: contentBlock1BackgroundColor,
              padding: `${contentBlock1Padding}px`,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                maxWidth: '1400px',
                margin: '0 auto',
                alignItems: 'center',
              }}>
                {/* Left: Image */}
                <div style={{
                  width: '100%',
                  height: '500px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                }}>
                  <Element id="agua-content-block-1-image" is={Image}
                    src={contentBlock1ImageUrl}
                    alt="Río Amazonas"
                    width={100}
                    height={500}
                    fit="cover"
                  />
                </div>

                {/* Right: Two text blocks with orange separator */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '40px',
                }}>
                  {/* First text block */}
                  <div>
                    <Element id="agua-content-block-1-title-1" is={Text}
                      text={contentBlock1Title1}
                      fontSize={contentBlock1TitleFontSize}
                      textColor={contentBlock1TitleColor}
                      textAlign="left"
                    />
                    <div style={{ marginTop: '20px' }}>
                      <Element id="agua-content-block-1-text-1" is={Text}
                        text={contentBlock1Text1}
                        fontSize={contentBlock1TextFontSize}
                        textColor={contentBlock1TextColor}
                        textAlign="left"
                        lineHeight={1.6}
                      />
                    </div>
                  </div>

                  {/* Orange separator line */}
                  <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#ff6b35',
                    margin: '20px 0',
                  }} />

                  {/* Second text block */}
                  <div>
                    <Element id="agua-content-block-1-title-2" is={Text}
                      text={contentBlock1Title2}
                      fontSize={contentBlock1TitleFontSize}
                      textColor={contentBlock1TitleColor}
                      textAlign="left"
                    />
                    <div style={{ marginTop: '20px' }}>
                      <Element id="agua-content-block-1-text-2" is={Text}
                        text={contentBlock1Text2}
                        fontSize={contentBlock1TextFontSize}
                        textColor={contentBlock1TextColor}
                        textAlign="left"
                        lineHeight={1.6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Block 2: Full width image with overlay text */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: `${contentBlock2Height}px`,
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}>
                <Element id="agua-content-block-2-image" is={Image}
                  src={contentBlock2ImageUrl}
                  alt="Universo sumergido"
                  width={100}
                  height={contentBlock2Height}
                  fit="cover"
                />
              </div>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: contentBlock2OverlayColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Element id="agua-content-block-2-text" is={Text}
                  text={contentBlock2Text}
                  fontSize={contentBlock2TextFontSize}
                  textColor={contentBlock2TextColor}
                  textAlign="center"
                  textShadowX={0}
                  textShadowY={2}
                  textShadowBlur={8}
                  textShadowColor="rgba(0,0,0,0.5)"
                />
              </div>
            </div>

            {/* Content Block 3: Text section */}
            <div style={{
              backgroundColor: contentBlock3BackgroundColor,
              padding: `${contentBlock3Padding}px`,
            }}>
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
              }}>
                <Element id="agua-content-block-3-title" is={Text}
                  text={contentBlock3Title}
                  fontSize={contentBlock3TitleFontSize}
                  textColor={contentBlock3TitleColor}
                  textAlign="left"
                />
                <div style={{ marginTop: '30px' }}>
                  <Element id="agua-content-block-3-text" is={Text}
                    text={contentBlock3Text}
                    fontSize={contentBlock3TextFontSize}
                    textColor={contentBlock3TextColor}
                    textAlign="left"
                    lineHeight={1.8}
                  />
                </div>
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
                  checked={props.showContent}
                  onChange={(e) => setProp((p) => (p.showContent = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Contenido</label>
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
                <label className="form-label">Título Principal</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroMainTitle || 'AGUA'}
                  onChange={(e) => setProp((p) => (p.heroMainTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Subtítulo 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroSubtitle1 || 'LA VENA VITAL'}
                  onChange={(e) => setProp((p) => (p.heroSubtitle1 = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Subtítulo 2</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroSubtitle2 || 'DE LA AMAZONÍA'}
                  onChange={(e) => setProp((p) => (p.heroSubtitle2 = e.target.value))}
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
                <label className="form-label">Tamaño Título Principal</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroTitleFontSize || 72}
                  onChange={(e) => setProp((p) => (p.heroTitleFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño Subtítulos</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroSubtitleFontSize || 36}
                  onChange={(e) => setProp((p) => (p.heroSubtitleFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño Descripción</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroDescriptionFontSize || 18}
                  onChange={(e) => setProp((p) => (p.heroDescriptionFontSize = Number(e.target.value)))}
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
                <label className="form-label">Color de la Descripción</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.heroDescriptionColor || '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.heroDescriptionColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color de Overlay</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.heroOverlayColor || 'rgba(0, 0, 0, 0.3)'}
                  onChange={(e) => setProp((p) => (p.heroOverlayColor = e.target.value))}
                  placeholder="rgba(0, 0, 0, 0.3)"
                />
              </div>
              <div>
                <label className="form-label">Altura del Hero</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.heroHeight || 600}
                  onChange={(e) => setProp((p) => (p.heroHeight = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Divisor de Sección',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Texto</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.sectionDividerText || 'El Corazón Climático'}
                  onChange={(e) => setProp((p) => (p.sectionDividerText = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.sectionDividerColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.sectionDividerColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño de Fuente</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.sectionDividerFontSize || 32}
                  onChange={(e) => setProp((p) => (p.sectionDividerFontSize = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Bloque 1 (2 Columnas)',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de Imagen (Columna Izquierda)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock1ImageUrl || ''}
                  onChange={(e) => setProp((p) => (p.contentBlock1ImageUrl = e.target.value))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div>
                <label className="form-label">Subir Imagen</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.contentBlock1ImageUrl = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>
              <div>
                <label className="form-label">Título 1</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock1Title1 || 'El señor de los ríos'}
                  onChange={(e) => setProp((p) => (p.contentBlock1Title1 = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto 1</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  value={props.contentBlock1Text1 || ''}
                  onChange={(e) => setProp((p) => (p.contentBlock1Text1 = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Título 2</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock1Title2 || 'Ríos Voladores: La Magia Atmosférica'}
                  onChange={(e) => setProp((p) => (p.contentBlock1Title2 = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto 2</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  value={props.contentBlock1Text2 || ''}
                  onChange={(e) => setProp((p) => (p.contentBlock1Text2 = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color de Títulos</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock1TitleColor || '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.contentBlock1TitleColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color de Texto</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock1TextColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.contentBlock1TextColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño de Títulos</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock1TitleFontSize || 24}
                  onChange={(e) => setProp((p) => (p.contentBlock1TitleFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño de Texto</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock1TextFontSize || 16}
                  onChange={(e) => setProp((p) => (p.contentBlock1TextFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock1BackgroundColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.contentBlock1BackgroundColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock1Padding || 80}
                  onChange={(e) => setProp((p) => (p.contentBlock1Padding = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Bloque 2 (Imagen Full Width)',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de Imagen de Fondo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock2ImageUrl || ''}
                  onChange={(e) => setProp((p) => (p.contentBlock2ImageUrl = e.target.value))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div>
                <label className="form-label">Subir Imagen</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => (p.contentBlock2ImageUrl = url));
                      e.target.value = '';
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>
              <div>
                <label className="form-label">Texto Overlay</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock2Text || 'UN UNIVERSO SUMERGIDO'}
                  onChange={(e) => setProp((p) => (p.contentBlock2Text = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color del Texto</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock2TextColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.contentBlock2TextColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del Texto</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock2TextFontSize || 64}
                  onChange={(e) => setProp((p) => (p.contentBlock2TextFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Color de Overlay</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock2OverlayColor || 'rgba(0, 0, 0, 0.4)'}
                  onChange={(e) => setProp((p) => (p.contentBlock2OverlayColor = e.target.value))}
                  placeholder="rgba(0, 0, 0, 0.4)"
                />
              </div>
              <div>
                <label className="form-label">Altura</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock2Height || 500}
                  onChange={(e) => setProp((p) => (p.contentBlock2Height = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Bloque 3 (Texto)',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.contentBlock3Title || 'Un Equilibrio Frágil'}
                  onChange={(e) => setProp((p) => (p.contentBlock3Title = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Texto</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={5}
                  value={props.contentBlock3Text || ''}
                  onChange={(e) => setProp((p) => (p.contentBlock3Text = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color del Título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock3TitleColor || '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.contentBlock3TitleColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Color del Texto</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock3TextColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.contentBlock3TextColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del Título</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock3TitleFontSize || 32}
                  onChange={(e) => setProp((p) => (p.contentBlock3TitleFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Tamaño del Texto</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock3TextFontSize || 18}
                  onChange={(e) => setProp((p) => (p.contentBlock3TextFontSize = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentBlock3BackgroundColor || '#000000'}
                  onChange={(e) => setProp((p) => (p.contentBlock3BackgroundColor = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentBlock3Padding || 80}
                  onChange={(e) => setProp((p) => (p.contentBlock3Padding = Number(e.target.value)))}
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
    showContent: true,
    navbarLogoText: 'Akaru',
    navbarBackgroundColor: '#1a1a1a',
    navbarItemColor: '#ffffff',
    navbarItemHoverColor: '#ff6b35',
    activeNavItem: 'Agua',
    heroImageUrl: 'https://placehold.co/1280x720',
    heroMainTitle: 'AGUA',
    heroSubtitle1: 'LA VENA VITAL',
    heroSubtitle2: 'DE LA AMAZONÍA',
    heroDescription: 'Explora el sistema circulatorio de la Tierra',
    heroTitleColor: '#ffffff',
    heroDescriptionColor: '#ff6b35',
    heroTitleFontSize: 72,
    heroSubtitleFontSize: 36,
    heroDescriptionFontSize: 18,
    heroOverlayColor: 'rgba(0, 0, 0, 0.3)',
    heroHeight: 600,
    sectionDividerText: 'El Corazón Climático',
    sectionDividerColor: '#ffffff',
    sectionDividerFontSize: 32,
    contentBlock1ImageUrl: 'https://placehold.co/600x400',
    contentBlock1Title1: 'El señor de los ríos',
    contentBlock1Text1: 'El Amazonas no es solo un río, es un sistema de más de 1.100 afluentes que se extienden por más de 6.400 kilómetros. Su desembocadura forma el estuario más grande del mundo, vertiendo al océano Atlántico aproximadamente 209.000 metros cúbicos de agua por segundo.',
    contentBlock1Title2: 'Ríos Voladores: La Magia Atmosférica',
    contentBlock1Text2: 'La evapotranspiración de la selva amazónica genera "ríos voladores": masas de vapor de agua que viajan por la atmósfera y alimentan las lluvias en regiones distantes. Este fenómeno es crucial para el clima de Sudamérica y más allá.',
    contentBlock1TitleColor: '#ff6b35',
    contentBlock1TextColor: '#ffffff',
    contentBlock1TitleFontSize: 24,
    contentBlock1TextFontSize: 16,
    contentBlock1BackgroundColor: '#000000',
    contentBlock1Padding: 80,
    contentBlock2ImageUrl: 'https://placehold.co/1280x500',
    contentBlock2Text: 'UN UNIVERSO SUMERGIDO',
    contentBlock2TextColor: '#ffffff',
    contentBlock2TextFontSize: 64,
    contentBlock2OverlayColor: 'rgba(0, 0, 0, 0.4)',
    contentBlock2Height: 500,
    contentBlock3Title: 'Un Equilibrio Frágil',
    contentBlock3Text: 'La deforestación y la contaminación por mercurio amenazan los ríos amazónicos. Proteger estos ecosistemas acuáticos es esencial para mantener el equilibrio climático global y preservar la biodiversidad única que albergan.',
    contentBlock3TitleColor: '#ff6b35',
    contentBlock3TextColor: '#ffffff',
    contentBlock3TitleFontSize: 32,
    contentBlock3TextFontSize: 18,
    contentBlock3BackgroundColor: '#000000',
    contentBlock3Padding: 80,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: AguaPageTemplateSettings
  }
};
