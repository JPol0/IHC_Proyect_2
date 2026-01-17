import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { HashRouter, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';

// ============================================================================
// COMPONENTES - Todos los necesarios para deserializar correctamente
// ============================================================================
import { Container } from './components/user/Container';
import { Button } from './components/user/Button';
import { Card, CardTop, CardBottom } from './components/user/Card';
import { Text } from './components/user/Text';
import { Image } from './components/user/Image';
import { BackgroundImageContainer } from './components/user/ImageContainer';
import { ChevronButton } from './components/user/ChevronButton';
import { IconButton } from './components/user/IconButton';
import { FileDownload } from './components/user/FileDownload';
import { Rectangle } from './components/user/Rectangle';
import { Grid2 } from './components/user/Grid2';
import { Grid3 } from './components/user/Grid3';
import { Grid5 } from './components/user/Grid5';
import { GridCol } from './components/user/GridCol';
import { Navbar } from './components/user/Navbar';
import { HeroSection } from './components/user/HeroSection';
import { TribesPageTemplate } from './components/user/TribesPageTemplate';
import { FloraPageTemplate } from './components/user/FloraPageTemplate';
import { FaunaPageTemplate } from './components/user/FaunaPageTemplate';
import { TribesCard } from './components/user/TribesCard';
import { FeatureCard } from './components/user/FeatureCard';
import { FeatureGrid } from './components/user/FeatureGrid';
// Nuevos componentes faltantes
import { ForumButton } from './components/user/ForumButton';
import { Forum } from './components/user/Forum/Forum';
import { LikeButton } from './components/user/LikeButton';
import { HeroBanner } from './components/user/HeroBanner';
import { NewsSection } from './components/user/NewsSection';
import { CategoryGrid } from './components/user/CategoryGrid';
import { FeaturedPhoto } from './components/user/FeaturedPhoto';
import { ForumCTA } from './components/user/ForumCTA';
import { HomepageSection } from './components/user/HomepageSection';
import { NewsArticle } from './components/user/NewsArticle';
import { NewsPageTemplate } from './components/user/NewsPageTemplate';
import { FloraPageTemplateV1 } from './components/user/FloraPageTemplateV1';
import { FloraPageTemplateV2 } from './components/user/FloraPageTemplateV2';
import { AguaPageTemplate } from './components/user/AguaPageTemplate';
import { BackButton } from './components/user/BackButton';
import { CommentButton } from './components/user/CommentButton';


// Estilos - bootstrap base (iconos se cargan desde CDN en el HTML exportado)
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Resolver con todos los componentes
const resolver = {
  Container, Button, Text, Image, Card, CardTop, CardBottom,
  BackgroundImageContainer, ChevronButton, IconButton, FileDownload, Rectangle,
  Grid2, Grid3, Grid5, GridCol,
  Navbar, HeroSection, TribesPageTemplate, FloraPageTemplate, FaunaPageTemplate,
  TribesCard, FeatureCard, FeatureGrid,
  // Agregados:
  ForumButton, Forum, LikeButton, HeroBanner, NewsSection, CategoryGrid,
  FeaturedPhoto, ForumCTA, HomepageSection, NewsArticle, NewsPageTemplate,
  FloraPageTemplateV1, FloraPageTemplateV2, AguaPageTemplate,
  BackButton, CommentButton
};

// Dimensiones del lienzo
const TARGET_W = 1280;
const TARGET_H = 720;
const VIEWER_BG = '#ffffff';

// Normaliza estado - solo valida JSON
function normalizeCraftState(rawState) {
  if (typeof rawState === 'string') return rawState;
  return JSON.stringify(rawState);
}

function Loader() {
  const { actions } = useEditor();
  useEffect(() => {
    const raw = window.__CRAFT_PAGE_STATE__;
    if (!raw) return;
    try {
      actions.deserialize(normalizeCraftState(raw));
    } catch (e) {
      console.error('Deserialize error:', e);
    }
  }, [actions]);
  return null;
}

function ViewerPage({ mode }) {
  const { actions } = useEditor();
  const { slug } = useParams();
  const [sp] = useSearchParams();
  
  // Determinar la clave de la sección a cargar
  let sectionKey = null;
  if (typeof window !== 'undefined') {
    if (mode === 'bySlug') {
      sectionKey = slug;
    } else if (mode === 'byName') {
      const name = sp.get('section') || '';
      const found = (window.__CRAFT_SECTIONS__ || []).find(x => x.name?.toLowerCase() === name.toLowerCase());
      sectionKey = found?.slug;
    }
  }
  
  useEffect(() => {
    const routes = window.__CRAFT_ROUTES__;
    if (!routes || !sectionKey) return;
    
    if (routes[sectionKey]) {
      try {
        // Deserializar el estado correspondiente a esta sección
        actions.deserialize(normalizeCraftState(routes[sectionKey]));
      } catch (e) {
        console.error('Error deserializing route:', sectionKey, e);
      }
    }
  }, [actions, sectionKey]);
  
  // Usamos sectionKey como key del div contenedor para forzar el remount
  // del componente (y del Frame) cuando cambia la sección.
  return (
    <div key={sectionKey} style={{ width: '100%', minHeight: '100vh', background: VIEWER_BG }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
        <div style={{ width: TARGET_W, minHeight: TARGET_H, position: 'relative' }}>
          <Frame>
            <Element is={BackgroundImageContainer} padding={10} targetWidth={TARGET_W} targetHeight={TARGET_H} canvas />
          </Frame>
        </div>
      </div>
    </div>
  );
}

function ViewerApp() {
  const hasRoutes = !!window.__CRAFT_ROUTES__;
  const startRoute = window.__CRAFT_START_ROUTE__ || '/';
  
  return (
    <Editor enabled={false} resolver={resolver}>
      {!hasRoutes && <Loader />}
      {hasRoutes ? (
        <Routes>
          <Route path="/" element={<Navigate to={startRoute} replace />} />
          <Route path="/editor" element={<ViewerPage mode="byName" />} />
          <Route path=":slug" element={<ViewerPage mode="bySlug" />} />
        </Routes>
      ) : (
        <div style={{ width: '100%', minHeight: '100vh', background: VIEWER_BG }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <div style={{ width: TARGET_W, minHeight: TARGET_H, position: 'relative' }}>
              <Frame>
                <Element is={BackgroundImageContainer} padding={10} targetWidth={TARGET_W} targetHeight={TARGET_H} canvas />
              </Frame>
            </div>
          </div>
        </div>
      )}
    </Editor>
  );
}

// Auto-montaje
const el = document.getElementById('root');
if (el) {
  document.body.style.margin = '0';
  createRoot(el).render(<HashRouter><ViewerApp /></HashRouter>);
}
