import React, { useState } from 'react';
import { Element, useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import Sidebar from './Sidebar';

// Component Imports
import { Container } from '../user/Container';
import { Button } from '../user/Button';
import { Text } from '../user/Text';
import { Image } from '../user/Image';
import { Card } from '../user/Card';
import { ChevronButton } from '../user/ChevronButton';
import { IconButton } from '../user/IconButton';
import { BackgroundImageContainer } from "../user/ImageContainer";
import { FileDownload } from '../user/FileDownload';
import { ForumButton } from '../user/ForumButton';
import { LikeButton } from '../user/LikeButton';
import { Navbar } from '../user/Navbar';
import { HeroSection } from '../user/HeroSection';
import { NewsSection } from '../user/NewsSection';
import { CategoryGrid } from '../user/CategoryGrid';
import { FeaturedPhoto } from '../user/FeaturedPhoto';
import { ForumCTA } from '../user/ForumCTA';
import { HomepageSection } from '../user/HomepageSection';
import { NewsArticle } from '../user/NewsArticle';
import { NewsPageTemplate } from '../user/NewsPageTemplate';
import { TribesPageTemplate } from '../user/TribesPageTemplate';
import { FaunaPageTemplate } from '../user/FaunaPageTemplate';
import { FloraPageTemplateV2 } from '../user/FloraPageTemplateV2';
import { AguaPageTemplate } from '../user/AguaPageTemplate';
import { TribesCard } from '../user/TribesCard';
import { FeatureGrid } from '../user/FeatureGrid';
import { Grid2 } from '../user/Grid2';
import { Grid3 } from '../user/Grid3';
import { GridCol } from '../user/GridCol';
import { FeatureCard } from '../user/FeatureCard';

export default function LeftSidebar() {
  const { connectors } = useEditor();
  const [activeTab, setActiveTab] = useState('components'); // 'components', 'pages', 'layers'
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const ToolButton = ({ icon, label, refProp }) => (
    <div className="col-6">
       <div 
        ref={refProp} 
        className="card h-100 text-center p-2 shadow-sm border-0 bg-white cursor-pointer hover-shadow"
        style={{ cursor: 'grab', transition: 'all 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
       >
         <div className="card-body p-1 d-flex flex-column align-items-center justify-content-center">
            <i className={`bi ${icon} fs-3 mb-2`} style={{ color: '#6d28d9' }}></i>
            <span className="small fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>{label}</span>
         </div>
       </div>
    </div>
  );

  const componentsList = [
    { label: "Texto", icon: "bi-type", create: (ref) => connectors.create(ref, <Text text="Texto" fontSize={18} />) },
    { label: "Botón", icon: "bi-hand-index-thumb", create: (ref) => connectors.create(ref, <Button size="small" variant="contained">Botón</Button>) },
    { label: "Imagen", icon: "bi-image", create: (ref) => connectors.create(ref, <Image />) },
    { label: "Contenedor", icon: "bi-square", create: (ref) => connectors.create(ref, <Element is={Container} padding={16} background="#ffffff" canvas />) },
    { label: "Tarjeta", icon: "bi-card-heading", create: (ref) => connectors.create(ref, <Element is={Card} />) },
    { label: "Grid Destacado", icon: "bi-grid-1x2", create: (ref) => connectors.create(ref, <Element is={FeatureGrid} />) },
    { label: "Ícono", icon: "bi-star", create: (ref) => connectors.create(ref, <IconButton iconName="star" iconSize={24} />) },
    { label: "Botón Nav", icon: "bi-chevron-bar-left", create: (ref) => connectors.create(ref, <ChevronButton direction="left" color="#E6E3A1" />) },
    { label: "Caja Img", icon: "bi-card-image", create: (ref) => connectors.create(ref, <Element is={BackgroundImageContainer} padding={16} background="#ffffff" canvas />) },
    { label: "Descarga", icon: "bi-download", create: (ref) => connectors.create(ref, <FileDownload />) },
    { label: "Foro", icon: "bi-chat-left-text", create: (ref) => connectors.create(ref, <ForumButton />) },
    { label: "Me Gusta", icon: "bi-heart", create: (ref) => connectors.create(ref, <LikeButton />) },
    { label: "Columnas", icon: "bi-layout-sidebar", create: (ref) => connectors.create(ref, <Element is={Container} padding={16} background="#eeeeee" canvas ><Text text="Column 1" /><Text text="Column 2" /></Element>) },
    { label: "Barra Nav", icon: "bi-menu-button-wide", create: (ref) => connectors.create(ref, <Navbar />) },
    { label: "Grid 2 Col", icon: "bi-grid", create: (ref) => connectors.create(ref, 
      <Element is={Grid2} canvas>
        <Element is={TribesCard} 
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000" 
            title="Ubicacion Geografica"
            imageUrl="https://placehold.co/400x300"
        />
        <Element is={TribesCard} 
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000" 
            title="Organizacion Social"
            imageUrl="https://placehold.co/400x300"
        />
      </Element>
    ) },
    { label: "Grid 3 Col", icon: "bi-grid-3x3", create: (ref) => connectors.create(ref, 
      <Element is={Grid3} canvas>
        <Element is={TribesCard} 
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000"
            title="Ubicacion Geografica"
            imageUrl="https://placehold.co/400x300"
        />
        <Element is={TribesCard} 
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000"
            title="Organizacion Social"
            imageUrl="https://placehold.co/400x300"
        />
        <Element is={TribesCard} 
             backgroundColor="#ffffff" 
             titleColor="#000000" 
             buttonTextColor="#000000"
             title="Idiomas y Comunicacion"
             imageUrl="https://placehold.co/400x300"
        />
      </Element>
    ) },
    { label: "Grid Lista", icon: "bi-view-list", create: (ref) => connectors.create(ref, 
      <Element is={GridCol} canvas>
        <Element is={FeatureCard} 
            variant="horizontal"
            title="Artículo Destacado"
            imageUrl="https://placehold.co/600x400"
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000"
        />
        <Element is={FeatureCard} 
            variant="horizontal"
            title="Artículo Secundario"
            imageUrl="https://placehold.co/600x400"
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000"
        />
        <Element is={FeatureCard} 
            variant="horizontal"
            title="Artículo Terciario"
            imageUrl="https://placehold.co/600x400"
            backgroundColor="#ffffff" 
            titleColor="#000000" 
            buttonTextColor="#000000"
        />
      </Element>
    ) },
  ];

  const templatesGroups = [
    {
      title: "Plantillas de Páginas",
      items: [
         { 
           label: "Página de Noticias Completa", 
           icon: "bi-file-post", 
           element: (
                <Element is={BackgroundImageContainer} padding={0} background="#000000" canvas>
                      {/* Navbar */}
                      <Element is={Navbar} 
                      logoText="Akaru"
                      backgroundColor="#1a1a1a"
                      itemColor="#ffffff"
                      itemHoverColor="#ff6b35"
                      navItems={JSON.stringify([
                          { label: "Foro", actionType: "section", sectionName: "foro" },
                          { label: "Tribus", actionType: "section", sectionName: "tribus" },
                          { label: "Fauna", actionType: "section", sectionName: "fauna" },
                          { label: "Flora", actionType: "section", sectionName: "flora" },
                          { label: "Usos", actionType: "section", sectionName: "usos" },
                          { label: "Agua", actionType: "section", sectionName: "agua" },
                          { label: "Cultura", actionType: "section", sectionName: "cultura" },
                          { label: "Geografia", actionType: "section", sectionName: "geografia" },
                          { label: "Inicio", actionType: "route", route: "/" },
                      ])}
                      />
                      
                      {/* Indicador de sección */}
                      <div style={{ paddingLeft: '60px', paddingTop: '20px', paddingBottom: '15px', backgroundColor: '#000000', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', fontFamily: 'sans-serif', fontWeight: '600', borderBottom: '3px solid #ff6b35', paddingBottom: '8px', paddingLeft: '0', paddingRight: '0', cursor: 'default', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Noticias
                      </button>
                      </div>
                      
                      {/* Artículo de Noticias */}
                      <Element is={NewsArticle}
                      imageUrl=""
                      title="Por qué la Amazonia no produce realmente el 20% del oxígeno del mundo"
                      content="El científico Michael Coe explicó que la Amazonia consume tanto oxígeno como produce, por lo que su contribución neta al oxígeno global es prácticamente cero. La selva amazónica es un ecosistema en equilibrio donde los árboles producen oxígeno durante el día mediante la fotosíntesis, pero también consumen oxígeno durante la noche para respirar."
                      likeCount={1000}
                      commentCount={0}
                      backgroundColor="#000000"
                      padding={60}
                      titleFontSize={48}
                      contentFontSize={18}
                      imageHeight={500}
                      />
                  </Element>
           )
         },
         {
           label: "Página de Tribus Completa",
           icon: "bi-people",
           element: (
              <Element is={BackgroundImageContainer} padding={0} background="#000000" canvas>
                  {/* Navbar */}
                  <Element is={Navbar} 
                  logoText="Akaru"
                  backgroundColor="#1a1a1a"
                  itemColor="#ffffff"
                  itemHoverColor="#ff6b35"
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
                  
                  {/* Hero Section */}
                  <Element is={HeroSection}
                  backgroundImage=""
                  overlayColor="rgba(0, 0, 0, 0.4)"
                  height={400}
                  minHeight={400}
                  padding={60}
                  >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                      <div style={{ width: '6px', height: '58px', backgroundColor: '#ff6b35', flexShrink: 0 }} />
                      <h1 style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold', margin: 0, fontFamily: 'sans-serif' }}>
                      Tribus Indigenas
                      </h1>
                  </div>
                  </Element>
                  
                  {/* Grid de Cards con Sidebar */}
                  <div style={{ backgroundColor: '#000000', padding: '80px', position: 'relative', minHeight: '100vh' }}>
                  <div style={{ display: 'flex', gap: '60px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
                      {/* Sidebar izquierdo con iconos de interacción */}
                      <div style={{ position: 'sticky', top: '100px', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', flexShrink: 0, width: '80px', paddingTop: '0' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '28px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Volver">
                          <i className="bi bi-arrow-left"></i>
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '28px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Me gusta">
                          <i className="bi bi-heart"></i>
                          </button>
                          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500', fontFamily: 'sans-serif' }}>1k</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '28px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Comentarios">
                          <i className="bi bi-chat-dots"></i>
                          </button>
                      </div>
                      </div>
                      {/* Grid de Cards */}
                      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', width: '100%' }}>
                      <Element is={TribesCard} imageUrl="" title="Ubicacion Geografica" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Organizacion social" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Idiomas y Comunicacion" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Musica y Danza" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Gastronomia" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Economía y Sustentabilidad" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Vestimenta y Pintura Corporal" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      <Element is={TribesCard} imageUrl="" title="Vivienda y Arquitectura" linkUrl="#" backgroundColor="#ffffff" titleColor="#000000" buttonColor="#000000" buttonTextColor="#000000" />
                      </div>
                  </div>
                  </div>
              </Element>
           )
         },
         { label: "Página de Fauna Completa", icon: "bi-tree", element: <Element is={FaunaPageTemplate} /> },
         { label: "Página de Flora", icon: "bi-tree-fill", element: <Element is={FloraPageTemplateV2} /> },
         { label: "Página de Agua Completa", icon: "bi-droplet-fill", element: <Element is={AguaPageTemplate} /> },
      ]
    },
    {
        title: "Plantillas Home",
        items: [
            {
                label: "Homepage Completa",
                icon: "bi-house-door-fill",
                element: (
                  <Element is={BackgroundImageContainer} padding={0} background="#ffffff" canvas>
                      {/* Navbar con valores exactos */}
                      <Element is={Navbar} 
                      logoText="Akaru"
                      backgroundColor="#1a1a1a"
                      itemColor="#ffffff"
                      itemHoverColor="#ff6b35"
                      navItems={JSON.stringify([
                          { label: "Foro", actionType: "section", sectionName: "foro" },
                          { label: "Tribus", actionType: "section", sectionName: "tribus" },
                          { label: "Fauna", actionType: "section", sectionName: "fauna" },
                          { label: "Flora", actionType: "section", sectionName: "flora" },
                          { label: "Usos", actionType: "section", sectionName: "usos" },
                          { label: "Agua", actionType: "section", sectionName: "agua" },
                          { label: "Cultura", actionType: "section", sectionName: "cultura" },
                          { label: "Geografia", actionType: "section", sectionName: "geografia" }
                      ])}
                      />
                      
                      {/* Hero Section con imagen de bosque */}
                      <Element is={HeroSection}
                      height={500}
                      minHeight={400}
                      overlayColor="rgba(0, 0, 0, 0.2)"
                      />
                      
                      {/* News Section - Noticias Recientes */}
                      <Element is={NewsSection}
                      title="Noticias Recientes"
                      titleColor="#ffffff"
                      titleFontSize={48}
                      accentColor="#ff6b35"
                      backgroundColor="#1a1a1a"
                      padding={60}
                      gap={24}
                      newsItems={JSON.stringify([
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
                      ])}
                      />
                      
                      {/* Category Grid - Conoce sobre */}
                      <Element is={CategoryGrid}
                      title="Conoce sobre"
                      titleColor="#ffffff"
                      titleFontSize={48}
                      accentColor="#ff6b35"
                      backgroundColor="#1a1a1a"
                      padding={60}
                      gap={16}
                      columns={4}
                      categories={JSON.stringify([
                          { id: 1, name: 'Tribus indigenas', image: '' },
                          { id: 2, name: 'Fauna', image: '' },
                          { id: 3, name: 'Flora', image: '' },
                          { id: 4, name: 'Usos sostenibles', image: '' },
                          { id: 5, name: 'Agua', image: '' },
                          { id: 6, name: 'Cultura', image: '' },
                          { id: 7, name: 'Geografia', image: '' },
                      ])}
                      />
                      
                      {/* Featured Photo */}
                      <Element is={FeaturedPhoto}
                      title="Fotografía Destacada"
                      titleColor="#ffffff"
                      titleFontSize={48}
                      accentColor="#ff6b35"
                      backgroundColor="#1a1a1a"
                      caption="La Densidad Infinita: 24 horas en el Parque Nacional Manú"
                      captionColor="#ffffff"
                      padding={60}
                      imageHeight={500}
                      />
                      
                      {/* Forum CTA */}
                      <Element is={ForumCTA}
                      title="Visita el foro"
                      titleColor="#ffffff"
                      titleFontSize={48}
                      accentColor="#ff6b35"
                      backgroundColor="#1a1a1a"
                      description="Un espacio diseñado para conectar, aprender y compartir experiencias. ¡Te estamos esperando!"
                      descriptionColor="#ffffff"
                      buttonText="Entrar ahora"
                      buttonColor="#ff6b35"
                      buttonTextColor="#ffffff"
                      buttonHoverColor="#e55a2b"
                      padding={60}
                      route="/forum"
                      />
                  </Element>
                )
            }
        ]
    },
    {
        title: "Secciones Predefinidas",
        items: [
            { label: "Hero", icon: "bi-image", element: <HeroSection /> },
            { label: "Noticias", icon: "bi-newspaper", element: <NewsSection /> },
            { label: "Categorías", icon: "bi-grid-3x3", element: <CategoryGrid /> },
            { label: "Foto Destacada", icon: "bi-camera", element: <FeaturedPhoto /> },
            { label: "CTA Foro", icon: "bi-chat-dots", element: <ForumCTA /> },
            { label: "Artículo de Noticias", icon: "bi-file-text", element: <NewsArticle /> },
        ]
    }
  ];

  return (

    <div className="d-flex h-100 bg-white border-end">
        {/* Barra lateral oscura estrecha (Iconos) */}
        <div className="d-flex flex-column align-items-center py-3 bg-dark" style={{ width: '50px', backgroundColor: '#1e1e1e', flexShrink: 0 }}>
            {/* Tab: Components */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'components' ? 'text-white' : 'text-secondary'}`}
                onClick={() => handleTabChange('components')}
                title="Componentes"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-grid-fill fs-5"></i>
            </div>
            
            {/* Tab: Templates */}
             <div 
                className={`mb-4 cursor-pointer ${activeTab === 'templates' ? 'text-white' : 'text-secondary'}`}
                onClick={() => handleTabChange('templates')}
                title="Plantillas"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-layout-text-window-reverse fs-5"></i>
            </div>

            {/* Tab: Pages */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'pages' ? 'text-white' : 'text-secondary'}`}
                onClick={() => handleTabChange('pages')}
                title="Páginas"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-file-earmark fs-5"></i>
            </div>

            {/* Tab: Layers */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'layers' ? 'text-white' : 'text-secondary'}`}
                onClick={() => handleTabChange('layers')}
                title="Capas"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-layers fs-5"></i>
            </div>

        </div>

        {/* Contenido del Panel (Ancho fijo o flexible?) usaremos fijo por ahora para reemplazar Palette */}
        <div className="h-100 bg-light" style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
            
            {activeTab === 'components' && (
                <div className="p-3 h-100 overflow-auto">
                    <div className="mb-3">
                        <input 
                            type="text" 
                            className="form-control form-control-sm border-0 shadow-sm" 
                            placeholder="Buscar componentes..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <h6 className="fw-bold fs-7 text-uppercase text-muted mb-3 small" style={{ letterSpacing: '0.5px' }}>Componentes</h6>
                    
                    <div className="row g-2 pb-5">
                       {componentsList
                         .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                         .map((item, index) => (
                           <ToolButton 
                               key={index}
                               refProp={(ref) => ref && item.create(ref)} 
                               icon={item.icon} 
                               label={item.label} 
                           />
                       ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="p-3 h-100 overflow-auto">
                    <div className="mb-3">
                        <input 
                          type="text" 
                          className="form-control form-control-sm border-0 shadow-sm" 
                          placeholder="Buscar plantillas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    
                    <div className="row g-2 pb-5">
                       {/* Mapeo de Plantillas por Grupos */}
                       {templatesGroups.map((group, gIndex) => {
                           const filteredItems = group.items.filter(item => 
                               item.label.toLowerCase().includes(searchTerm.toLowerCase())
                           );

                           if (filteredItems.length === 0) return null;

                           return (
                               <React.Fragment key={gIndex}>
                                   <div className="col-12 mt-1">
                                       <h6 className="fw-bold fs-7 text-uppercase text-muted mb-2 small" style={{ letterSpacing: '0.5px' }}>{group.title}</h6>
                                   </div>
                                   {filteredItems.map((item, iIndex) => (
                                       <ToolButton 
                                           key={iIndex}
                                           refProp={(ref) => ref && connectors.create(ref, item.element)} 
                                           icon={item.icon} 
                                           label={item.label} 
                                       />
                                   ))}
                               </React.Fragment>
                           );
                       })}
                    </div>
                </div>
            )}

            {activeTab === 'pages' && (
                <div className="h-100 overflow-hidden d-flex flex-column">
                    {/* Renderizamos Sidebar tal cual, asumiendo que se ajusta al contenedor */}
                    <Sidebar />
                </div>
            )}

            {activeTab === 'layers' && (
                <div className="p-3 h-100 overflow-auto">
                    <h6 className="fw-bold fs-7 text-uppercase text-muted mb-3 small" style={{ letterSpacing: '0.5px' }}>Capas</h6>
                    <div className="layers-container">
                        <Layers expandRootOnLoad={true} />
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
