import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { saveSectionData } from '../../hooks/useSaveSectionData';
import JSZip from 'jszip';
import { supabase } from '../../../SupabaseCredentials';
import { createComponent } from '../../hooks/useUpdatableComponents';

export default function Header({ nameSection, siteId = null, siteSlug = null }) {
  const navigate = useNavigate();
  const { enabled, actions, query } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showSaveAsComponent, setShowSaveAsComponent] = useState(false);
  
  // New States for Full Site Export
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportWithImages, setExportWithImages] = useState(false);

  const sectionName = nameSection || '';
  const handleClear = () => {
    if (!confirm('¿Limpiar el lienzo? Esta acción borrará el contenido.')) return;
    const emptyTree = {
      ROOT: {
        type: { resolvedName: 'BackgroundImageContainer' },
        isCanvas: true,
        props: { padding: 5, background: '#f5f5f5' },
        displayName: 'BackgroundImageContainer',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    };
    actions.deserialize(JSON.stringify(emptyTree));
  };

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
      // alert('Guardado correctamente'); // Opcional, mejor usar un toast si hubiera
    } catch (e) {
      console.error('Error al guardar la sección', e);
      alert('No se pudo guardar.');
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsSaving(false);
    }
  };



  // Previsualizar en nueva pestaña usando el bundle público del viewer
  // VERSIÓN SIMPLIFICADA: Pasa el JSON de query.serialize() directamente
  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      actions.setOptions((opts) => (opts.enabled = false));
      
      // Serializa el estado del editor (string JSON)
      const serialized = query.serialize();
      // Escape para insertar en script de forma segura
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
        alert('El navegador bloqueó la ventana de previsualización.');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error('Error al previsualizar:', e);
      alert('No se pudo abrir la previsualización: ' + (e.message || e));
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsPreviewing(false);
    }
  };

  const performExport = async (sectionsToExport = []) => {
    try {
      setIsExporting(true);
      
      // 1. Cargar Assets Estáticos
      const assets = {};
      try {
        const indexRes = await fetch('/index.html'); assets.indexHtml = await indexRes.text();
        const cssRes = await fetch('/craft-renderer-bundle.css'); assets.css = await cssRes.text();
        const jsRes = await fetch('/craft-renderer-bundle.js'); assets.js = await jsRes.text();
      } catch(e) {
        throw new Error('Error cargando assets base (css/js). Ejecuta "npm run build:renderer".');
      }

      const zip = new JSZip();
      zip.file('craft-renderer-bundle.css', assets.css);
      zip.file('craft-renderer-bundle.js', assets.js);
      
      const assetsFolder = zip.folder('assets');
      const processedUrls = new Map(); // url -> localPath

      // Variables de control de errores
      const failedImages = [];
      const successImages = [];

      const normalizePossibleUrl = (raw) => {
        if (!raw || typeof raw !== 'string') return null;
        let url = raw.trim();

        // extraer url("...") o url('...')
        const m = url.match(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/i);
        if (m && m[2]) url = m[2].trim();

        // convertir //example.com/image.png -> https://example.com/image.png
        if (url.startsWith('//')) {
          url = `${window.location.protocol}${url}`;
        }

        // resolver rutas relativas
        if (url.startsWith('/')) {
          try { url = new URL(url, window.location.origin).toString(); } catch {}
        }

        return url;
      };

      const tryDownloadFromSupabase = async (absoluteUrl) => {
        try {
          if (!absoluteUrl || typeof absoluteUrl !== 'string') return null;
          const u = new URL(absoluteUrl);
          const path = u.pathname || '';

          // formatos comunes:
          // /storage/v1/object/public/<bucket>/<filePath>
          // /storage/v1/object/sign/<bucket>/<filePath>
          const m = path.match(/\/storage\/v1\/object\/(public|sign)\/([^/]+)\/(.+)$/i);
          if (!m) return null;
          const bucket = decodeURIComponent(m[2]);
          const filePath = decodeURIComponent(m[3]);

          const { data, error } = await supabase.storage.from(bucket).download(filePath);
          if (error) throw error;
          if (!data) throw new Error('download() returned empty');
          return data; // Blob
        } catch (e) {
          console.warn('[Export] Supabase download fallback failed:', e);
          return null;
        }
      };

      // Helper para descargar imagen y actualizar JSON
      const processImages = async (node) => {
        if (!node || !node.data) return;
        
        // Log para ver qué props estamos procesando y de dónde vienen
        const propsSource = Object.keys(node.data.props || {}).length > 0 ? 'data.props' : (node.props && Object.keys(node.props).length > 0 ? 'node.props' : 'NONE');
        const targetProps = propsSource === 'node.props' ? node.props : node.data.props;
        
        console.log(`[Export Debug] Procesando nodo: ${node.data.type?.resolvedName || 'Unknown'} (${node.id || '?'}). Fuente Props: ${propsSource}. Keys: ${Object.keys(targetProps || {}).join(', ')}`);

        if (!targetProps) return;

        const downloadAndGetPath = async (url) => {
           // Normalizar URL para evitar duplicados
           const cleanUrl = url.trim();
           let localPath = processedUrls.get(cleanUrl);
           if (localPath) return localPath;

           console.log(`[Export] Intentando descargar: ${cleanUrl}`);

           try {
              let blob;
              let ext = 'png';

              const isData = cleanUrl.startsWith('data:image');

              if (isData) {
                const arr = cleanUrl.split(',');
                const mime = arr[0]?.match(/:(.*?);/)?.[1] || 'image/png';
                const bstr = atob(arr[1] || '');
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) u8arr[n] = bstr.charCodeAt(n);
                blob = new Blob([u8arr], { type: mime });
                ext = (mime.split('/')[1] || 'png').split('+')[0];
              } else {
                // 1) intentar fetch directo
                try {
                  // Intentamos primero sin credenciales para evitar preflight complex
                  const res = await fetch(cleanUrl, { mode: 'cors', credentials: 'omit', redirect: 'follow' });
                  if (!res.ok) throw new Error(`Status ${res.status}`);
                  blob = await res.blob();
                } catch (fetchErr) {
                  console.warn(`[Export] Fetch directo falló para ${cleanUrl}, intentando Supabase fallback...`, fetchErr);
                  // 2) fallback para Supabase Storage
                  const sbBlob = await tryDownloadFromSupabase(cleanUrl);
                  if (!sbBlob) throw fetchErr; // Si falla también Supabase, lanzamos el error original
                  blob = sbBlob;
                }

                const mime = blob.type || 'image/png';
                ext = (mime.split('/')[1] || 'png').split('+')[0];
                // Ajuste de extensión si la URL tiene una explícita
                const lower = cleanUrl.toLowerCase();
                if (lower.includes('.svg')) ext = 'svg';
                else if (lower.includes('.jpeg') || lower.includes('.jpg')) ext = 'jpg';
                else if (lower.includes('.png')) ext = 'png';
                else if (lower.includes('.webp')) ext = 'webp';
              }

              const fname = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
              assetsFolder.file(fname, blob);
              localPath = `assets/${fname}`;
              processedUrls.set(cleanUrl, localPath);
              successImages.push(cleanUrl);
              console.log(`[Export] Éxito: ${cleanUrl} -> ${localPath}`);
              return localPath;
            } catch (e) {
              console.warn(`[Export] CRITICAL FAIL: ${cleanUrl}`, e);
              failedImages.push({ url: cleanUrl, error: e?.message || String(e) });
              return null; 
            }
        };

        const processObject = async (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;

            for (const key of Object.keys(obj)) {
                
                // Debug log de cada llave
                // console.log(`[Export Debug] Revisando key: ${path}${key} =`, obj[key]);

                // Recursión para objetos anidados (ej. style, variants, etc)
                if (obj[key] && typeof obj[key] === 'object' && !React.isValidElement(obj[key])) {
                    await processObject(obj[key], path + key + '.');
                    continue;
                }

                // Verificar si es una propiedad de imagen
                // Agregamos 'background' y variantes camelCase/kebabCase comunes
                const isImageKey = ['src', 'backgroundImage', 'url', 'imageUrl', 'cover', 'image', 'background', 'poster'].includes(key);
                
                // También verificamos si el VALOR parece una URL de imagen, independientemente de la key
                const val = obj[key];
                const isString = typeof val === 'string';
                
                // Si la key es sospechosa O el valor parece una URL de imagen conocida
                let shouldProcess = isImageKey && isString;
                
                if (!shouldProcess && isString) {
                    // Heurística adicional: si el valor termina en extensión de imagen o empieza con http y contiene /images/ o similar
                    if (val.match(/\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i) || val.match(/^https?:\/\/.*(images|img|assets).*/i)) {
                        shouldProcess = true;
                    }
                    // Si es data:image
                    if (val.startsWith('data:image')) shouldProcess = true;
                }

                if (!shouldProcess) continue;

                const raw = val;
                const url = normalizePossibleUrl(raw);
                if (!url) continue;

                const isHttp = url.startsWith('http://') || url.startsWith('https://');
                const isBlob = url.startsWith('blob:');
                const isData = url.startsWith('data:image');

                console.log(`[Export Debug] Candidato encontrado en ${path}${key}: ${url.substring(0, 50)}...`, {isHttp, isBlob, isData, exportWithImages});

                if (!exportWithImages || !(isHttp || isBlob || isData)) {
                     // console.log(`[Export Debug] SALTADO.`);
                     continue;
                }

                const localPath = await downloadAndGetPath(url);
                
                if (localPath) {
                    // Si estaba en formato url("..."), reponerlo
                    if (raw.trim().match(/^url\s*\(/i)) {
                         obj[key] = `url("${localPath}")`;
                    } else {
                         obj[key] = localPath;
                    }
                }
            }
        };

        await processObject(targetProps, 'props.');
        
        // También procesar 'style' si existe en la raíz de data (a veces pasa en implementaciones custom)
        if (node.data.style) {
             await processObject(node.data.style, 'style.');
        }

        // Si procesamos node.props, asegurarnos de sincronizar con data.props por si acaso
        if (propsSource === 'node.props' && node.data) {
            node.data.props = targetProps;
        }
      };


      // Helper para procesar un estado entero
      // SIMPLIFICADO: Craft.js serializa como estructura PLANA {ROOT: {...}, nodeId1: {...}, nodeId2: {...}}
      const processStateForBundle = async (stateStr, sectionName, slug) => {
          // Parsear el estado (puede ser string u objeto)
          let stateObj = typeof stateStr === 'string' ? JSON.parse(stateStr) : stateStr;
          
          // Procesar Nodos para Imágenes (Offline Mode)
          // En Craft.js, todos los nodos están en el nivel raíz del objeto
          const allNodes = Object.values(stateObj);
          for (const node of allNodes) {
             await processImages(node);
          }
          
          return JSON.stringify(stateObj);
      };

      if (sectionsToExport.length > 0) {
          // ============================================
          // Exportación SPA (Single Page Application)
          // ============================================
          const routes = {};
          const sectionsList = [];
          let startRoute = '/';

          // Encontrar sección 'Inicio' para definir entry point
          const inicioSection = sectionsToExport.find(s => s.nameSeccion && s.nameSeccion.toLowerCase() === 'inicio');
          const firstSection = sectionsToExport[0];
          const entrySection = inicioSection || firstSection;

          for (const sec of sectionsToExport) {
              const rawName = sec.nameSeccion || 'Untitled';
              // Generar slug URL-friendly
              const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page-' + sec.id;
              
              // Procesar JSON de la sección (imágenes, normalización)
              const processedJson = await processStateForBundle(sec.json, rawName, slug);
              
              // Guardar en mapa de rutas
              routes[slug] = processedJson;
              
              // Guardar metadatos para navegación por nombre
              sectionsList.push({ name: rawName, slug: slug });
          }

          if (entrySection) {
              const startName = entrySection.nameSeccion || 'Untitled';
              const startSlug = startName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'page-' + entrySection.id;
              startRoute = '/' + startSlug;
          }

          // Generar index.html ÚNICO con el bundle de datos
          const htmlContent = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${siteSlug || 'Sitio Exportado'}</title>
    <link rel="stylesheet" href="craft-renderer-bundle.css" />
    <script>
      // Configuración de rutas SPA
      window.process = { env: { NODE_ENV: 'production' } };
      window.__CRAFT_ROUTES__ = ${JSON.stringify(routes)};
      window.__CRAFT_SECTIONS__ = ${JSON.stringify(sectionsList)};
      window.__CRAFT_START_ROUTE__ = "${startRoute}";
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script src="craft-renderer-bundle.js"></script>
  </body>
</html>`;

          zip.file('index.html', htmlContent);

      } else {
          // Exportación SINGLE PAGE (Legacy / Fallback)
          const currentState = query.serialize();
          // Parsear el estado (query.serialize devuelve string JSON)
          let stateObj = JSON.parse(currentState);
          
          // Procesar imágenes si exportWithImages está activo
          // En Craft.js, todos los nodos están en el nivel raíz del objeto (estructura plana)
          const allNodes = Object.values(stateObj);
          for (const node of allNodes) {
             await processImages(node);
          }
          
          // Escapar para insertar de forma segura en el HTML
          const serializedEscaped = JSON.stringify(JSON.stringify(stateObj));

          const htmlContent = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Export</title>
    <link rel="stylesheet" href="craft-renderer-bundle.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.global = window.global || window;
      window.process = { env: { NODE_ENV: 'production' } };
      window.__CRAFT_PAGE_STATE__ = JSON.parse(${serializedEscaped});
    </script>
    <script src="craft-renderer-bundle.js"></script>
  </body>
</html>`;
        zip.file('index.html', htmlContent);
      }


      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `site_export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setShowExportOptions(false);
      
      let msg = '✅ ZIP exportado exitosamente!';
      if (failedImages.length > 0) {
          msg += `\n\n⚠️ ${failedImages.length} imágenes no se pudieron descargar (quedaron como enlaces externos) por restricciones de seguridad (CORS).`;
          console.table(failedImages);
      }
      alert(msg);

    } catch (e) {
      console.error(e);
      alert('No se pudo exportar el ZIP: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFullExportClick = async () => {
     try {
         setIsExporting(true);
         const { data, error } = await supabase.from('Secciones').select('*').eq('site_id', siteId);
         if (error) throw error;
         if (!data || data.length === 0) throw new Error("No hay secciones en este sitio.");
         await performExport(data);
     } catch(e) {
         alert("Error obteniendo secciones: " + e.message);
         setIsExporting(false);
     }
  };

  const handleExport = () => {
    if (siteId) {
      setShowExportOptions(true);
    } else {
      if (confirm('¿Crear y descargar ZIP de esta sección solamente?')) {
        performExport([]);
      }
    }
  };


  const handleImport = () => { setShowImport(true); };
  const performImport = () => {
    try {
      actions.deserialize(importText);
      setShowImport(false);
      setImportText('');
    } catch(e) {
      setImportError('JSON inválido');
    }
  }

  const handleSaveAsComponent = async ({ name, tags = [], previewFile }) => {
    try {
      const serialized = query.serialize();
      const payload = { name, tags, previewFile, json: serialized, site_id: siteId };
      const res = await createComponent(payload);
      if (res.ok) {
        alert('Componente guardado');
        setShowSaveAsComponent(false);
      } else {
        alert('Error: ' + (res.error?.message || 'unknown'));
      }
    } catch (e) {
      console.error(e);
      alert('Error guardando componente');
    }
  }

  const handleBack = () => {
      // Si tenemos siteSlug, volvemos a la raíz con el filtro de sitio. Si no, a la raíz limpia.
      // NOTA: La ruta raíz '/' es donde vive Dashboard.jsx
      if (siteSlug) {
          navigate(`/?site=${siteSlug}`); 
      } else {
          navigate('/');
      }
  };

  // --- NEXUM STYLE (MODERNO) ---
  return (
    <div className="bg-white border-bottom d-flex align-items-center justify-content-between h-auto py-2" style={{ height: '72px', paddingLeft: '8px', paddingRight: '8px' }}>
      
      {/* IZQUIERDA: Back & Título */}
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-white border btn-sm p-2 shadow-sm" onClick={handleBack} title="Volver al Dashboard" style={{ borderRadius: '8px' }}>
            <i className="bi bi-arrow-left text-secondary"></i>
        </button>
        
        <div className="d-flex flex-column justify-content-center">
            <span className="fw-bold text-dark small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EDITANDO:</span>
            <span className="text-secondary fw-semibold small">{sectionName || 'Sin Nombre'}</span>
        </div>
      </div>

      {/* DERECHA: Acciones Principales */}
      <div className="d-flex align-items-center gap-3">
        
        <button 
            className="btn btn-white border fw-bold px-3 shadow-sm text-secondary" 
            onClick={handleExport}
            disabled={!enabled || isExporting}
            style={{ borderRadius: '6px', fontSize: '0.85rem', height: '38px', backgroundColor: '#fff' }}
            title="Exportar proyecto como ZIP"
        >
            <i className="bi bi-download me-2"></i>
            {isExporting ? '...' : 'Exportar'}
        </button>

        <button 
            className="btn btn-white border fw-bold px-4 shadow-sm text-secondary" 
            onClick={handlePreview} 
            disabled={!enabled || isPreviewing}
            style={{ borderRadius: '6px', fontSize: '0.85rem', height: '38px', backgroundColor: '#fff' }}
        >
            {isPreviewing ? 'Cargando...' : 'Previsualizar'}
        </button>
        
        <button 
            className="btn btn-outline-secondary fw-bold px-3 shadow-sm me-2" 
            onClick={() => navigate('/componentes-actualizables')}
            style={{ borderRadius: '6px', fontSize: '0.85rem', height: '38px' }}
            title="Componentes actualizables"
        >
            <i className="bi bi-puzzle" />
        </button>

        <button 
            className="btn text-white fw-bold px-4 shadow-sm" 
            onClick={handleSave} 
            disabled={!enabled || isSaving}
            style={{ backgroundColor: '#8b5cf6', border: 'none', borderRadius: '6px', fontSize: '0.85rem', height: '38px' }}
        >
            {isSaving ? 'Guardando...' : 'Guardar'}
        </button>

         {/* Mas Opciones Dropdown */}
         <div className="dropdown">
            <button className="btn btn-light btn-sm rounded-circle p-2" data-bs-toggle="dropdown" style={{ width: 32, height: 32, display: 'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><button className="dropdown-item py-2 small" onClick={handleImport}><i className="bi bi-braces me-2 text-primary opacity-75"></i> Importar JSON</button></li>
                <li><button className="dropdown-item py-2 small" onClick={() => setShowSaveAsComponent(true)}><i className="bi bi-patch-plus me-2 text-success opacity-85"></i> Guardar como componente</button></li>
                <li><hr className="dropdown-divider" /></li>
                 <li><button className="dropdown-item py-2 small text-danger" onClick={handleClear}><i className="bi bi-trash me-2"></i> Limpiar Lienzo</button></li>
            </ul>
        </div>
      </div>


      {showExportOptions && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white p-4 rounded shadow" style={{ width: '500px' }}>
                <h5 className="mb-3">Exportar Sitio Web</h5>
                <p className="small text-secondary mb-3">
                  Se exportarán todas las secciones asociadas al sitio.
                </p>
                
                <div className="alert alert-info py-2 small mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  La sección llamada <strong>"Inicio"</strong> se usará como página principal (index.html).
                </div>

                <div className="form-check mb-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="chkExportImages"
                    checked={exportWithImages}
                    onChange={(e) => setExportWithImages(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="chkExportImages">
                    Descargar imágenes y recursos (Modo Offline) <br/>
                    <span className="text-muted" style={{fontSize:'0.75rem'}}>Si se desactiva, las imágenes seguirán cargándose desde internet.</span>
                  </label>
                </div>
                
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowExportOptions(false)}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={handleFullExportClick} disabled={isExporting}>
                        {isExporting ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-file-earmark-zip me-2"/>}
                        {isExporting ? 'Exportando...' : 'Exportar Sitio Completo'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {showImport && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white p-4 rounded shadow" style={{ width: '500px' }}>
                <h5 className="mb-3">Importar Diseño</h5>
                <textarea 
                    className="form-control mb-3" 
                    rows={5} 
                    value={importText} 
                    onChange={e => setImportText(e.target.value)} 
                    placeholder="Pega el código JSON aquí..."
                    style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                ></textarea>
                {importError && <div className="text-danger small mb-3">{importError}</div>}
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(false)}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={performImport}>Importar</button>
                </div>
            </div>
        </div>
      )}

      {showSaveAsComponent && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 9999, background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white p-4 rounded shadow" style={{ width: '500px' }}>
                <h5 className="mb-3">Guardar como componente actualizable</h5>
                <div className="mb-2">
                  <label className="form-label">Nombre</label>
                  <input className="form-control form-control-sm" id="_component_name" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-control form-control-sm" id="_component_tags" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Preview</label>
                  <input type="file" accept="image/*" className="form-control form-control-sm" id="_component_preview" />
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowSaveAsComponent(false)}>Cancelar</button>
                    <button className="btn btn-primary btn-sm" onClick={async () => {
                        const name = document.getElementById('_component_name').value;
                        const tags = (document.getElementById('_component_tags').value || '').split(',').map(t => t.trim()).filter(Boolean);
                        const file = (document.getElementById('_component_preview').files || [])[0] || null;
                        await handleSaveAsComponent({ name, tags, previewFile: file });
                    }}>Guardar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
