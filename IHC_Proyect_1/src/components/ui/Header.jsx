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
        alert('El navegador bloqueó la ventana de previsualización.');
        return;
      }
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error('Error al previsualizar:', e);
      alert('No se pudo abrir la previsualización.');
    } finally {
      actions.setOptions((opts) => (opts.enabled = true));
      setIsPreviewing(false);
    }
  };

  const handleExport = async () => {
    try {
      if (!confirm('Crear y descargar ZIP?')) return;
      setIsExporting(true);
      const state = query.serialize();
      
      const indexRes = await fetch('/index.html');
      const indexText = await indexRes.text();
      const cssRes = await fetch('/craft-renderer-bundle.css');
      const cssText = await cssRes.text();
      const jsRes = await fetch('/craft-renderer-bundle.js');
      const jsText = await jsRes.text();

      const zip = new JSZip();
      zip.file('craft-renderer-bundle.css', cssText);
      zip.file('craft-renderer-bundle.js', jsText);

      const doc = new DOMParser().parseFromString(indexText, 'text/html');
      const scriptTags = doc.querySelectorAll('script');
      scriptTags.forEach(s => {
          if (s.src && s.src.includes('src/main.jsx')) s.remove();
      });
      const scriptState = doc.createElement('script');
      scriptState.textContent = `window.__CRAFT_PAGE_STATE__ = ${JSON.stringify(JSON.parse(state))};`;
      doc.body.appendChild(scriptState);

      const scriptBundle = doc.createElement('script');
      scriptBundle.src = './craft-renderer-bundle.js';
      doc.body.appendChild(scriptBundle);

      const linkCSS = doc.createElement('link');
      linkCSS.rel = 'stylesheet';
      linkCSS.href = './craft-renderer-bundle.css';
      doc.head.appendChild(linkCSS);

      zip.file('index.html', doc.documentElement.outerHTML);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website-export.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

     } catch(e) {
         console.error('Error al exportar:', e);
         alert('No se pudo exportar el ZIP.');
     } finally {
         setIsExporting(false);
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
      // Check auth first
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData || !userData.user) {
        alert('Debes iniciar sesión para guardar componentes.');
        return;
      }

      const serialized = query.serialize();
      const payload = { name, tags, previewFile, json: serialized, site_id: siteId, owner_id: userData.user.id };
      const res = await createComponent(payload);
      if (res.ok) {
        alert('Componente guardado');
        setShowSaveAsComponent(false);
      } else {
        console.error('Create component failed:', res.error);
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
        
        {/* Removed direct link to Componentes Actualizables from editor header.
          Access is now available from the Dashboard main page. */}

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
