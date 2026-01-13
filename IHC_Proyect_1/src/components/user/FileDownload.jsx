import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useUploadImage } from '../../hooks/useUploadImage';
import IconPicker from '../ui/IconPicker';
import { SettingsTabs } from "../ui/SettingsTabs";

/**
 * FileDownload
 * - Permite subir un archivo a un bucket de Supabase (por defecto "Assets").
 * - Muestra un botón/enlace que, al hacer clic en el sitio exportado, abre/descarga el archivo.
 */
export const FileDownload = ({
  text = 'Descargar archivo',
  fileUrl = '',
  suggestedName = '',
  // Estilo como en Button
  variant = 'contained', // 'text' | 'outlined' | 'contained'
  color = 'primary', // token bootstrap
  buttonTextColor = '',
  buttonBgColor = '',
  buttonBorderColor = '',
  size = 'medium', // small|medium|large
  iconName = 'download', // bootstrap icon name
  // posicionamiento
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
}) => {
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected,
  } = useNode((node) => ({ selected: node.events.selected }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();

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

  // Estilos similares al Button
  const colorToken = (color || 'primary').toLowerCase();
  const isOutline = variant === 'outlined';
  const isLink = variant === 'text';
  const hasCustomColors = !!(buttonTextColor || buttonBgColor || buttonBorderColor);
  const base = hasCustomColors
    ? 'btn'
    : (isLink ? 'btn btn-link' : `btn ${isOutline ? 'btn-outline-' : 'btn-'}${colorToken}`);
  const sizeCls = size === 'large' ? 'btn-lg' : size === 'small' ? 'btn-sm' : '';
  const classes = [base, sizeCls].filter(Boolean).join(' ');

  const style = {
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    position: 'relative',
    zIndex: Number(zIndex) || 0,
  };

  if (hasCustomColors) {
    if (isLink) {
      style.backgroundColor = 'transparent';
      if (buttonTextColor) style.color = buttonTextColor;
      style.border = 'none';
    } else if (isOutline) {
      style.backgroundColor = 'transparent';
      if (buttonTextColor) style.color = buttonTextColor;
      style.borderStyle = 'solid';
      style.borderWidth = 1;
      if (buttonBorderColor) style.borderColor = buttonBorderColor;
      else if (buttonTextColor) style.borderColor = buttonTextColor;
    } else {
      if (buttonBgColor) style.backgroundColor = buttonBgColor;
      if (buttonTextColor) style.color = buttonTextColor;
      style.borderStyle = 'solid';
      style.borderWidth = 1;
      if (buttonBorderColor) style.borderColor = buttonBorderColor;
      else if (buttonBgColor) style.borderColor = buttonBgColor;
    }
  }

  // Si hay fileUrl, renderizamos <a> para soportar atributo download
  const content = (
    <>
      {iconName && <i className={`bi bi-${iconName} me-1`} aria-hidden="true" />}
      <span>{text}</span>
    </>
  );

  return (
    <div ref={(ref) => connect(drag(ref))}>
      {fileUrl ? (
        <a
          href={fileUrl}
          className={classes}
          style={style}
          target="_blank"
          rel="noopener noreferrer"
          download={suggestedName || true}
        >
          {content}
        </a>
      ) : (
        <button type="button" className={classes} style={style} disabled>
          {content}
        </button>
      )}

      
      {/* Nuevo Toolbar */}
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

export const FileDownloadSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
  const { upload, isUploading, error } = useUploadImage('Assets');

  return (
    <SettingsTabs
      tabs={[
        {
          label: "Contenido",
          content: (
            <div className="d-grid gap-3">
              <IconPicker
                label="Icono"
                selectedIcon={props.iconName}
                onSelect={(iconName) => setProp((p) => (p.iconName = iconName))}
              />

              <div>
                <label className="form-label">Texto del botón</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.text || ''}
                  onChange={(e) => setProp((p) => (p.text = e.target.value))}
                  placeholder="Descargar archivo"
                />
              </div>
              
              <hr />

              <div>
                <label className="form-label">URL del archivo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.fileUrl || ''}
                  onChange={(e) => setProp((p) => (p.fileUrl = e.target.value))}
                  placeholder="https://..."
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                  Sube un archivo o pega una URL.
                </small>
              </div>

              <div>
                <label className="form-label">Subir archivo</label>
                <input
                  className="form-control form-control-sm"
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await upload(file);
                    if (url) {
                      setProp((p) => {
                        p.fileUrl = url;
                        p.suggestedName = file.name || '';
                      });
                    }
                  }}
                  disabled={isUploading}
                />
                {isUploading && <div className="text-info small mt-1">Subiendo...</div>}
                {error && <div className="text-danger small mt-1">{String(error)}</div>}
              </div>

              <div>
                <label className="form-label">Nombre sugerido</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.suggestedName || ''}
                  onChange={(e) => setProp((p) => (p.suggestedName = e.target.value))}
                  placeholder="archivo.pdf"
                />
              </div>
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Variante</label>
                  <select
                    className="form-select form-select-sm"
                    value={props.variant || 'contained'}
                    onChange={(e) => setProp((p) => (p.variant = e.target.value))}
                  >
                    <option value="text">Texto</option>
                    <option value="outlined">Con borde</option>
                    <option value="contained">Relleno</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Tamaño</label>
                  <select
                    className="form-select form-select-sm"
                    value={props.size || 'medium'}
                    onChange={(e) => setProp((p) => (p.size = e.target.value))}
                  >
                    <option value="small">Pequeño</option>
                    <option value="medium">Mediano</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Color base</label>
                <select
                  className="form-select form-select-sm"
                  value={props.color || 'primary'}
                  onChange={(e) => setProp((p) => (p.color = e.target.value))}
                >
                  <option value="primary">Principal</option>
                  <option value="secondary">Secundario</option>
                  <option value="success">Éxito</option>
                  <option value="danger">Peligro</option>
                  <option value="warning">Advertencia</option>
                  <option value="info">Información</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>

              <hr className="my-1"/>
              <label className="form-label small text-muted">Personalizado</label>

              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small">Texto</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonTextColor || '#ffffff'}
                    onChange={(e) => setProp((p) => (p.buttonTextColor = e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small">Fondo</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonBgColor || '#0d6efd'}
                    onChange={(e) => setProp((p) => (p.buttonBgColor = e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small">Borde</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.buttonBorderColor || '#0d6efd'}
                    onChange={(e) => setProp((p) => (p.buttonBorderColor = e.target.value))}
                  />
                </div>
              </div>
            </div>
          )
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Mover X</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateX) ? props.translateX : 0}
                    onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Mover Y</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={Number.isFinite(props.translateY) ? props.translateY : 0}
                    onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Z-Index</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={Number.isFinite(props.zIndex) ? props.zIndex : 0}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="form-label">Opacidad</label>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number.isFinite(props.opacity) ? props.opacity : 1}
                  onChange={(e) => setProp((p) => (p.opacity = Number(e.target.value)))}
                />
                <div className="small text-muted">{(props.opacity ?? 1).toFixed(2)}</div>
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

FileDownload.craft = {
  displayName: 'Descarga Archivo',
  props: {
    text: 'Descargar archivo',
    fileUrl: '',
    suggestedName: '',
    variant: 'contained',
    color: 'primary',
    buttonTextColor: '',
    buttonBgColor: '',
    buttonBorderColor: '',
    size: 'medium',
    iconName: 'download',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: FileDownloadSettings,
  },
};
