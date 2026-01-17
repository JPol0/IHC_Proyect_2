import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useNavigate } from 'react-router-dom';

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
  
  // Link props (standardized with Button)
  actionType = 'none', // 'none', 'route', 'section', 'external'
  to = '', // route path
  sectionName = '', // search param for section '?section=name'
  externalUrl = '', // for external links
  externalNewTab = false,
}) => {

  const { id, connectors: { connect, drag }, actions: {setProp}, selected } = useNode((node) => ({
    props: node.data.props,
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node }, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  
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
    if (enabled) return; // Disable in editor

    if (actionType === 'section') {
      const site = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site') : null;
      const qs = new URLSearchParams();
      if (site) qs.set('site', site);
      if (sectionName) qs.set('section', sectionName);
      const target = sectionName ? `/editor?${qs.toString()}` : '';

      if (!target) return;
      navigate(target);
      return;
    }
    
    // External link
    if (actionType === 'external') {
      const url = (externalUrl || '').trim();
      if (!url) return;
      if (typeof window !== 'undefined') {
        window.open(url, externalNewTab ? '_blank' : '_self');
      }
      return;
    }

    // Default: internal route
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
        width: `${width}%`, 
        height: Number.isFinite(height) ? `${height}px` : 'auto',
      }}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={alt}
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%', 
          objectFit: fit, 
          borderRadius: 4 
        }}
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
              <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                <label className="form-label fw-bold mb-2">
                  <i className="bi bi-link-45deg me-1"></i> Acción al hacer clic
                </label>
                
                <div className="mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={props.actionType || 'none'}
                    onChange={(e) => setProp((p) => (p.actionType = e.target.value))}
                  >
                    <option value="none">Sin acción</option>
                    <option value="section">Ir a Sección</option>
                    <option value="external">Link Externo</option>
                    <option value="route">Ruta Interna</option>
                  </select>
                </div>
                
                {props.actionType === 'section' && (
                  <input
                    className="form-control form-control-sm"
                    placeholder="Nombre sección (ej: foro, fauna)"
                    value={props.sectionName || ''}
                    onChange={(e) => setProp((p) => (p.sectionName = e.target.value))}
                  />
                )}
                
                {props.actionType === 'external' && (
                  <div className="d-grid gap-2">
                    <input
                      className="form-control form-control-sm"
                      placeholder="URL (https://...)"
                      value={props.externalUrl || ''}
                      onChange={(e) => setProp((p) => (p.externalUrl = e.target.value))}
                    />
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={props.externalNewTab !== false}
                        onChange={(e) => setProp((p) => (p.externalNewTab = e.target.checked))}
                      />
                      <label className="form-check-label small">Abrir en nueva pestaña</label>
                    </div>
                  </div>
                )}
                
                {props.actionType === 'route' && (
                  <div>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Ruta (ej: /login o #seccion)"
                      value={props.to || ''}
                      onChange={(e) => setProp((p) => (p.to = e.target.value))}
                    />
                    <small className="text-muted">Usa # para ir a una sección de la página</small>
                  </div>
                )}
              </div>
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
    actionType: 'none',
    to: '',
    sectionName: '',
    externalUrl: '',
    externalNewTab: false,
  },
  related:{
    settings: ImageSettings
  }
};
