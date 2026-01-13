import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Header from '../components/ui/Header';
import LeftSidebar from '../components/ui/LeftSidebar'; // Replaces Palette
import RightSidebar from '../components/ui/RightSidebar'; // Replaces RightSidebarWithTabs

import { Container } from '../components/user/Container';
import { Button } from '../components/user/Button';
import { Card } from '../components/user/Card';
import { Text } from '../components/user/Text';
import { Image } from '../components/user/Image';
import { CardBottom, CardTop } from '../components/user/Card';
import { BackgroundImageContainer } from '../components/user/ImageContainer';
import { ChevronButton } from '../components/user/ChevronButton';
import { IconButton } from '../components/user/IconButton';
import { FileDownload } from "../components/user/FileDownload";
import { ForumButton } from '../components/user/ForumButton';
import { LikeButton } from '../components/user/LikeButton';
import { Navbar } from '../components/user/Navbar';

import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { useSearchParams } from 'react-router-dom';
import { useGetSectionData } from '../hooks/useGetSectionData';
import { getSiteBySlug, getSiteIdBySlug } from '../hooks/useSites';
import { useUndoHistory } from '../hooks/useUndoHistory';

// Carga el JSON guardado para la sección indicada y lo inyecta al editor
function SectionDataLoader({ sectionName, siteId }) {
  const { actions } = useEditor();
  const emptyTree = useRef({
    ROOT: {
      type: { resolvedName: 'BackgroundImageContainer' },
      isCanvas: true,
      props: { padding: 0, background: '#f5f5f5' },
      displayName: 'BackgroundImageContainer',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!sectionName) {
           // Si no hay sección específica, cargamos un lienzo vacío.
           actions.deserialize(JSON.stringify(emptyTree.current));
           return;
        }
        const result = await useGetSectionData(sectionName, siteId);
        console.log('Section data loaded in Editor:', result);
        if (cancelled) return;

        if (!result) {
          actions.deserialize(JSON.stringify(emptyTree.current));
        } else {
          const raw = typeof result === 'string' ? result : JSON.stringify(result);
          actions.deserialize(raw);
        }
      } catch (e) {
        console.error('No se pudo cargar la sección desde la BD', e);
        actions.deserialize(JSON.stringify(emptyTree.current));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sectionName, siteId, actions]);

  return null;
}

function EditorLayout({ siteName, siteSlug, sectionFromQuery, siteId }) {
  const { undo, canUndo } = useUndoHistory();
  
  // Canvas Configuration
  const TARGET_W = 1280;
  const TARGET_H = 720;
  const LEFT_W = 300;   // Updated Width for LeftSidebar
  const RIGHT_W = 300;  // Width for RightSidebar
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(TARGET_H);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [hScroll, setHScroll] = useState({ value: 0, max: 0 });

  // Calculate content height
  useEffect(() => {
    if (!canvasRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === canvasRef.current) {
             const h = entry.contentRect.height;
             setContentHeight(Math.max(h, TARGET_H));
        }
      }
    });
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [TARGET_H]);

  // Handle Resize for Fit Scale
  useEffect(() => {
    if (!viewportRef.current) return;
    const handleResize = () => {
        const vp = viewportRef.current;
        if (!vp) return;
        const availW = vp.clientWidth - 40; 
        const s = Math.min(1, availW / TARGET_W); 
        setFitScale(s);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [TARGET_W]);

  const scale = useMemo(() => fitScale * zoom, [fitScale, zoom]);
  const setZoomAbsolute = (percent) => setZoom(percent / 100 / fitScale);
  const setZoomStep = (step) => setZoom(prev => Math.max(0.1, prev + step * 0.1));

  const onWheelZoom = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom(prev => Math.max(0.1, prev + (e.deltaY < 0 ? 0.1 : -0.1)));
    }
  }, []);

  const onViewportScroll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
    setHScroll({ value: Math.max(0, Math.min(vp.scrollLeft, max)), max });
  }, []);

  const onHorizontalBarChange = useCallback((e) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const next = Number(e.target.value) || 0;
    vp.scrollLeft = next;
    const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
    setHScroll({ value: Math.max(0, Math.min(next, max)), max });
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
    setHScroll((prev) => ({ value: Math.max(0, Math.min(prev.value, max)), max }));
  }, [scale]);
  
  return (
    <>
        <Header nameSection={sectionFromQuery} siteId={siteId} siteSlug={siteSlug} />
        <SectionDataLoader sectionName={sectionFromQuery} siteId={siteId} />
        
        <div className="d-flex grow" style={{ minHeight: 0, flex: 1 }}>
          {/* Left Column: Pages, Components, Layers */}
          <div style={{ flex: `0 0 ${LEFT_W}px`, width: LEFT_W, minWidth: LEFT_W, maxWidth: LEFT_W }}>
            <LeftSidebar />
          </div>

          {/* Middle Column: Canvas */}
          <div
            className="pe-3 py-3 ps-0"
            style={{ flex: '1 1 0%', minWidth: 0, overflow: 'auto' }}
            ref={viewportRef}
            onWheel={onWheelZoom}
            onScroll={onViewportScroll}
          >
             <div className="pt-2 pb-1 text-center d-flex flex-column align-items-center justify-content-center gap-2">
              <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                {siteName || siteSlug || 'Sitio'}
              </div>
              <div className="d-flex align-items-center gap-2">
                <button 
                  className="btn btn-sm btn-white border shadow-sm d-flex align-items-center justify-content-center" 
                  disabled={!canUndo} 
                  onClick={undo} 
                  title="Deshacer"
                  style={{ opacity: canUndo ? 1 : 0.6, width: '32px', height: '32px' }}
                >
                   <i className="bi bi-arrow-counterclockwise fs-6"></i>
                </button>
                <button 
                   className="btn btn-sm btn-white border shadow-sm d-flex align-items-center justify-content-center" 
                   disabled 
                   title="Rehacer"
                   style={{ opacity: 0.6, width: '32px', height: '32px' }}
                >
                   <i className="bi bi-arrow-clockwise fs-6"></i>
                </button>
              </div>
            </div>

            <div className="ps-2 pe-2 pt-2 pb-1 small text-muted">
                Sección actual: <span className="fw-semibold">{sectionFromQuery || 'Sin sección'}</span>
            </div>

            <div
              style={{
                width: TARGET_W * scale,
                height: contentHeight * scale,
                margin: '0 auto',
                position: 'relative',
              }}
            >
              <div
                className="position-relative shadow-sm"
                data-editor="canvas-frame"
                style={{
                  width: TARGET_W,
                  height: 'auto',
                  minHeight: TARGET_H,
                  overflow: 'visible',
                  backgroundColor: 'white', 
                  outline: '1px solid #e2e8f0',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
                ref={canvasRef}
              >
                <Frame>
                  <Element
                    is={BackgroundImageContainer}
                    padding={0}
                    canvas
                    targetWidth={TARGET_W}
                    targetHeight={TARGET_H}
                  />
                </Frame>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-2">
              <input
                type="range"
                className="form-range"
                min={0}
                max={hScroll.max}
                step={1}
                value={hScroll.value}
                onChange={onHorizontalBarChange}
              />
            </div>

            <div className="d-flex justify-content-end align-items-center gap-2">
              <div className="small text-muted px-2 py-1" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
                {Math.round(TARGET_W)}×{Math.round(TARGET_H)} @ {Math.round(scale * 100)}%
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-light border" onClick={() => setZoomStep(-1)} title="Alejar (-)">−</button>
                <button className="btn btn-sm btn-light border" onClick={() => setZoomAbsolute(100)} title="100%">100%</button>
                <button className="btn btn-sm btn-light border" onClick={() => setZoomStep(1)} title="Acercar (+)">+</button>
                <button className="btn btn-sm btn-light border" onClick={() => setZoom(1)} title="Ajustar a pantalla">Ajustar</button>
              </div>
            </div>
            
          </div>
          
          {/* Right Column: Settings only */}
          <div style={{ flex: `0 0 ${RIGHT_W}px`, width: RIGHT_W, minWidth: RIGHT_W, maxWidth: RIGHT_W }}>
            <RightSidebar />
          </div>
        </div>
    </>
  );
}

function App({nameSection}) {
  const [searchParams] = useSearchParams();
  const sectionFromQuery = searchParams.get('section') || nameSection;
  const siteSlug = searchParams.get('site') || null;
  const [siteId, setSiteId] = useState(null);
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!siteSlug) { setSiteId(null); return; }
      const id = await getSiteIdBySlug(siteSlug);
      if (!cancelled) setSiteId(id);
    }
    load();
    return () => { cancelled = true };
  }, [siteSlug]);

  useEffect(() => {
    let cancelled = false;
    async function loadName() {
      if (!siteSlug) { setSiteName(''); return; }
      const res = await getSiteBySlug(siteSlug);
      if (!cancelled) setSiteName(res.ok && res.site ? (res.site.name || res.site.slug) : siteSlug);
    }
    loadName();
    return () => { cancelled = true };
  }, [siteSlug]);

  return (
    <div className="vh-100 d-flex flex-column bg-light overflow-hidden">
      <Editor resolver={{ Card, Button, Text, Image, Container, CardTop, CardBottom, BackgroundImageContainer, ChevronButton, IconButton, FileDownload, ForumButton, LikeButton, Navbar }}>
        <EditorLayout
          siteName={siteName}
          siteId={siteId}
          siteSlug={siteSlug}
          sectionFromQuery={sectionFromQuery}
        />
      </Editor>
    </div>
  );
}

export default App;
