import React, { useState, useEffect } from "react";
import { useNode } from "@craftjs/core";
import { SettingsTabs } from "../ui/SettingsTabs";

export const HeroBanner = ({ 
  title, 
  titleColor = "#ffffff", 
  backgroundColor = "#1a1a1a", 
  backgroundImage = "",
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

  return (
    <div 
      ref={ref => connect(drag(ref))}
      onClick={() => setEditable(true)}
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: height,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        width: '100%',
        position: 'relative',
        minHeight: '100px' // Ensure visibility
      }}
    >
      <div style={{
          content: '""',
          display: 'block',
          width: '6px',
          height: '60px',
          backgroundColor: accentColor,
          marginRight: '20px'
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
            width: '100%'
          }}
        />
      ) : (
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: titleColor,
          margin: 0
        }}>
          {title}
        </h1>
      )}
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
    accentColor: '#e65100',
    height: '200px'
  },
  related: {
    settings: HeroBannerSettings
  }
};
