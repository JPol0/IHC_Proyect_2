import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { saveSectionData } from '../../hooks/useSaveSectionData';
import { useUndoHistory } from '../../hooks/useUndoHistory';
import JSZip from 'jszip';
import { supabase } from '../../../SupabaseCredentials';

export default function Header({ nameSection, siteId = null }) {
  const navigate = useNavigate();
  const { enabled, actions, query } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { undo, canUndo } = useUndoHistory();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const sectionName = nameSection || '';

  const handleClear = () => {
    if (!confirm('¿Limpiar el lienzo? Esta acción borrará el contenido.')) return;
    // Empty ROOT keeping it as canvas
    const emptyTree = {
      ROOT: {
        type: { resolvedName: 'Container' },
        isCanvas: true,
        props: { padding: 5, background: '#f5f5f5' },
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    };
    actions.deserialize(JSON.stringify(emptyTree));
  };

  // Guardar estado en Supabase y bloquear el editor mientras guarda
  const handleSave = async () => {
    try {
      if (!sectionName) {
        alert('No hay nombre de sección (prop nameSection).');
        return;
      }
      setIsSaving(true);
      actions.setOptions((opts) => (opts.enabled = false));
      const json = query.serialize();
      console.log('Saving section:', sectionName, json);
  await saveSectionData(sectionName, json, siteId);
    } catch (e) {
      console.error('Error al guardar la sección', e);
      alert('No se pudo guardar. Revisa la consola para más detalles.');
    } finally {
      // Al terminar, activar el editor
      actions.setOptions((opts) => (opts.enabled = true));
      setIsSaving(false);
    }
  };

  // Previsualizar en nueva pestaña usando el bundle público del viewer
  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      actions.setOptions((opts) => (opts.enabled = false));
      const serialized = query.serialize();
      const serializedEscaped = JSON.stringify(serialized);

      const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Previsualización</title>
    <link rel="stylesheet" href="/craft-renderer-bundle.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.global = window.global || window;
      window.process = window.process || { env: { NODE_ENV: 'production' } };
      window.__CRAFT_PAGE_STATE__ = JSON.parse(${serializedEscaped});
    </script>
    <script src="/craft-renderer-bundle.js"></script>
  </body>
</html>`;

      const win = window.open('', '_blank');
      if (!win) {
        alert('El navegador bloqueó la ventana de previsualización. Permite popups para continuar.');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error('Error al previsualizar:', e);
      alert('No se pudo abrir la previsualización. Revisa la consola.');
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsPreviewing(false);
    }
  };

  // Exportar: serializa el estado, carga el bundle del viewer y empaqueta en ZIP
  const handleExport = async () => {
    try {
      if (!confirm('Crear y descargar ZIP con el sitio exportado?')) return;
      setIsSaving(true);
      // Desactivar editor para evitar cambios mientras exporta
      actions.setOptions((opts) => (opts.enabled = false));

  // Serializa el estado del editor (string JSON)
  const serialized = query.serialize();
  // Evita romper el script si hay secuencias problemáticas; se parsea en cliente
  const serializedEscaped = JSON.stringify(serialized);

      // Intenta cargar el bundle preconstruido desde /craft-renderer-bundle.js
      const resp = await fetch('/craft-renderer-bundle.js');
      if (!resp.ok) throw new Error('No se encontró /craft-renderer-bundle.js en /public. Ejecuta npm run build:renderer');
      const bundleText = await resp.text();

      // Cargar CSS emitido por el viewer (si existe) y normalizar rutas a ./assets/
      let cssText = '';
      const cssResp = await fetch('/craft-renderer-bundle.css');
      if (cssResp.ok) {
        cssText = await cssResp.text();
        // Normaliza rutas absolutas /assets/... a relativas ./assets/ para que funcione al abrir local
        cssText = cssText.replace(/url\((['"]?)(\/assets\/)\s*/g, 'url($1./assets/');
      }

      // Construir index.html que inyecta el JSON, shim de process y carga el bundle y CSS
      const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Página exportada</title>
    ${cssText ? '<link rel="stylesheet" href="./craft-renderer-bundle.css" />' : ''}
  </head>
  <body>
    <div id="root"></div>
    <!-- Shim mínimo para librerías que esperan process/global en navegador -->
    <script>
      window.global = window.global || window;
      window.process = window.process || { env: { NODE_ENV: 'production' } };
    </script>
    <script>
      window.__CRAFT_PAGE_STATE__ = JSON.parse(${serializedEscaped});
    </script>
    <script src="./craft-renderer-bundle.js"></script>
  </body>
</html>`;

      // Usar JSZip para empaquetar
      const zip = new JSZip();
      zip.file('index.html', html);
      zip.file('craft-renderer-bundle.js', bundleText);
      if (cssText) {
        // Detectar y empaquetar assets referenciados por el CSS (ej: fuentes)
        const assetMatches = Array.from(new Set(cssText.match(/\/assets\/[A-Za-z0-9_\-\.\/]+/g) || []));
        // Descargar assets en paralelo
        const assets = await Promise.all(assetMatches.map(async (p) => {
          try {
            const r = await fetch(p);
            if (!r.ok) return null;
            const b = await r.blob();
            return { path: p.replace(/^\//, ''), blob: b };
          } catch (_) {
            return null;
          }
        }));
        // Añadir assets encontrados
        assets.forEach((a) => {
          if (a && a.blob) {
            zip.file(a.path, a.blob);
          }
        });
        // Finalmente, añadir el CSS
        zip.file('craft-renderer-bundle.css', cssText);
      }

      const blob = await zip.generateAsync({ type: 'blob' });

      // Disparar descarga
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (sectionName ? `${sectionName}-site.zip` : 'site.zip');
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('Error al exportar:', e);
      alert('No se pudo exportar. Revisa la consola para más detalles. ' + (e && e.message ? e.message : ''));
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsSaving(false);
    }
  };

  // Previsualizar la sección actual en una nueva pestaña (usa el bundle público)
  // NOTE: La funcionalidad de previsualización se eliminó por petición del usuario.

  // Exportar todas las secciones como SPA: una sola index.html con rutas por sección
  const handleExportAll = async () => {
    try {
      setIsSaving(true);
      setIsExporting(true);
      actions.setOptions((opts) => (opts.enabled = false));

      // 1) Consultar todas las secciones en Supabase (definir inicio antes de confirmar)
      let q = supabase
        .from('Secciones')
        .select('nameSeccion, json')
        .order('nameSeccion', { ascending: true });
      if (siteId) q = q.eq('site_id', siteId);
      const { data: rows, error } = await q;
      if (error) throw error;
      if (!rows || rows.length === 0) {
        alert('No hay secciones para exportar.');
        return;
      }

      // Helper para slug del nombre de sección
      const toSlug = (s) => (s || 'seccion')
        .toString()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        .toLowerCase() || 'seccion';

      const sectionsPreview = rows.map(r => ({ name: r.nameSeccion || 'Sección', slug: toSlug(r.nameSeccion || 'seccion') }));
      const lower = (s) => (s || '').toLowerCase();
      const preferred = sectionsPreview.find(s => ['home','inicio','index'].includes(lower(s.name)));
      const chosen = preferred || sectionsPreview[0];

      const msg = `Exportar TODO como SPA (una sola index.html con rutas)?\n\nRegla de inicio: si existe una sección llamada "home", "inicio" o "index" (sin importar mayúsculas), será la ruta inicial; de lo contrario, se usa la primera sección ordenada.\n\nSección de inicio seleccionada: "${chosen.name}" (/ ${chosen.slug})`;
      if (!confirm(msg)) return;

      // 2) Cargar bundle y CSS una vez
      const resp = await fetch('/craft-renderer-bundle.js');
      if (!resp.ok) throw new Error('No se encontró /craft-renderer-bundle.js en /public. Ejecuta npm run build:renderer');
      const bundleText = await resp.text();

      let cssText = '';
      const cssResp = await fetch('/craft-renderer-bundle.css');
      if (cssResp.ok) {
        cssText = await cssResp.text();
        // Normaliza URLs de assets a relativas ./assets/ (soporta /assets, ./assets, assets)
        cssText = cssText.replace(/url\((['\"]?)(?:\/|\.\/)?assets\//g, 'url($1./assets/');
      }

      const zip = new JSZip();

      // 3) Detectar assets del CSS y añadirlos
      if (cssText) {
        // Extrae TODAS las url(...) del CSS y filtra las que apunten a assets locales
        const urlRegex = /url\((['\"]?)([^)\"']+)\1\)/g; // captura contenido de url()
        const allUrls = new Set();
        let m;
        while ((m = urlRegex.exec(cssText)) !== null) {
          const u = m[2];
          if (!u || u.startsWith('data:')) continue; // data URIs no requieren empaquetado
          // Normaliza a ruta local ./assets/
          if (/(^\/|^\.\/)?assets\//.test(u)) {
            const normalized = u.replace(/^(?:\/|\.\/)?assets\//, './assets/');
            allUrls.add(normalized);
          }
        }
        // Descarga y añade a zip
        const assets = await Promise.all(Array.from(allUrls).map(async (u) => {
          try {
            // Para fetch en el editor, usa path absoluto
            const src = u.replace(/^\.\//, '/');
            const r = await fetch(src);
            if (!r.ok) return null;
            const b = await r.blob();
            const path = u.replace(/^\.\//, '');
            return { path, blob: b };
          } catch (_) { return null; }
        }));
        assets.forEach((a) => { if (a && a.blob) zip.file(a.path, a.blob); });
        // Escribe el CSS ya normalizado (con ./assets/)
        zip.file('craft-renderer-bundle.css', cssText);
      }

      // 4) Construir mapa de rutas SPA y HTML único
  const sections = [];
  const routesMap = {};
      // Helpers para empaquetar imágenes del contenido y reescribir rutas
      const collectImageUrls = (obj, out = new Set()) => {
        const visit = (v) => {
          if (!v) return;
          const t = typeof v;
          if (t === 'string') {
            const s = v.trim();
            const urlInCss = s.match(/url\((['\"]?)([^)\"']+)\1\)/i);
            if (urlInCss && urlInCss[2] && /^https?:\/\//i.test(urlInCss[2])) out.add(urlInCss[2]);
            if (/^https?:\/\//i.test(s) && /(\.(png|jpe?g|gif|webp|svg))(\?|#|$)/i.test(s)) out.add(s);
            return;
          }
          if (Array.isArray(v)) { v.forEach(visit); return; }
          if (t === 'object') { for (const k in v) visit(v[k]); }
        };
        visit(obj);
        return out;
      };
      const rewriteUrlsInJson = (obj, map) => {
        const replaceStr = (s) => {
          let out = s;
          for (const [from, to] of map.entries()) {
            // Reemplaza occurrences directas y dentro de url("...")
            out = out.split(from).join(to);
          }
          return out;
        };
        const recur = (v) => {
          if (!v) return v;
          const t = typeof v;
          if (t === 'string') return replaceStr(v);
          if (Array.isArray(v)) return v.map(recur);
          if (t === 'object') {
            const o = {}; for (const k in v) o[k] = recur(v[k]); return o;
          }
          return v;
        };
        return recur(obj);
      };
      // Pregunta si el usuario quiere empaquetado OFFLINE de imágenes
      const doOfflineImages = window.confirm('¿Quieres que también haga el empaquetado OFFLINE de imágenes (y reescritura de rutas) para que el ZIP no tenga dependencias de red?');
      for (const row of rows || []) {
        const name = row.nameSeccion || 'Sección';
        const slug = toSlug(name);
        let json = row.json;
        if (typeof json === 'string') {
          try { json = JSON.parse(json); } catch { /* dejar string si falla */ }
        }
        // 4.1 Procesa JSON de la sección; opcionalmente empaqueta imágenes offline
        let obj = (typeof json === 'string') ? (()=>{ try{return JSON.parse(json);}catch{return {}; } })() : (json || {});
        if (doOfflineImages) {
          const urls = Array.from(collectImageUrls(obj));
          const urlMap = new Map();
          let idx = 0;
          for (const u of urls) {
            try {
              const res = await fetch(u);
              if (!res.ok) continue;
              const blob = await res.blob();
              // Deriva extensión desde URL o tipo MIME
              let ext = (u.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
              if (!ext || ext.length > 4) {
                const mime = blob.type || '';
                if (mime.includes('png')) ext = 'png';
                else if (mime.includes('jpeg')) ext = 'jpg';
                else if (mime.includes('jpg')) ext = 'jpg';
                else if (mime.includes('gif')) ext = 'gif';
                else if (mime.includes('webp')) ext = 'webp';
                else if (mime.includes('svg')) ext = 'svg';
                else ext = 'bin';
              }
              const filePath = `assets/img/${slug}-${idx}.${ext}`;
              zip.file(filePath, blob);
              urlMap.set(u, `./${filePath}`);
              idx++;
            } catch (_) { /* ignore */ }
          }
          // Reescribe URLs en el JSON con rutas locales
          obj = rewriteUrlsInJson(obj, urlMap);
        }
        const serialized = JSON.stringify(obj || {});
        sections.push({ name, slug });
        routesMap[slug] = serialized;
      }
  // Heurística de inicio (misma regla mostrada al usuario)
  const pref = sections.find(s => ['home','inicio','index'].includes(lower(s.name)));
  const startSlug = pref ? pref.slug : (sections[0]?.slug || '');
      const startRoute = startSlug ? `/${startSlug}` : '/';

      const routesEscaped = JSON.stringify(routesMap);
      const sectionsEscaped = JSON.stringify(sections);
      const indexHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Página exportada</title>
    ${cssText ? '<link rel="stylesheet" href="./craft-renderer-bundle.css" />' : ''}
    <style>html,body,#root{height:100%} body{margin:0;background:#f8f9fa}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.global = window.global || window;
      window.process = window.process || { env: { NODE_ENV: 'production' } };
      window.__CRAFT_ROUTES__ = ${routesEscaped};
      window.__CRAFT_SECTIONS__ = ${sectionsEscaped};
      window.__CRAFT_START_ROUTE__ = ${JSON.stringify(startRoute)};
    </script>
    <script src="./craft-renderer-bundle.js"></script>
  </body>
</html>`;

      zip.file('index.html', indexHtml);
      zip.file('craft-renderer-bundle.js', bundleText);

      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'site-spa.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error('Error al exportar todas las secciones:', e);
      alert('No se pudo exportar todas las secciones. Revisa consola. ' + (e?.message || ''));
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsSaving(false);
      setIsExporting(false);
    }
  };

  return (
    <>
    <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
      <div className="d-flex align-items-center gap-3">
        <div className="h4 m-0 fw-bold">Ágora</div>
        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-a50104"
            onClick={() => navigate('/')}
          >
            Inicio
          </button>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className={`btn btn-a50104 ${enabled ? '' : 'active'}`}
          onClick={() => actions.setOptions((opts) => (opts.enabled = !enabled))}
          disabled={isSaving || isExporting}
        >
          {enabled ? 'Desactivar' : 'Activar'} editor
        </button>

        <button
          type="button"
          className="btn btn-a50104 d-flex justify-content-between align-items-center gap-2"
          onClick={undo}
          disabled={!canUndo}
          title="Retroceder (Ctrl+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
            <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
          </svg>
          Deshacer
        </button>

        {/* El botón de previsualizar fue removido */}
      
        <button type="button" className="btn btn-a50104" onClick={handleClear} disabled={isSaving || isExporting}>
          Limpiar
        </button>

        <button type="button" className="btn btn-darkRed d-flex justify-content-between align-items-center gap-2" onClick={handleSave} disabled={isSaving || isExporting || !sectionName}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-floppy-fill" viewBox="0 0 16 16">
              <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
              <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
            </svg>
            {isSaving ? 'Guardando…' : 'Guardar'}
        </button>
        

        <button
          type="button"
          className="btn btn-a50104"
          onClick={handlePreview}
          disabled={isPreviewing || isSaving || isExporting}
          title="Previsualizar en una pestaña nueva"
        >
          Previsualizar
        </button>
        
        <button
          type="button"
          className="btn btn-warning d-flex justify-content-between align-items-center gap-2"
          onClick={handleExportAll}
          title={isExporting ? 'Empaquetando…' : 'Exportar TODO como ZIP'}
          disabled={isExporting || isSaving}
        >
          {isExporting && (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          )}
          {!isExporting && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-down" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M3.5 1a1 1 0 0 0-1 1v4a.5.5 0 0 1-1 0V2a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v4a.5.5 0 0 1-1 0V2a1 1 0 0 0-1-1h-9z"/>
              <path fillRule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2.5-2.5a.5.5 0 1 0-.708-.708L8.5 9.293V4.5a.5.5 0 0 0-1 0v4.793L5.854 7.646a.5.5 0 1 0-.708.708l2.5 2.5z"/>
              <path d="M14.5 10a.5.5 0 0 1 .5.5V14a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3.5a.5.5 0 0 1 1 0V14a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
          )}
          <span>{isExporting ? 'Exportando…' : 'Exportar'}</span>
        </button>
      </div>
    </div>
  
    </>
  );
}
