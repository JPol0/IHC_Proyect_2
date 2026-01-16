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
import { AguaPageTemplate } from './components/user/AguaPageTemplate';
import { TribesCard } from './components/user/TribesCard';

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
  AguaPageTemplate,
  TribesCard,
};

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
      // background: url("...")
      const urlInCss = s.match(/url\((['\"]?)([^)\"']+)\1\)/i);
      if (urlInCss && urlInCss[2]) {
        const u = urlInCss[2];
        if (/^https?:\/\//i.test(u)) out.add(u);
        return;
      }
      // direct URLs
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
    // eslint-disable-next-line no-console
    console.log('[Export Viewer] Prefetched images:', urls.size);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Prefetch images failed', e);
  }
}

function normalizeCraftState(rawState) {
  try {
    const TARGET = { w: TARGET_W, h: TARGET_H };
    // Parsear el estado si es string, o clonarlo si ya es objeto
    const obj = typeof rawState === 'string' ? JSON.parse(rawState) : JSON.parse(JSON.stringify(rawState));
    
    if (!obj || typeof obj !== 'object') {
      throw new Error('Estado no es un objeto válido');
    }

    // IMPORTANTE: En Craft.js, query.serialize() devuelve un objeto donde:
    // - ROOT está en obj.ROOT
    // - Los demás nodos están directamente en obj (no en obj.nodes)
    // Necesitamos extraer los nodos del objeto raíz y ponerlos en obj.nodes
    
    // Asegurar que nodes exista
    if (!obj.nodes) {
      obj.nodes = {};
    }
    
    // Extraer nodos del objeto raíz (todos excepto ROOT y nodes)
    const nodeIdsFromRoot = [];
    Object.keys(obj).forEach(key => {
      if (key !== 'ROOT' && key !== 'nodes' && obj[key] && typeof obj[key] === 'object') {
        // Este es un nodo, moverlo a obj.nodes
        obj.nodes[key] = obj[key];
        nodeIdsFromRoot.push(key);
      }
    });
    
    if (nodeIdsFromRoot.length > 0) {
      console.log(`[normalizeCraftState] ${nodeIdsFromRoot.length} nodos encontrados en el objeto raíz, movidos a obj.nodes`);
      // Eliminar los nodos del objeto raíz ahora que están en obj.nodes
      nodeIdsFromRoot.forEach(nodeId => {
        delete obj[nodeId];
      });
    }

    // Logging inicial
    const initialNodeCount = Object.keys(obj.nodes || {}).length;
    console.log(`[normalizeCraftState] Estado inicial: ${initialNodeCount} nodos, ROOT:`, !!obj.ROOT);
    
    // Validar y limpiar la estructura de nodos - VERSIÓN EXHAUSTIVA
    const validateAndFixNode = (node, nodeId) => {
      if (!node || typeof node !== 'object') {
        console.error(`[normalizeCraftState] Nodo ${nodeId} no es un objeto válido`);
        return false;
      }
      
      // ESTRUCTURA MÍNIMA REQUERIDA POR CRAFT.JS:
      // 1. node.data (obligatorio)
      if (!node.data) {
        node.data = {};
      }
      
      // 2. node.data.type (obligatorio)
      if (!node.data.type) {
        // Intentar obtener el tipo de otras propiedades
        if (node.type) {
          if (typeof node.type === 'string') {
            node.data.type = { resolvedName: node.type };
          } else if (typeof node.type === 'object' && node.type.resolvedName) {
            node.data.type = { resolvedName: node.type.resolvedName };
          } else if (typeof node.type === 'object' && node.type.name) {
            node.data.type = { resolvedName: node.type.name };
          } else {
            node.data.type = { resolvedName: 'Unknown' };
          }
        } else {
          console.error(`[normalizeCraftState] Nodo ${nodeId} no tiene tipo, usando Unknown`);
          node.data.type = { resolvedName: 'Unknown' };
        }
      }
      
      // 3. node.data.type.resolvedName (OBLIGATORIO - esto es lo que causa "Invariant failed")
      if (!node.data.type || typeof node.data.type !== 'object') {
        node.data.type = { resolvedName: 'Unknown' };
      }
      if (!node.data.type.resolvedName || typeof node.data.type.resolvedName !== 'string') {
        if (node.data.type.name) {
          node.data.type.resolvedName = node.data.type.name;
        } else if (typeof node.data.type === 'string') {
          node.data.type = { resolvedName: node.data.type };
        } else {
          node.data.type.resolvedName = 'Unknown';
        }
      }
      
      // CRÍTICO: Eliminar 'type' del nivel superior si existe - Craft.js solo espera data.type
      // Tener 'type' en ambos lugares causa "Invariant failed"
      if (node.type && node.data && node.data.type) {
        delete node.type;
      }
      
      // 4. node.data.props (obligatorio)
      if (!node.data.props || typeof node.data.props !== 'object') {
        node.data.props = {};
      }
      
      // 5. node.custom (obligatorio)
      if (!node.custom || typeof node.custom !== 'object') {
        node.custom = {};
      }
      
      // 6. node.hidden (obligatorio, debe ser boolean)
      if (typeof node.hidden !== 'boolean') {
        node.hidden = false;
      }
      
      // 7. node.linkedNodes (obligatorio)
      if (!node.linkedNodes || typeof node.linkedNodes !== 'object') {
        node.linkedNodes = {};
      }
      
      // 8. node.displayName (recomendado)
      if (!node.displayName && node.data.type && node.data.type.resolvedName) {
        node.displayName = node.data.type.resolvedName;
      }
      
      // 9. node.nodes debe ser array si existe
      if (node.nodes !== undefined && node.nodes !== null) {
        if (!Array.isArray(node.nodes)) {
          if (typeof node.nodes === 'object') {
            node.nodes = Object.keys(node.nodes);
          } else {
            node.nodes = [];
          }
        }
      }
      
      // Normalizar targetWidth y targetHeight para BackgroundImageContainer
      const resolved = node?.data?.type?.resolvedName || '';
      if (resolved === 'BackgroundImageContainer') {
        const p = node.data.props;
        if (!Number.isFinite(Number(p.targetHeight)) || Number(p.targetHeight) <= 0) {
          p.targetHeight = TARGET.h;
        }
        if (!Number.isFinite(Number(p.targetWidth)) || Number(p.targetWidth) <= 0) {
          p.targetWidth = TARGET.w;
        }
      }
      
      // Validar nodos hijos recursivamente (solo si nodes es array)
      if (Array.isArray(node.nodes)) {
        node.nodes.forEach(childId => {
          if (obj.nodes && obj.nodes[childId]) {
            validateAndFixNode(obj.nodes[childId], childId);
          }
        });
      }
      
      return true;
    };
    
    // Asegurar propiedades requeridas en todos los nodos
    const ensureRequiredProperties = (node, isRoot = false) => {
      if (!node.custom) node.custom = {};
      if (node.hidden === undefined) node.hidden = false;
      if (!node.linkedNodes) node.linkedNodes = {};
      if (node.isCanvas === undefined) {
        node.isCanvas = isRoot;
      }
    };

    // Procesar todos los nodos en el árbol - VALIDACIÓN EXHAUSTIVA
    if (obj.nodes && typeof obj.nodes === 'object') {
      const nodeIds = Object.keys(obj.nodes);
      let validCount = 0;
      let invalidCount = 0;
      
      nodeIds.forEach(nodeId => {
        const node = obj.nodes[nodeId];
        if (!node || typeof node !== 'object') {
          console.error(`[normalizeCraftState] Nodo ${nodeId} no es un objeto válido`);
          invalidCount++;
          return;
        }
        
        // Validar y corregir el nodo
        try {
          const wasValid = validateAndFixNode(node, nodeId);
          if (!wasValid) {
            console.error(`[normalizeCraftState] Nodo ${nodeId} falló validación`);
            invalidCount++;
            return;
          }
          
          // Verificación final: asegurar que tiene resolvedName
          if (!node.data || !node.data.type || !node.data.type.resolvedName) {
            console.error(`[normalizeCraftState] Nodo ${nodeId} NO tiene data.type.resolvedName después de validación!`);
            console.error(`[normalizeCraftState] Estructura del nodo:`, JSON.stringify(node, null, 2).substring(0, 500));
            // Forzar resolvedName
            if (!node.data) node.data = {};
            if (!node.data.type) node.data.type = {};
            node.data.type.resolvedName = node.data.type.resolvedName || 'Unknown';
          }
          
          // Asegurar propiedades requeridas
          ensureRequiredProperties(node, false);
          validCount++;
        } catch (e) {
          console.error(`[normalizeCraftState] Error validando nodo ${nodeId}:`, e);
          invalidCount++;
        }
      });
      
      console.log(`[normalizeCraftState] Procesados: ${validCount} válidos, ${invalidCount} inválidos`);
      
      if (invalidCount > 0) {
        console.warn(`[normalizeCraftState] ADVERTENCIA: ${invalidCount} nodos tienen problemas`);
      }
    }
    
    // Procesar ROOT si existe - VALIDACIÓN EXHAUSTIVA
    if (obj.ROOT) {
      try {
        const rootValid = validateAndFixNode(obj.ROOT, 'ROOT');
        if (!rootValid) {
          console.error('[normalizeCraftState] ROOT falló validación, recreando');
          obj.ROOT = {
            type: { resolvedName: 'BackgroundImageContainer' },
            isCanvas: true,
            props: { padding: 0, backgroundColor: '#ffffff' },
            displayName: 'BackgroundImageContainer',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
            data: {
              type: { resolvedName: 'BackgroundImageContainer' },
              props: { padding: 0, backgroundColor: '#ffffff' }
            }
          };
        } else {
          // Verificación final de ROOT
          if (!obj.ROOT.data || !obj.ROOT.data.type || !obj.ROOT.data.type.resolvedName) {
            console.error('[normalizeCraftState] ROOT no tiene data.type.resolvedName después de validación!');
            obj.ROOT.data = obj.ROOT.data || {};
            obj.ROOT.data.type = obj.ROOT.data.type || {};
            obj.ROOT.data.type.resolvedName = obj.ROOT.data.type.resolvedName || 'BackgroundImageContainer';
          }
          ensureRequiredProperties(obj.ROOT, true);
          obj.ROOT.isCanvas = true;
        }
      } catch (e) {
        console.error('[normalizeCraftState] Error validando ROOT:', e);
        // Crear ROOT válido
        obj.ROOT = {
          type: { resolvedName: 'BackgroundImageContainer' },
          isCanvas: true,
          props: { padding: 0, backgroundColor: '#ffffff' },
          displayName: 'BackgroundImageContainer',
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
          data: {
            type: { resolvedName: 'BackgroundImageContainer' },
            props: { padding: 0, backgroundColor: '#ffffff' }
          }
        };
      }
    } else {
      // Si no hay ROOT, crear uno
      console.warn('[normalizeCraftState] No hay ROOT, creando uno nuevo');
      obj.ROOT = {
        type: { resolvedName: 'BackgroundImageContainer' },
        isCanvas: true,
        props: { padding: 0, backgroundColor: '#ffffff' },
        displayName: 'BackgroundImageContainer',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        data: {
          type: { resolvedName: 'BackgroundImageContainer' },
          props: { padding: 0, backgroundColor: '#ffffff' }
        }
      };
    }
    
    // Verificación final: ROOT debe tener resolvedName
    if (!obj.ROOT.data?.type?.resolvedName) {
      console.error('[normalizeCraftState] ROOT no tiene resolvedName después de todo el procesamiento!');
      obj.ROOT.data = obj.ROOT.data || {};
      obj.ROOT.data.type = obj.ROOT.data.type || {};
      obj.ROOT.data.type.resolvedName = 'BackgroundImageContainer';
    }

    // Limpiar referencias rotas: asegurar que todos los nodos referenciados existan
    const validNodeIds = new Set(Object.keys(obj.nodes || {}));
    validNodeIds.add('ROOT');
    
    const finalNodeCount = validNodeIds.size - 1; // -1 porque ROOT no cuenta
    console.log(`[normalizeCraftState] Nodos finales: ${finalNodeCount}`);

    // Limpiar ROOT.nodes
    if (obj.ROOT && Array.isArray(obj.ROOT.nodes)) {
      const beforeCount = obj.ROOT.nodes.length;
      obj.ROOT.nodes = obj.ROOT.nodes.filter(id => validNodeIds.has(id));
      const afterCount = obj.ROOT.nodes.length;
      if (beforeCount !== afterCount) {
        console.warn(`[normalizeCraftState] ROOT.nodes limpiado: ${beforeCount} -> ${afterCount}`);
      }
    }

    // Limpiar referencias en todos los nodos
    Object.keys(obj.nodes || {}).forEach(nodeId => {
      const node = obj.nodes[nodeId];
      if (!node || typeof node !== 'object') return;
      
      // Limpiar nodes array
      if (Array.isArray(node.nodes)) {
        const beforeCount = node.nodes.length;
        node.nodes = node.nodes.filter(id => validNodeIds.has(id));
        const afterCount = node.nodes.length;
        if (beforeCount !== afterCount) {
          console.warn(`[normalizeCraftState] Nodo ${nodeId}.nodes limpiado: ${beforeCount} -> ${afterCount}`);
        }
      }
      
      // Limpiar linkedNodes
      if (node.linkedNodes && typeof node.linkedNodes === 'object') {
        const cleanedLinkedNodes = {};
        Object.keys(node.linkedNodes).forEach(key => {
          if (validNodeIds.has(key)) {
            cleanedLinkedNodes[key] = node.linkedNodes[key];
          }
        });
        node.linkedNodes = cleanedLinkedNodes;
      }
    });
    
    // VERIFICACIÓN FINAL EXHAUSTIVA: Asegurar que TODOS los nodos tienen resolvedName
    if (obj.nodes && typeof obj.nodes === 'object') {
      const nodeIds = Object.keys(obj.nodes);
      let nodesWithoutResolvedName = [];
      nodeIds.forEach(nodeId => {
        const node = obj.nodes[nodeId];
        if (!node?.data?.type?.resolvedName) {
          nodesWithoutResolvedName.push(nodeId);
          console.error(`[normalizeCraftState] CRÍTICO: Nodo ${nodeId} NO tiene resolvedName!`);
          // Forzar resolvedName
          if (!node.data) node.data = {};
          if (!node.data.type) node.data.type = {};
          node.data.type.resolvedName = 'Unknown';
        }
      });
      if (nodesWithoutResolvedName.length > 0) {
        console.error(`[normalizeCraftState] ERROR CRÍTICO: ${nodesWithoutResolvedName.length} nodos sin resolvedName:`, nodesWithoutResolvedName);
      }
    }
    
    // Verificar ROOT también
    if (obj.ROOT && !obj.ROOT.data?.type?.resolvedName) {
      console.error('[normalizeCraftState] ERROR CRÍTICO: ROOT NO tiene resolvedName!');
      obj.ROOT.data = obj.ROOT.data || {};
      obj.ROOT.data.type = obj.ROOT.data.type || {};
      obj.ROOT.data.type.resolvedName = 'BackgroundImageContainer';
    }
    
    const result = JSON.stringify(obj);
    console.log(`[normalizeCraftState] Estado normalizado: ${result.length} caracteres`);
    return result;
  } catch (e) {
    console.error('Error normalizando estado:', e);
    // En caso de cualquier forma desconocida, devolvemos el original sin tocar
    return typeof rawState === 'string' ? rawState : JSON.stringify(rawState);
  }
}

function Loader() {
  const { actions } = useEditor();
  useEffect(() => {
    // Esperar un poco para asegurar que todo esté listo
    const timer = setTimeout(() => {
    try {
      const raw = window.__CRAFT_PAGE_STATE__;
      // eslint-disable-next-line no-console
      console.log('[Export Viewer] Estado recibido:', typeof raw, raw ? (typeof raw === 'string' ? raw.length + ' chars' : 'object') : 'null');
        
        if (!raw) {
          console.warn('[Export Viewer] No se encontró __CRAFT_PAGE_STATE__');
          return;
        }
        
        // Si el estado es un string, parsearlo primero
        let parsedRaw = raw;
        if (typeof raw === 'string') {
          try {
            parsedRaw = JSON.parse(raw);
          } catch (e) {
            console.error('[Export Viewer] Error al parsear el estado como string:', e);
            return;
          }
        }
        
        // Asegurarse de que parsedRaw es un objeto
        if (!parsedRaw || typeof parsedRaw !== 'object') {
          console.error('[Export Viewer] El estado parseado no es un objeto válido');
          return;
        }
        
        // Normalizar el estado - esto debe manejar todos los casos edge
        let normalizedJson;
        try {
          normalizedJson = normalizeCraftState(parsedRaw);
        } catch (e) {
          console.error('[Export Viewer] Error normalizando estado:', e);
          // Intentar usar el estado original si la normalización falla
          normalizedJson = JSON.stringify(parsedRaw);
        }
        
        if (!normalizedJson || normalizedJson === 'null' || normalizedJson === '{}') {
          console.warn('[Export Viewer] Estado normalizado está vacío');
          return;
        }
        
        // Validar que el JSON sea válido antes de deserializar
        let parsedJson;
        try {
          parsedJson = JSON.parse(normalizedJson);
          // eslint-disable-next-line no-console
          console.log('[Export Viewer] Estado normalizado válido, deserializando...', Object.keys(parsedJson.nodes || {}).length, 'nodos');
        } catch (e) {
          console.error('[Export Viewer] Error al parsear el estado normalizado:', e);
          return;
        }
        
        // VALIDACIÓN FINAL EXHAUSTIVA ANTES DE DESERIALIZAR
        const validateBeforeDeserialize = (state) => {
          const issues = [];
          const validNodeIds = new Set(['ROOT']);
          
          // Verificar ROOT
          if (!state.ROOT) {
            issues.push('ROOT no existe');
            state.ROOT = {
              isCanvas: true,
              props: { padding: 0, backgroundColor: '#ffffff' },
              displayName: 'BackgroundImageContainer',
              custom: {},
              hidden: false,
              nodes: [],
              linkedNodes: {},
              data: {
                type: { resolvedName: 'BackgroundImageContainer' },
                props: { padding: 0, backgroundColor: '#ffffff' }
              }
            };
          } else {
            // CRÍTICO: Eliminar 'type' del nivel superior en ROOT
            if (state.ROOT.type) {
              delete state.ROOT.type;
            }
            if (!state.ROOT.data || typeof state.ROOT.data !== 'object') {
              state.ROOT.data = {};
            }
            if (!state.ROOT.data.type || typeof state.ROOT.data.type !== 'object') {
              state.ROOT.data.type = {};
            }
            if (!state.ROOT.data.type.resolvedName || typeof state.ROOT.data.type.resolvedName !== 'string') {
              issues.push('ROOT no tiene data.type.resolvedName');
              state.ROOT.data.type.resolvedName = 'BackgroundImageContainer';
            }
            if (!state.ROOT.data.props || typeof state.ROOT.data.props !== 'object') {
              state.ROOT.data.props = {};
            }
            if (!state.ROOT.custom || typeof state.ROOT.custom !== 'object') {
              state.ROOT.custom = {};
            }
            if (typeof state.ROOT.hidden !== 'boolean') {
              state.ROOT.hidden = false;
            }
            if (!state.ROOT.linkedNodes || typeof state.ROOT.linkedNodes !== 'object') {
              state.ROOT.linkedNodes = {};
            }
            if (!Array.isArray(state.ROOT.nodes)) {
              state.ROOT.nodes = state.ROOT.nodes ? Object.keys(state.ROOT.nodes) : [];
            }
            validNodeIds.add('ROOT');
          }
          
          // Verificar todos los nodos
          if (state.nodes && typeof state.nodes === 'object') {
            Object.keys(state.nodes).forEach(nodeId => {
              validNodeIds.add(nodeId);
              const node = state.nodes[nodeId];
              if (!node || typeof node !== 'object') {
                issues.push(`Nodo ${nodeId} no es un objeto válido`);
                delete state.nodes[nodeId];
                return;
              }
              
              // Verificar estructura crítica
              if (!node.data || typeof node.data !== 'object') {
                issues.push(`Nodo ${nodeId} no tiene data`);
                node.data = {};
              }
              
              if (!node.data.type || typeof node.data.type !== 'object') {
                issues.push(`Nodo ${nodeId} no tiene data.type`);
                node.data.type = {};
              }
              
              if (!node.data.type.resolvedName || typeof node.data.type.resolvedName !== 'string') {
                issues.push(`Nodo ${nodeId} no tiene data.type.resolvedName`);
                node.data.type.resolvedName = 'Unknown';
              }
              
              // CRÍTICO: Eliminar 'type' del nivel superior - causa "Invariant failed"
              if (node.type) {
                delete node.type;
              }
        
        // CRÍTICO: Eliminar 'type' del nivel superior - causa "Invariant failed"
        if (node.type) {
          delete node.type;
        }
              
              if (!node.data.props || typeof node.data.props !== 'object') {
                node.data.props = {};
              }
              
              if (!node.custom || typeof node.custom !== 'object') {
                node.custom = {};
              }
              
              if (typeof node.hidden !== 'boolean') {
                node.hidden = false;
              }
              
              if (!node.linkedNodes || typeof node.linkedNodes !== 'object') {
                node.linkedNodes = {};
              }
              
              // Asegurar que nodes sea array
              if (node.nodes !== undefined && node.nodes !== null) {
                if (!Array.isArray(node.nodes)) {
                  if (typeof node.nodes === 'object') {
                    node.nodes = Object.keys(node.nodes);
                  } else {
                    node.nodes = [];
                  }
                }
                // Limpiar referencias rotas
                node.nodes = node.nodes.filter(id => validNodeIds.has(id));
              }
              
              // Limpiar linkedNodes rotos
              if (node.linkedNodes && typeof node.linkedNodes === 'object') {
                const cleaned = {};
                Object.keys(node.linkedNodes).forEach(key => {
                  if (validNodeIds.has(key)) {
                    cleaned[key] = node.linkedNodes[key];
                  }
                });
                node.linkedNodes = cleaned;
              }
            });
          }
          
          // Limpiar ROOT.nodes también
          if (state.ROOT && Array.isArray(state.ROOT.nodes)) {
            state.ROOT.nodes = state.ROOT.nodes.filter(id => validNodeIds.has(id));
          }
          
          if (issues.length > 0) {
            console.warn('[Export Viewer] Problemas encontrados y corregidos:', issues);
          } else {
            console.log('[Export Viewer] Todos los nodos validados correctamente');
          }
        };
        
        // Aplicar validación final
        validateBeforeDeserialize(parsedJson);
        
        // VERIFICACIÓN ADICIONAL: Asegurar que NO hay 'type' en el nivel superior
        const removeTopLevelType = (obj) => {
          if (obj.ROOT && obj.ROOT.type) {
            console.warn('[Export Viewer] Eliminando type del nivel superior en ROOT');
            delete obj.ROOT.type;
          }
          if (obj.nodes && typeof obj.nodes === 'object') {
            Object.keys(obj.nodes).forEach(nodeId => {
              const node = obj.nodes[nodeId];
              if (node && node.type) {
                console.warn(`[Export Viewer] Eliminando type del nivel superior en nodo ${nodeId}`);
                delete node.type;
              }
            });
          }
        };
        removeTopLevelType(parsedJson);
        
        // VALIDACIÓN FINAL: Verificar estructura de cada nodo antes de deserializar
        const validateNodeStructure = (node, nodeId) => {
          const issues = [];
          if (!node.data) issues.push('no tiene data');
          if (!node.data || !node.data.type) issues.push('no tiene data.type');
          if (!node.data || !node.data.type || !node.data.type.resolvedName) issues.push('no tiene data.type.resolvedName');
          if (node.type) issues.push('tiene type en nivel superior (debe eliminarse)');
          if (!node.data || !node.data.props) issues.push('no tiene data.props');
          if (node.custom === undefined) issues.push('no tiene custom');
          if (typeof node.hidden !== 'boolean') issues.push('hidden no es boolean');
          if (!node.linkedNodes) issues.push('no tiene linkedNodes');
          if (issues.length > 0) {
            console.error(`[Export Viewer] Nodo ${nodeId} tiene problemas:`, issues.join(', '));
            console.error(`[Export Viewer] Estructura del nodo:`, JSON.stringify(node, null, 2).substring(0, 1000));
          }
          return issues.length === 0;
        };
        
        // Validar todos los nodos antes de deserializar
        console.log('[Export Viewer] Validando estructura de todos los nodos antes de deserializar...');
        let allValid = true;
        if (parsedJson.ROOT) {
          if (!validateNodeStructure(parsedJson.ROOT, 'ROOT')) {
            allValid = false;
          }
        }
        if (parsedJson.nodes && typeof parsedJson.nodes === 'object') {
          Object.keys(parsedJson.nodes).forEach(nodeId => {
            if (!validateNodeStructure(parsedJson.nodes[nodeId], nodeId)) {
              allValid = false;
            }
          });
        }
        
        if (!allValid) {
          console.error('[Export Viewer] ADVERTENCIA: Algunos nodos tienen problemas de estructura');
        }
        
        // Re-serializar el estado corregido
        const finalState = JSON.stringify(parsedJson);
        
        // Deserializar
        try {
          console.log('[Export Viewer] Intentando deserializar estado...');
          actions.deserialize(finalState);
          // eslint-disable-next-line no-console
          console.log('[Export Viewer] Estado deserializado correctamente');
        } catch (deserializeError) {
          console.error('[Export Viewer] Error durante deserialización:', deserializeError);
          console.error('[Export Viewer] Estado que falló (primeros 3000 caracteres):', finalState.substring(0, 3000));
          console.error('[Export Viewer] Estado completo (para debugging):', finalState);
          throw deserializeError;
        }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('No se pudo deserializar el estado exportado', e);
        console.error('Stack trace:', e.stack);
      const marker = document.createElement('div');
        marker.style.cssText = 'position:fixed;inset:0;background:#fff;color:#b00020;padding:16px;font:14px system-ui;overflow:auto;z-index:9999;';
        marker.innerHTML = '<h3>Error al deserializar el estado exportado</h3><pre style="white-space:pre-wrap;">' + String(e) + '\n\n' + (e.stack || '') + '</pre><p>Revisa la consola para más detalles.</p>';
      document.body.appendChild(marker);
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
    // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
            {/* Si el estado se deserializa, el árbol lo reemplaza. Este Element es sólo fallback. */}
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
  const el = document.getElementById('root');
  if (!el) return;
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
};

mount();
