import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Header from '../components/ui/Header';
import Palette from '../components/ui/Palette';
import Sidebar from '../components/ui/Sidebar';
import RightPanel from '../components/ui/RightPanel';

import { Container } from '../components/user/Container';
import { Button } from '../components/user/Button';
import { Card } from '../components/user/Card';
import { Text } from '../components/user/Text';
import { Image } from '../components/user/Image';
import { CardBottom, CardTop } from '../components/user/Card';
import { BackgroundImageContainer } from '../components/user/ImageContainer';
import { ChevronButton } from '../components/user/ChevronButton';
import { IconButton } from '../components/user/IconButton';
import { Columns2, Columns3, Columns4 } from '../components/user/ColumnsContainer';
import {FileDownload} from "../components/user/FileDownload";
import { ForumButton } from '../components/user/ForumButton';

import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { useSearchParams } from 'react-router-dom';
import { useGetSectionData } from '../hooks/useGetSectionData';
import { getSiteBySlug, getSiteIdBySlug } from '../hooks/useSites';

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
        if (!sectionName) return;
  const result = await useGetSectionData(sectionName, siteId);
        console.log('Section data loaded in Editor:', result);
        if (cancelled) return;
        if (!result) {
          // Si no hay datos guardados para esta sección, cargar lienzo vacío
          actions.deserialize(JSON.stringify(emptyTree.current));
        } else {
          const raw = typeof result === 'string' ? result : JSON.stringify(result);
          actions.deserialize(raw);
        }
      } catch (e) {
        console.error('No se pudo cargar la sección desde la BD', e);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sectionName, siteId, actions]);

  return null;
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

  // Cargar nombre de sitio para mostrarlo centrado sobre el editor
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
  
  // Canvas objetivo 1280x720 y auto-escala si no cabe en el panel central
  const TARGET_W = 1280;
  const TARGET_H = 720;
  const LEFT_W = 300;   // ancho fijo aprox del panel izquierdo
  const RIGHT_W = 300;  // ancho fijo aprox del panel derecho
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(TARGET_H);
  const [fitScale, setFitScale] = useState(1); // escala que hace "encajar" el lienzo
  const [zoom, setZoom] = useState(1);        // multiplicador controlado por el usuario
  const scale = Math.max(0.1, Math.min(4, fitScale * zoom));
  // Estado para scrollbar horizontal custom
  const [hScroll, setHScroll] = useState({ value: 0, max: 0 });
  
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      // Dejar un pequeño padding
      const availW = Math.max(0, rect.width - 16);
      const availH = Math.max(0, rect.height - 16);
      const s = Math.min(1, availW / TARGET_W, availH / TARGET_H);
      setFitScale(s > 0 && Number.isFinite(s) ? s : 1);
      // Recalcular límites de scroll cuando cambia el tamaño
      requestAnimationFrame(() => {
        const vp = viewportRef.current;
        if (!vp) return;
        const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
        setHScroll((prev) => ({ value: Math.min(prev.value, max), max }));
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Observar el tamaño real del canvas (sin escala) para que el wrapper refleje su altura
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => {
      // offsetHeight refleja el alto real sin transform
      const h = el.offsetHeight || TARGET_H;
      setContentHeight(h);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Helpers de zoom
  const setZoomStep = useCallback((delta) => {
    setZoom((z) => {
      const next = Math.max(0.1, Math.min(4 / Math.max(fitScale, 0.0001), z * (delta > 0 ? 1.1 : 0.9)));
      return next;
    });
  }, [fitScale]);

  const setZoomAbsolute = useCallback((target) => {
    // target es el porcentaje deseado aplicado sobre 100% del tamaño real (1.0)
    const desiredScale = target / 100; // relativo a real
    // Convertimos a multiplicador sobre fitScale
    const desiredZoom = desiredScale / Math.max(fitScale, 0.0001);
    setZoom(Math.max(0.1, Math.min(4 / Math.max(fitScale, 0.0001), desiredZoom)));
  }, [fitScale]);

  // Zoom con rueda del mouse (Ctrl+rueda o gesto de pinza)
  const onWheelZoom = useCallback((e) => {
    const vp = viewportRef.current;
    if (!vp) return;
    // Solo si mantiene Ctrl (evita interferir con scroll normal). Muchos trackpads envían ctrlKey para "pinch".
    if (!e.ctrlKey) return;
    e.preventDefault();

    const prevScale = scale;
    const rect = vp.getBoundingClientRect();
    const offsetX = e.clientX - rect.left; // px dentro del viewport visible
    const offsetY = e.clientY - rect.top;

    // punto de contenido (no escalado) bajo el cursor
    const contentX = (vp.scrollLeft + offsetX) / prevScale;
    const contentY = (vp.scrollTop + offsetY) / prevScale;

    const direction = e.deltaY > 0 ? -1 : 1; // rueda hacia arriba = acercar
    // actualizar zoom
    setZoom((z) => {
      const nextZ = Math.max(0.1, Math.min(4 / Math.max(fitScale, 0.0001), z * (direction > 0 ? 1.1 : 0.9)));
      const nextScale = Math.max(0.1, Math.min(4, fitScale * nextZ));
      // ajustar scroll para mantener el punto bajo el cursor estable
      requestAnimationFrame(() => {
        vp.scrollLeft = contentX * nextScale - offsetX;
        vp.scrollTop = contentY * nextScale - offsetY;
        const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
        setHScroll({ value: Math.max(0, Math.min(vp.scrollLeft, max)), max });
      });
      return nextZ;
    });
  }, [fitScale, scale]);

  // Vincular el scroll del viewport con la barra inferior
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

  // Recalcular límites del scroll cuando cambia la escala
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const max = Math.max(0, vp.scrollWidth - vp.clientWidth);
    setHScroll((prev) => ({ value: Math.max(0, Math.min(prev.value, max)), max }));
  }, [scale]);
  
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">

  <Editor resolver={{ Card, Button, Text, Image, Container, CardTop, CardBottom, BackgroundImageContainer, ChevronButton, IconButton, FileDownload, ForumButton }}>
  <Header nameSection={sectionFromQuery} siteId={siteId} />
        {/* Carga el estado inicial del editor desde Supabase según la sección */}
  <SectionDataLoader sectionName={sectionFromQuery} siteId={siteId} />
  <div className="d-flex grow" style={{ minHeight: 0 }}>
          {/* Columna izquierda: Sidebar encima de la paleta de componentes */}
          <div className="d-flex flex-column" style={{ flex: `0 0 ${LEFT_W}px`, width: LEFT_W, minWidth: LEFT_W, maxWidth: LEFT_W, overflowY: 'auto' }}>
            <Palette />
          </div>
          {/* Columna central: viewport para el canvas, se lleva la mayor parte */}
          <div
            className="pe-3 py-3 ps-0"
            style={{ flex: '1 1 0%', minWidth: 0, overflow: 'auto' }}
            ref={viewportRef}
            onWheel={onWheelZoom}
            onScroll={onViewportScroll}
          >
            {/* Nombre del sitio centrado */}
            <div className="pt-2 pb-1 text-center">
              <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                {siteName || siteSlug || 'Sitio'}
              </div>
            </div>

            <div className="ps-2 pe-2 pt-2 pb-1 small text-muted">
                Sección actual: <span className="fw-semibold">{sectionFromQuery || 'Sin sección'}</span>
            </div>

            {/* Canvas escalado por transform, sin alterar el layout interno.
                El wrapper da el tamaño "real" escalado para que el viewport pueda hacer scroll. */}
            <div
              style={{
                width: TARGET_W * scale,
                height: contentHeight * scale,
                margin: '0 auto',
                position: 'relative',
              }}
            >
              <div
                className="position-relative"
                data-editor="canvas-frame"
                style={{
                  width: TARGET_W,
                  height: 'auto',
                  minHeight: TARGET_H,
                  overflow: 'visible',
                  backgroundColor: 'transparent',
                  outline: '1px solid #000',
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

            {/* Barra de controles e indicador debajo de la zona de edición */}
            {/* Scrollbar horizontal custom */}
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
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setZoomStep(-1)} title="Alejar (-)">−</button>
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setZoomAbsolute(100)} title="100%">100%</button>
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setZoomStep(1)} title="Acercar (+)">+</button>
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setZoom(1)} title="Ajustar a pantalla">Ajustar</button>
              </div>
            </div>
            
          </div>
          {/* Panel derecho: Personalización y Capas */}
          <div className="border-start" style={{ flex: `0 0 ${RIGHT_W}px`, width: RIGHT_W, minWidth: RIGHT_W, maxWidth: RIGHT_W, overflowY: 'auto' }}>
            <RightPanel />
          </div>
        </div>
      </Editor>

    </div>
  );
}

export default App;