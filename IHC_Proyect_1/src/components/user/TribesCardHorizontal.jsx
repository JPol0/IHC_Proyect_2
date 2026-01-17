// components/user/TribesCardHorizontal.jsx
// Versión horizontal del card de Tribus, imagen a la izquierda, texto a la derecha
import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { useNavigate } from 'react-router-dom';

export const TribesCardHorizontal = ({
  imageUrl = 'https://placehold.co/400x300',
  title = 'Título del Card',
  titleColor = '#000000',
  titleFontSize = 18,
  buttonText = 'LEER',
  buttonColor = '#000000',
  buttonTextColor = '#ffffff',
  buttonHoverColor = '#ff6b35',

  // New standardized link props
  actionType = 'none', // 'none', 'route', 'section', 'external'
  route = '', // internal route path
  sectionName = '', // for section navigation
  externalUrl = '', // for external links
  newTab = false,

  // Legacy (for migration)
  linkUrl,
  linkNewTab,

  // Estilos
  backgroundColor = '#ffffff',
  borderRadius = 8,
  padding = 0,
  // imageHeight en este caso podría controlar el ancho de la imagen o altura general
  imageWidthPercent = 50, 
  minHeight = 150,
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
}) => {
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node }, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  
  const navigate = useNavigate();

  // Migration for legacy props
  React.useEffect(() => {
    if (linkUrl) {
      if (linkUrl.startsWith('http')) {
        setProp(props => {
          props.actionType = 'external';
          props.externalUrl = linkUrl;
          props.newTab = !!linkNewTab;
          props.linkUrl = undefined;
          props.linkNewTab = undefined;
        });
      } else {
        setProp(props => {
          props.actionType = 'route';
          props.route = linkUrl;
          props.linkUrl = undefined;
        });
      }
    }
  }, [linkUrl, linkNewTab, setProp]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent navigation in editor mode
    if (enabled) return;

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

    if (actionType === 'external') {
      const url = (externalUrl || '').trim();
      if (!url) return;
      window.open(url, newTab ? '_blank' : '_self');
      return;
    }

    if (actionType === 'route') {
      const r = (route || '').trim();
      if (!r) return;
      if (r.startsWith('#')) {
        const el = document.querySelector(r);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(r);
    }
  };


  const handleMouseDownStop = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        width: '100%',
        backgroundColor: backgroundColor,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        minHeight: `${minHeight}px`,
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        zIndex: Number(zIndex) || 0,
        outline: selected ? '2px dashed #3b82f6' : undefined,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Imagen (Izquierda) */}
      <div
        style={{
          width: `${imageWidthPercent}%`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      {/* Contenido (Derecha) */}
      <div 
        style={{ 
          width: `${100 - imageWidthPercent}%`,
          padding: `${padding || 20}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        {/* Título */}
        <h3
          style={{
            color: titleColor,
            fontSize: `${titleFontSize}px`,
            fontWeight: '600',
            marginBottom: '15px',
            marginTop: 0,
            fontFamily: 'sans-serif',
            lineHeight: '1.2',
          }}
        >
          {title}
        </h3>

        {/* Botón LEER */}
        <button
          onClick={handleButtonClick}
          onMouseDown={handleMouseDownStop}
          style={{
            background: 'transparent',
            color: buttonTextColor,
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: 'auto'
          }}
        >
          <span style={{ borderBottom: `2px solid ${buttonTextColor}` }}>
            {buttonText}
          </span>
          <i className="bi bi-list" style={{ fontSize: '18px' }}></i>
        </button>
      </div>
    </div>
  );
};

export const TribesCardHorizontalSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Contenido',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.title}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.imageUrl}
                  onChange={(e) => setProp((p) => (p.imageUrl = e.target.value))}
                />
              </div>

              {/* Sistema de navegación */}
              <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                <label className="form-label fw-bold mb-2">
                  <i className="bi bi-link-45deg me-1"></i> Acción del Botón
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
                        checked={props.newTab !== false}
                        onChange={(e) => setProp((p) => (p.newTab = e.target.checked))}
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
                      value={props.route || ''}
                      onChange={(e) => setProp((p) => (p.route = e.target.value))}
                    />
                    <small className="text-muted">Usa # para ir a una sección de la página</small>
                  </div>
                )}
              </div>
            </div>
          )
        },
        {
          label: 'Estilo',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Ancho de Imagen (%)</label>
                <input
                  type="range"
                  className="form-range"
                  min="20"
                  max="80"
                  step="5"
                  value={props.imageWidthPercent}
                  onChange={(e) => setProp((p) => (p.imageWidthPercent = Number(e.target.value)))}
                />
                 <div className="small text-muted">{props.imageWidthPercent}%</div>
              </div>

               <div>
                <label className="form-label">Color de Fondo</label>
                 <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color form-control-sm"
                      value={props.backgroundColor}
                      onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                    />
                    <input 
                        type="text"
                        className="form-control form-control-sm"
                        value={props.backgroundColor}
                        onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                    />
                </div>
              </div>
              
              <div>
                <label className="form-label">Color del Título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.titleColor}
                  onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                />
              </div>
              
               <div>
                <label className="form-label">Tamaño Título (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.titleFontSize}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
              </div>

               <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.padding || 20}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Border Radius</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.borderRadius || 8}
                  onChange={(e) => setProp((p) => (p.borderRadius = Number(e.target.value)))}
                />
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

TribesCardHorizontal.craft = {
  displayName: 'Card Tribus Horiz.',
  props: {
    imageUrl: 'https://placehold.co/400x300',
    title: 'Título del Card',
    titleColor: '#000000',
    titleFontSize: 20,
    buttonText: 'LEER',
    buttonColor: '#000000',
    buttonTextColor: '#000000',
    buttonHoverColor: '#ff6b35',
    actionType: 'none',
    sectionName: '',
    externalUrl: '',
    route: '',
    newTab: false,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    imageWidthPercent: 50,
    minHeight: 180,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: TribesCardHorizontalSettings
  }
};
