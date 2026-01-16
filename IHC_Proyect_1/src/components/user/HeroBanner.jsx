import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";
import { SettingsTabs } from "../ui/SettingsTabs";

export const HeroBanner = ({ 
  title, 
  titleColor = "#ffffff", 
  backgroundColor = "#1a1a1a", 
  backgroundImage = "",
  backgroundOverlay = 0.4,
  accentColor = "#e65100", 
  height = "200px" 
}) => {
  const { connectors: { connect, drag }, hasSelectedNode, actions: { setProp } } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (!hasSelectedNode) setEditable(false);
  }, [hasSelectedNode]);

  // Verificar si hay imagen de fondo válida
  const hasBackgroundImage = backgroundImage && backgroundImage.trim() !== '';

  return (
    <div 
      ref={ref => connect(drag(ref))}
      onClick={() => setEditable(true)}
      style={{
        position: 'relative',
        height: height,
        width: '100%',
        minHeight: '100px',
        overflow: 'hidden'
      }}
    >
      {/* Capa de fondo con color o imagen */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundColor,
          ...(hasBackgroundImage && {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          })
        }}
      />
      
      {/* Overlay oscuro para mejorar legibilidad del texto */}
      {hasBackgroundImage && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${backgroundOverlay})`,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* Contenido principal */}
      <div 
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px'
        }}
      >
        <div style={{
            display: 'block',
            width: '6px',
            height: '60px',
            backgroundColor: accentColor,
            marginRight: '20px',
            flexShrink: 0
        }}></div>
        
        {editable ? (
          <input 
            type="text" 
            value={title} 
            onChange={(e) => {
               const val = e.target.value;
               setProp(props => props.title = val);
            }}
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: titleColor,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              textShadow: hasBackgroundImage ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
            }}
          />
        ) : (
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: titleColor,
            margin: 0,
            textShadow: hasBackgroundImage ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
          }}>
            {title}
          </h1>
        )}
      </div>
    </div>
  );
};

export const HeroBannerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <SettingsTabs 
      tabs={[
        {
          label: 'Contenido',
          content: (
            <div>
              <div className="mb-3">
                <label className="form-label">Texto del Título</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={props.title || ''} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setProp(p => p.title = value);
                  }} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Color del Texto</label>
                <input 
                  type="color" 
                  className="form-control form-control-color" 
                  value={props.titleColor || '#ffffff'} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setProp(p => p.titleColor = value);
                  }} 
                />
              </div>
            </div>
          )
        },
        {
          label: 'Estilo',
          content: (
            <div>
              <div className="mb-3">
                <label className="form-label">Color de Fondo</label>
                <input 
                  type="color" 
                  className="form-control form-control-color" 
                  value={props.backgroundColor || '#1a1a1a'} 
                  onChange={(e) => {
                     const value = e.target.value;
                     setProp(p => p.backgroundColor = value);
                  }} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Imagen de Fondo (URL)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={props.backgroundImage || ''} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setProp(p => p.backgroundImage = value);
                  }}
                  placeholder="https://example.com/image.jpg" 
                />
                <small className="text-muted" style={{fontSize: '0.75rem'}}>
                  Pega aquí la URL de la imagen
                </small>
              </div>
              {props.backgroundImage && (
                <div className="mb-3">
                  <label className="form-label">Oscurecimiento del Overlay: {Math.round((props.backgroundOverlay || 0.4) * 100)}%</label>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={props.backgroundOverlay || 0.4} 
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setProp(p => p.backgroundOverlay = value);
                    }} 
                  />
                  <small className="text-muted" style={{fontSize: '0.75rem'}}>
                    Ajusta la oscuridad sobre la imagen para mejorar legibilidad
                  </small>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Color de la Barra (Acento)</label>
                <input 
                  type="color" 
                  className="form-control form-control-color" 
                  value={props.accentColor || '#e65100'} 
                  onChange={(e) => {
                     const value = e.target.value;
                     setProp(p => p.accentColor = value);
                  }} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Altura</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={props.height || '200px'} 
                  onChange={(e) => {
                     const value = e.target.value;
                     setProp(p => p.height = value);
                  }} 
                />
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

HeroBanner.craft = {
  displayName: 'Hero Banner',
  props: {
    title: 'lorem ipsum',
    titleColor: '#ffffff',
    backgroundColor: '#1a1a1a',
    backgroundImage: '',
    backgroundOverlay: 0.4,
    accentColor: '#e65100',
    height: '200px'
  },
  related: {
    settings: HeroBannerSettings
  }
};
