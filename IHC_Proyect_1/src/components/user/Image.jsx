import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { uploadImage } from '../../../SupabaseCredentials';
import { useState, useEffect } from 'react';
import {useUploadImage} from '../../hooks/useUploadImage';
import { useNavigate } from 'react-router-dom';
import { useSectionNames } from '../../hooks/useSectionNames';

var handleFileChange;
var uploading = false;

export const Image = ({
  src = 'https://placehold.co/1200x500',
  alt = 'Imagen',
  width = 100,
  height = null,
  fit = 'cover',
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
  // Click behavior like Button
  actionType = 'section', // 'route' | 'section' | 'external'
  to = '', // internal route or #anchor
  sectionName = '', // for section navigation
  externalUrl = '', // for external link
  externalNewTab = true,
}) => {

  const { id, connectors: { connect, drag }, actions: {setProp}, selected } = useNode((node) => ({
    props: node.data.props,
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
  const navigate = useNavigate();

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = Number(translateX) || 0;
    const initialY = Number(translateY) || 0;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setProp((props) => {
        props.translateX = initialX + deltaX;
        props.translateY = initialY + deltaY;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (actionType === 'section') {
      // Preservar el sitio actual en la URL del editor
      const site = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site') : null;
      const qs = new URLSearchParams();
      if (site) qs.set('site', site);
      if (sectionName) qs.set('section', sectionName);
      const target = sectionName ? `/editor?${qs.toString()}` : '';
      if (!target) return;
      if (target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(target);
      return;
    }
    if (actionType === 'external') {
      const url = (externalUrl || '').trim();
      if (!url) return;
      if (typeof window !== 'undefined') {
        window.open(url, externalNewTab ? '_blank' : '_self');
      }
      return;
    }
    const route = (to || '').trim();
    if (route) {
      if (route.startsWith('#')) {
        const el = document.querySelector(route);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(route);
    }
  };

  // Eliminado: manejo de movimiento por arrastre del mouse

  const actionable = (
    (actionType === 'route' && (to || '').trim()) ||
    (actionType === 'section' && (sectionName || '').trim()) ||
    (actionType === 'external' && (externalUrl || '').trim())
  );

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 0)),
        position: 'relative',
        zIndex: Number(zIndex) || 0,
        cursor: actionable ? 'pointer' : 'default',
      }}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={alt}
        style={{ display: 'block', width: `${width}%`, height: Number.isFinite(height) ? `${height}px` : 'auto', objectFit: fit, borderRadius: 4 }}
      />

      
      {selected && (
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
             {/* Move */}
             <i 
                className="bi bi-arrows-move" 
                title="Mover"
                style={{ cursor: 'move', fontSize: '1.4rem' }}
                onMouseDown={handleMouseDown}
             />

             {/* Duplicate */}
             <i 
                className="bi bi-copy"
                title="Duplicar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={(e) => {
                  e.preventDefault();
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

             {/* Delete */}
             <i 
                className="bi bi-trash" 
                title="Eliminar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    deleteNode(id);
                }}
             />
         </div>
      )}
    </div>
  );
};

export function ImageSettings() {
  // Obtener props actuales y setProp desde Craft
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const {upload, isUploading, error} = useUploadImage("Assets");
  const { names: sectionNames, loading: sectionsLoading } = useSectionNames();
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(!props.sectionName); // Expandido por defecto si no hay sección seleccionada

  // Sincronizar el estado de expansión cuando cambia la sección seleccionada
  useEffect(() => {
    if (!props.sectionName) {
      setIsExpanded(true); // Expandir si se elimina la sección
    }
  }, [props.sectionName]);

  // Filtrar secciones basado en el término de búsqueda
  const filteredSections = sectionNames.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return(
    <SettingsTabs
      tabs={[
        {
          label: "Imagen",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de la imagen</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.src ?? ''}
                  onChange={(e) => setProp((props) => (props.src = e.target.value))}
                  placeholder="https://..."
                />
              </div>

               <div>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  accept='image/*'
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    const url = await upload(file);
                    if (url) setProp((p) => (p.src = url));
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo imagen...</div>}
              </div>

              <div>
                <label className="form-label">Texto alternativo</label>
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={props.alt ?? ''}
                  onChange={(e) => setProp((props) => (props.alt = e.target.value))}
                  placeholder="Descripción"
                />
              </div>

              <div>
                <label className="form-label">Ancho (%)</label>
                <input
                  type="range"
                  className="form-range"
                  min={10}
                  max={100}
                  step={1}
                  value={typeof props.width === 'number' ? props.width : 100}
                  onChange={(e) => setProp((props) => (props.width = Number(e.target.value)))}
                />
                <div className="small text-muted">{props.width ?? 100}%</div>
              </div>
              <div>
                <label className="form-label">Alto (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={0}
                  step={1}
                  value={Number.isFinite(props.height) ? props.height : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setProp((p) => (p.height = v === '' ? null : Number(v)));
                  }}
                  placeholder="vacío = auto"
                />
                <div className="small text-muted">Deja vacío para mantener altura automática</div>
              </div>
              <div>
                <label className="form-label">Ajuste de imagen</label>
                <select
                  className="form-select form-select-sm"
                  value={props.fit || 'cover'}
                  onChange={(e) => setProp((props) => (props.fit = e.target.value))}
                >
                  <option value="contain">Contener (Contain)</option>
                  <option value="cover">Cubrir (Cover)</option>
                  <option value="fill">Estirar (Fill)</option>
                  <option value="none">Original (None)</option>
                  <option value="scale-down">Reducir (Scale-down)</option>
                </select>
              </div>
            </div>
          )
        },
        {
          label: "Interacción",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Acción al hacer clic</label>
                <select
                  className="form-select form-select-sm"
                  value={props.actionType || 'section'}
                  onChange={(e) => setProp((p) => (p.actionType = e.target.value))}
                >
                  <option value="section">Ir a sección</option>
                  <option value="external">Enlace externo</option>
                </select>
              </div>
              { (props.actionType || 'section') === 'section' && (
                <div>
                  <label className="form-label">Seleccionar sección</label>
                  {props.sectionName && !isExpanded ? (
                    <div
                      className="form-control form-control-sm d-flex justify-content-between align-items-center"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setIsExpanded(true)}
                    >
                      <span>{props.sectionName}</span>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  ) : (
                    <>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Buscar sección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={sectionsLoading}
                      />
                      {sectionsLoading ? (
                        <div className="text-muted small mt-2">Cargando secciones...</div>
                      ) : (
                        <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem' }}>
                          {filteredSections.length === 0 ? (
                            <div className="text-muted small p-2 text-center">No se encontraron secciones</div>
                          ) : (
                            filteredSections.map((name) => (
                              <div
                                key={name}
                                className={`p-2 ${props.sectionName === name ? 'bg-primary text-white' : 'bg-white'} ${props.sectionName !== name ? 'hover-bg-light' : ''}`}
                                style={{
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #dee2e6',
                                  transition: 'background-color 0.2s'
                                }}
                                onClick={() => {
                                  setProp((p) => (p.sectionName = name));
                                  setSearchTerm('');
                                  setIsExpanded(false); // Colapsar después de seleccionar
                                }}
                                onMouseEnter={(e) => {
                                  if (props.sectionName !== name) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (props.sectionName !== name) {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                  }
                                }}
                              >
                                {name}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              { (props.actionType || 'route') === 'external' && (
                <div className="row g-2">
                  <div className="col-8">
                    <label className="form-label">URL externa</label>
                    <input
                      className="form-control form-control-sm"
                      type="text"
                      value={props.externalUrl ?? ''}
                      onChange={(e) => setProp((p) => (p.externalUrl = e.target.value))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-4 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        id="img-ext-newtab"
                        className="form-check-input"
                        type="checkbox"
                        checked={!!props.externalNewTab}
                        onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
                      />
                      <label className="form-check-label" htmlFor="img-ext-newtab">Nueva pestaña</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Opacidad</label>
                <input
                  className="form-range"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number.isFinite(props.opacity) ? props.opacity : 1}
                  onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                />
                <div className="small text-muted">{(props.opacity ?? 1).toFixed(2)}</div>
              </div>
              <div>
                <label className="form-label">Nivel de profundidad (Z-index)</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover horizontal</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                    placeholder="px"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover vertical</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                    placeholder="px"
                  />
                </div>
              </div>
            </div>
          )
        }
      ]}
    />
  )
}

Image.craft = {
  displayName: 'Imagen',
  props: {
    src: 'https://placehold.co/1200x500',
    alt: 'Imagen',
    width: 100,
    height: null,
    fit: 'cover',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
    actionType: 'section',
    to: '',
    sectionName: '',
    externalUrl: '',
    externalNewTab: true,
  },
  related:{
    settings: ImageSettings
  }
};
