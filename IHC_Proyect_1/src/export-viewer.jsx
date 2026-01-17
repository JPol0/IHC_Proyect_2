import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { HashRouter, Routes, Route, Navigate, useParams, useSearchParams, useLocation } from 'react-router-dom';

// Importa los mismos componentes que usas en el editor principal
import { Container } from './components/user/Container';
import { Button } from './components/user/Button';
import { Card, CardTop, CardBottom } from './components/user/Card';
import { Text } from './components/user/Text';
import { Image } from './components/user/Image';
import { BackgroundImageContainer } from './components/user/ImageContainer';
import { ChevronButton } from './components/user/ChevronButton';
import { IconButton } from './components/user/IconButton';
// Columns container ha sido retirado del proyecto.
import { FileDownload } from './components/user/FileDownload';
import { ForumButton } from './components/user/ForumButton';
import { Forum } from './components/user/Forum/Forum';
import { LikeButton } from './components/user/LikeButton';
import { Navbar } from './components/user/Navbar';
import { HeroSection } from './components/user/HeroSection';
import { NewsSection } from './components/user/NewsSection';
import { CategoryGrid } from './components/user/CategoryGrid';
import { FeaturedPhoto } from './components/user/FeaturedPhoto';
import { ForumCTA } from './components/user/ForumCTA';
import { HomepageSection } from './components/user/HomepageSection';
import { NewsArticle } from './components/user/NewsArticle';
import { NewsPageTemplate } from './components/user/NewsPageTemplate';
import { TribesPageTemplate } from './components/user/TribesPageTemplate';
import { FloraPageTemplate } from './components/user/FloraPageTemplate';
import { FloraPageTemplateV1 } from './components/user/FloraPageTemplateV1';
import { FloraPageTemplateV2 } from './components/user/FloraPageTemplateV2';
import { FaunaPageTemplate } from './components/user/FaunaPageTemplate';
import { FaunaPageTemplateV1 } from './components/user/FaunaPageTemplateV1';
import { FaunaPageTemplateV2 } from './components/user/FaunaPageTemplateV2';
import { AguaPageTemplate } from './components/user/AguaPageTemplate';
import { TribesCard } from './components/user/TribesCard';
import { FeatureCard } from './components/user/FeatureCard';
import { FeatureGrid } from './components/user/FeatureGrid';
import { Grid2 } from './components/user/Grid2';
import { Grid3 } from './components/user/Grid3';
import { Grid5 } from './components/user/Grid5';
import { GridCol } from './components/user/GridCol';
import { Rectangle } from './components/user/Rectangle';

// Estilos necesarios para que el sitio exportado luzca igual
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import './index.css';

const resolver = {
  Card,
  Button,
  Text,
  Image,
  Container,
  CardTop,
  CardBottom,
  BackgroundImageContainer,
  ChevronButton,
  IconButton,
  FileDownload,
  ForumButton,
  Forum,
  LikeButton,
  Navbar,
  HeroSection,
  NewsSection,
  CategoryGrid,
  FeaturedPhoto,
  ForumCTA,
  HomepageSection,
  NewsArticle,
  NewsPageTemplate,
  TribesPageTemplate,
  FloraPageTemplate,
  FloraPageTemplateV1,
  FloraPageTemplateV2,
  FaunaPageTemplate,
  FaunaPageTemplateV1,
  FaunaPageTemplateV2,
  AguaPageTemplate,
  TribesCard,
  FeatureCard,
  FeatureGrid,
  Grid2,
  Grid3,
  Grid5,
  GridCol,
  Rectangle,
};

// Nombres de componentes válidos
const VALID_COMPONENTS = new Set(Object.keys(resolver));
// Tags HTML comunes permitidos por seguridad
const VALID_HTML_TAGS = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'button', 'ul', 'li', 'ol', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside', 'blockquote', 'pre', 'code']);

// Dimensiones objetivo del lienzo, igual que en el editor
const TARGET_W = 1280;
const TARGET_H = 720;
// Color de fondo por defecto para la página exportada
const VIEWER_BG = '#ffffff';

// Prefetch util: extrae URLs de imágenes desde un objeto/JSON cualquiera
function collectImageUrls(obj, out = new Set()) {
  if (!obj || typeof obj !== 'object') return out;
  const visit = (v) => {
    if (!v) return;
    const t = typeof v;
    if (t === 'string') {
      const s = v.trim();
      const urlInCss = s.match(/url\((['"]?)([^)"']+)\1\)/i);
      if (urlInCss && urlInCss[2]) {
        const u = urlInCss[2];
        if (/^https?:\/\//i.test(u)) out.add(u);
        return;
      }
      if (/^https?:\/\//i.test(s) && /(\.(png|jpe?g|gif|webp|svg))(\?|#|$)/i.test(s)) {
        out.add(s);
      }
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (t === 'object') {
      for (const k in v) visit(v[k]);
    }
  };
  visit(obj);
  return out;
}

function prefetchImagesFromRoutes(routes) {
  try {
    const urls = new Set();
    for (const key of Object.keys(routes || {})) {
      const raw = routes[key];
      let parsed = raw;
      if (typeof raw === 'string') {
        try { parsed = JSON.parse(raw); } catch { parsed = null; }
      }
      if (parsed) collectImageUrls(parsed, urls);
    }
    urls.forEach((src) => {
      try { const img = new Image(); img.decoding = 'async'; img.src = src; } catch {}
    });
    console.log('[Export Viewer] Prefetched images:', urls.size);
  } catch (e) {
    console.warn('Prefetch images failed', e);
  }
}

/**
 * Normaliza el estado de Craft.js para ser robusto ante errores de deserialización.
 * Asegura que:
 * 1. Todos los nodos tengan data.type.resolvedName
 * 2. No haya propiedades 'type' en el nivel superior (solo en data.type)
 * 3. La estructura sea plana (nodes se mueven al root si están anidados)
 */
function normalizeCraftState(rawState) {
  try {
    // 1. Parsear
    let obj = typeof rawState === 'string' ? JSON.parse(rawState) : JSON.parse(JSON.stringify(rawState));
    
    // 2. Fallback si no es objeto
    if (!obj || typeof obj !== 'object') {
      console.warn('[normalize] Estado inválido, usando fallback vacío');
      return JSON.stringify({ 
        ROOT: { 
          data: { type: { resolvedName: 'BackgroundImageContainer' }, props: { padding: 0 } }, 
          nodes: [], linkedNodes: {}, isCanvas: true, displayName: 'ROOT' 
        } 
      });
    }

    // 3. Aplanar estructura anidada (si existe obj.nodes y NO es array)
    if (obj.nodes && typeof obj.nodes === 'object' && !Array.isArray(obj.nodes)) {
      console.log('[normalize] Aplanando estructura de nodos anidada...');
      const nestedNodes = obj.nodes;
      delete obj.nodes; // Eliminar el contenedor 'nodes'
      // Mover los hijos al nivel superior
      Object.keys(nestedNodes).forEach(k => {
        obj[k] = nestedNodes[k];
      });
    }

    // 4. Validar y corregir cada nodo
    const validKeys = new Set();
    
    // Función auxiliar para corregir un nodo
    const fixNode = (node, key) => {
       if (!node || typeof node !== 'object') return false;

       // --- CORRECCIÓN DE TYPE (CRÍTICO PARA DESERIALIZE) ---
       // deserialize() require 'type' en el nivel superior.
       
       if (!node.type) {
          // Si falta type, intentamos recuperarlo de data.type
          if (node.data && node.data.type) {
             if (typeof node.data.type === 'string') node.type = { resolvedName: node.data.type };
             else if (typeof node.data.type === 'object') node.type = { ...node.data.type };
          } else {
             // Si no hay nada, asignamos 'div' como fallback seguro
             node.type = { resolvedName: 'div' }; 
          }
       }

       // Asegurar formato { resolvedName: '...' }
       if (typeof node.type === 'string') node.type = { resolvedName: node.type };
       
       if (!node.type.resolvedName) {
           node.type.resolvedName = node.displayName || 'div';
       }

       // --- VALIDACIÓN CONTRA RESOLVER ---
       const rn = node.type.resolvedName;
       if (!VALID_COMPONENTS.has(rn) && !VALID_HTML_TAGS.has(rn.toLowerCase())) {
          console.warn(`[normalize] Componente '${rn}' no reconocido en nodo ${key}. Reemplazando por 'Container'.`);
          // Si el componente desconocido parece un contenedor, usamos Container, sino div
          // Por defecto usamos Container para no perder los hijos si los tiene
          node.type = { resolvedName: 'Container' };
          node.data = node.data || {};
          node.data.type = { resolvedName: 'Container' };
          node.displayName = 'Container (Fallback)';
       }

       // Sincronizar data para consistencia interna
       if (!node.data) node.data = {};
       node.data.type = node.type;

       // --- CORRECCIÓN DE PROPS ---
       if (!node.props) node.props = {};
       if (!node.data.props) node.data.props = node.props;

       // --- OTROS CAMPOS REQUERIDOS ---
       if (!node.custom) node.custom = {};
       // hidden debe ser boolean
       if (typeof node.hidden !== 'boolean') node.hidden = !!node.hidden;
       
       // --- CORRECCIÓN DE NODOS HIJOS ---
       if (!node.nodes) node.nodes = [];
       else if (!Array.isArray(node.nodes)) {
          // Si viene como objeto, convertir keys a array
          if (typeof node.nodes === 'object') node.nodes = Object.keys(node.nodes);
          else node.nodes = [];
       }
       
       if (!node.linkedNodes) node.linkedNodes = {};
       
       // ROOT específico
       if (key === 'ROOT') node.isCanvas = true;

       return true;
    };

    // Iterar sobre todas las keys del objeto plano
    Object.keys(obj).forEach(key => {
       if (fixNode(obj[key], key)) {
          validKeys.add(key);
       }
    });

    // 5. Asegurar ROOT existe
    if (!obj.ROOT) {
       console.warn('[normalize] ROOT faltante, creando default');
       obj.ROOT = {
         data: { type: { resolvedName: 'BackgroundImageContainer' }, props: { padding: 0 } },
         nodes: [], linkedNodes: {}, isCanvas: true, displayName: 'ROOT', hidden: false, custom: {}
       };
       validKeys.add('ROOT');
    }

    // 6. Limpiar referencias rotas (hijos que no existen)
    Object.keys(obj).forEach(key => {
       if (!validKeys.has(key)) return;
       const node = obj[key];
       
       // Filtrar nodes
       if (node.nodes && node.nodes.length > 0) {
          node.nodes = node.nodes.filter(id => validKeys.has(id));
       }
       
       // Filtrar linkedNodes
       if (node.linkedNodes) {
          const newLinked = {};
          Object.keys(node.linkedNodes).forEach(k => {
             if (validKeys.has(k)) newLinked[k] = node.linkedNodes[k];
          });
          node.linkedNodes = newLinked;
       }
    });

    return JSON.stringify(obj);

  } catch (e) {
    console.error('[normalize] Error fatal:', e);
    // Fallback de emergencia absoluto
    return JSON.stringify({ 
        ROOT: { 
            data: { type: { resolvedName: 'BackgroundImageContainer' }, props: {} }, 
            nodes: [], linkedNodes: {}, isCanvas: true, displayName: 'ROOT' 
        } 
    });
  }
}

function Loader() {
  const { actions } = useEditor();
  useEffect(() => {
    // Esperar un poco para asegurar montado
    const timer = setTimeout(() => {
        try {
            const raw = window.__CRAFT_PAGE_STATE__;
            if (!raw) {
                console.log('[Loader] No hay estado inicial global (__CRAFT_PAGE_STATE__)');
                return;
            }
            
            console.log('[Loader] Procesando estado...');
            const json = normalizeCraftState(raw);
            
            console.log('[Loader] Deserializando...');
            actions.deserialize(json);
            console.log('[Loader] Éxito.');

            // Feedback visual discreto de éxito
            const div = document.createElement('div');
            div.innerText = 'Carga Exitosa';
            div.style.cssText = 'position:fixed;bottom:0;right:0;background:rgba(0,128,0,0.8);color:white;padding:4px 8px;z-index:9999;font-size:10px;pointer-events:none;border-radius:4px 0 0 0;';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 3000);

        } catch (e) {
            console.error('[Loader] Error:', e);
            // Mostrar error en pantalla
            const div = document.createElement('div');
            div.innerHTML = `<h3 style="margin:0 0 10px 0">Error de Visualización</h3><pre style="white-space:pre-wrap;font-size:12px">${e.message}</pre>`;
            div.style.cssText = 'position:fixed;top:20px;left:20px;right:20px;background:white;color:#d32f2f;padding:20px;z-index:9999;border:1px solid #d32f2f;box-shadow:0 4px 6px rgba(0,0,0,0.1);border-radius:8px;max-height:80vh;overflow:auto;';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerText = 'Cerrar';
            closeBtn.style.cssText = 'margin-top:10px;padding:5px 10px;cursor:pointer;';
            closeBtn.onclick = () => div.remove();
            div.appendChild(closeBtn);
            
            document.body.appendChild(div);
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [actions]);
  return null;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Error rendering Viewer:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: '#b00020', fontFamily: 'system-ui' }}>
          <h3>Ocurrió un error al renderizar la página exportada</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ViewerPage({ mode }) {
  const { actions } = useEditor();
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const location = useLocation();
  const [animKey, setAnimKey] = useState(0);
  
  useEffect(() => {
    try {
      const routes = (typeof window !== 'undefined' && window.__CRAFT_ROUTES__) || null;
      if (!routes) return; // modo single-state seguirá usando Loader
      
      let key = null;
      if (mode === 'bySlug') {
        key = slug || '';
      } else if (mode === 'byName') {
        const name = sp.get('section') || '';
        const list = (window.__CRAFT_SECTIONS__ || []);
        const found = list.find(x => (x.name || '').toLowerCase() === name.toLowerCase());
        key = found ? found.slug : '';
      }
      
      if (!key) return;
      const raw = routes[key];
      if (!raw) return;
      
      const json = normalizeCraftState(raw);
      actions.deserialize(json);
      
    } catch (e) {
      console.error('No se pudo deserializar la ruta actual', e);
    }
  }, [actions, mode, slug, sp]);
  
  // Reinicia animación en cada cambio de ruta
  useEffect(() => { setAnimKey((k) => k + 1); }, [location.pathname, location.search]);
  
  return (
    <div key={animKey} className="route-wrapper fadeIn" style={{ width: '100%', maxWidth: 'none', margin: 0, minHeight: '100vh', background: VIEWER_BG }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
        <div style={{ width: TARGET_W, minHeight: TARGET_H, position: 'relative', overflow: 'visible' }}>
          <Frame>
            <Element is={BackgroundImageContainer} padding={10} targetWidth={TARGET_W} targetHeight={TARGET_H} canvas />
          </Frame>
        </div>
      </div>
    </div>
  );
}

function ViewerApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasRoutes = typeof window !== 'undefined' && !!window.__CRAFT_ROUTES__;
  const startRoute = (typeof window !== 'undefined' && window.__CRAFT_START_ROUTE__) || '/';
  
  useEffect(() => {
    if (hasRoutes && typeof window !== 'undefined' && window.__CRAFT_ROUTES__) {
      prefetchImagesFromRoutes(window.__CRAFT_ROUTES__);
    }
  }, [hasRoutes]);
  
  return (
    <ErrorBoundary>
      <Editor enabled={false} resolver={resolver}>
        {!hasRoutes && <Loader />}
        {/* SPA con rutas: /, /:slug y /editor?section=NAME */}
        {hasRoutes ? (
          <Routes>
            <Route path="/" element={<Navigate to={startRoute || '/'} replace />} />
            <Route path="/editor" element={<ViewerPage mode="byName" />} />
            <Route path=":slug" element={<ViewerPage mode="bySlug" />} />
            <Route path="*" element={<div style={{padding:16}}>No encontrada</div>} />
          </Routes>
        ) : (
          <div className="route-wrapper fadeIn" style={{ width: '100%', maxWidth: 'none', margin: 0, minHeight: '100vh', background: VIEWER_BG }}>
            {!mounted && <div style={{ padding: 16 }}>Cargando…</div>}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <div style={{ width: TARGET_W, minHeight: TARGET_H, position: 'relative', overflow: 'visible' }}>
                <Frame>
                  <Element is={BackgroundImageContainer} padding={10} targetWidth={TARGET_W} targetHeight={TARGET_H} canvas />
                </Frame>
              </div>
            </div>
          </div>
        )}
      </Editor>
    </ErrorBoundary>
  );
}

// Auto-montaje al cargar el bundle
const mount = () => {
  try {
    const el = document.getElementById('root');
    if (!el) {
      document.body.innerHTML = '<h1 style="color:red; padding: 20px;">ERROR CRÍTICO: No se encontró el elemento #root en el HTML.</h1>';
      console.error('No se encontró #root para montar ViewerApp');
      return;
    }
    
    // Check if state is available
    if (!window.__CRAFT_PAGE_STATE__) {
      console.warn('Advertencia: window.__CRAFT_PAGE_STATE__ es null o undefined al montar.');
    }

    try {
      // Fija color de fondo global del documento exportado
      document.body.style.margin = '0';
      document.body.style.backgroundColor = VIEWER_BG;
    } catch {}

    const root = createRoot(el);
    
    root.render(
      <HashRouter>
        <ViewerApp />
      </HashRouter>
    );

    console.log('[Export Viewer] Aplicación montada correctamente en #root');
  } catch (e) {
    document.body.innerHTML = `<div style="color:red; padding:20px; background:white;">
      <h1>ERROR AL MONTAR APLICACIÓN</h1>
      <pre>${e.message}\n${e.stack}</pre>
    </div>`;
    console.error('Excepción en mount():', e);
  }
};

mount();
