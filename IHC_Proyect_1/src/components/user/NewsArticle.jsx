// components/user/NewsArticle.jsx
// Componente para mostrar un artículo de noticias individual
import React, { useState } from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Text } from './Text';
import { Image } from './Image';
import { Container } from './Container';
import { LikeButton } from './LikeButton';
import { ForumButton } from './ForumButton';

export const NewsArticle = ({
  // Contenido del artículo
  imageUrl = 'https://placehold.co/1280x720',
  title = 'Por qué la Amazonia no produce realmente el 20% del oxígeno del mundo',
  titleColor = '#ffffff',
  titleFontSize = 48,
  content = 'El científico Michael Coe explicó que la Amazonia consume tanto oxígeno como produce, por lo que su contribución neta al oxígeno global es prácticamente cero. La selva amazónica es un ecosistema en equilibrio donde los árboles producen oxígeno durante el día mediante la fotosíntesis, pero también consumen oxígeno durante la noche para respirar.',
  contentColor = '#ffffff',
  contentFontSize = 18,
  lineHeight = 1.6,
  
  // Estilos
  backgroundColor = '#1a1a1a',
  padding = 60,
  accentColor = '#ff6b35',
  
  // Imagen
  imageHeight = 500,
  imagePosition = 'center',
  
  // Botones laterales
  showLikeButton = true,
  likeCount = 1000,
  showCommentButton = true,
  commentCount = 0,
  commentButtonLink = '/forum',
  showBackButton = true,
  
  // Separador
  showSeparator = true,
  separatorColor = '#ff6b35',
  separatorHeight = 2,
  
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
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  
  // Función para manejar clicks en los botones
  const handleButtonClick = (callback) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Ejecutar siempre, pero en modo edición también prevenir la selección del componente
    callback();
  };
  
  // Función para prevenir la propagación del evento
  const handleMouseDownStop = (e) => {
    e.stopPropagation();
  };

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

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: backgroundColor,
        padding: `${padding}px`,
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        zIndex: Number(zIndex) || 0,
        outline: selected ? '2px dashed #3b82f6' : undefined,
      }}
    >
      {/* Botones laterales izquierdos */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          alignItems: 'center',
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {showBackButton && (
          <button
            onClick={handleButtonClick(() => {
              navigate('/');
            })}
            onMouseDown={handleMouseDownStop}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
              opacity: 1,
              pointerEvents: 'auto',
              zIndex: 1000,
            }}
            onMouseEnter={(e) => {
              if (!enabled) {
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!enabled) {
                e.currentTarget.style.opacity = '1';
              }
            }}
            title="Volver al Homepage"
          >
            <i className="bi bi-arrow-left"></i>
          </button>
        )}
        
        {showLikeButton && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <button
              onClick={handleButtonClick(() => {
                setIsLiked(!isLiked);
                setCurrentLikeCount(prev => isLiked ? prev - 1 : prev + 1);
              })}
              onMouseDown={handleMouseDownStop}
              style={{
                background: 'transparent',
                border: 'none',
                color: isLiked ? '#ff0000' : '#ffffff',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s, transform 0.2s',
                opacity: 1,
                pointerEvents: 'auto',
                zIndex: 1000,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Me gusta"
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
            <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
              {currentLikeCount >= 1000 ? `${(currentLikeCount / 1000).toFixed(1)}k` : currentLikeCount}
            </span>
          </div>
        )}
        
        {showCommentButton && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <button
              onClick={handleButtonClick(() => {
                if (commentButtonLink && commentButtonLink.startsWith('http')) {
                  window.open(commentButtonLink, '_blank');
                } else {
                  navigate(commentButtonLink || '/forum');
                }
              })}
              onMouseDown={handleMouseDownStop}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: enabled ? 'default' : 'pointer',
                fontSize: '24px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s',
                opacity: enabled ? 0.7 : 1,
                pointerEvents: enabled ? 'none' : 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              title="Ir al Foro"
            >
              <i className="bi bi-chat-dots"></i>
            </button>
            {commentCount > 0 && (
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                {commentCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Imagen destacada */}
        <div
          style={{
            width: '100%',
            height: `${imageHeight}px`,
            marginBottom: '40px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: imagePosition,
            }}
          />
        </div>

        {/* Título */}
        <h1
          style={{
            color: titleColor,
            fontSize: `${titleFontSize}px`,
            fontWeight: 'bold',
            marginBottom: '20px',
            lineHeight: 1.2,
            fontFamily: 'sans-serif',
          }}
        >
          {title}
        </h1>

        {/* Separador */}
        {showSeparator && (
          <div
            style={{
              width: '100%',
              height: `${separatorHeight}px`,
              backgroundColor: separatorColor,
              marginBottom: '30px',
            }}
          />
        )}

        {/* Contenido del artículo */}
        <div
          style={{
            color: contentColor,
            fontSize: `${contentFontSize}px`,
            lineHeight: lineHeight,
            fontFamily: 'sans-serif',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      </div>

      {/* Indicador de selección */}
      {selected && id !== 'ROOT' && (
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
          <i
            className="bi bi-arrows-move"
            title="Mover"
            style={{ cursor: 'move', fontSize: '1.4rem' }}
            onMouseDown={handleMouseDown}
          />
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

const NewsArticleSettings = () => {
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
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.imageUrl || ''}
                  onChange={(e) => setProp((p) => (p.imageUrl = e.target.value))}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="form-label">Título del Artículo</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={props.title || ''}
                  onChange={(e) => setProp((p) => (p.title = e.target.value))}
                  placeholder="Título del artículo..."
                />
              </div>
              
              <div>
                <label className="form-label">Contenido del Artículo</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={8}
                  value={props.content || ''}
                  onChange={(e) => setProp((p) => (p.content = e.target.value))}
                  placeholder="Contenido del artículo..."
                />
              </div>
              
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Likes</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={props.likeCount || 0}
                    onChange={(e) => setProp((p) => (p.likeCount = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Comentarios</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={props.commentCount || 0}
                    onChange={(e) => setProp((p) => (p.commentCount = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Link del Botón de Comentarios</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.commentButtonLink || '/forum'}
                  onChange={(e) => setProp((p) => (p.commentButtonLink = e.target.value))}
                  placeholder="/forum o https://..."
                />
                <small className="text-muted">Ruta interna (ej: /forum) o URL externa (ej: https://...)</small>
              </div>
            </div>
          )
        },
        {
          label: 'Estilos',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color de Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor || '#1a1a1a'}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Título</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.titleColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.titleColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Tamaño del Título</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.titleFontSize || 48}
                  onChange={(e) => setProp((p) => (p.titleFontSize = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Contenido</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.contentColor || '#ffffff'}
                  onChange={(e) => setProp((p) => (p.contentColor = e.target.value))}
                />
              </div>
              
              <div>
                <label className="form-label">Tamaño del Contenido</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.contentFontSize || 18}
                  onChange={(e) => setProp((p) => (p.contentFontSize = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Altura de la Imagen</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.imageHeight || 500}
                  onChange={(e) => setProp((p) => (p.imageHeight = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Padding</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={props.padding || 60}
                  onChange={(e) => setProp((p) => (p.padding = Number(e.target.value)))}
                />
              </div>
              
              <div>
                <label className="form-label">Color del Separador</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.separatorColor || '#ff6b35'}
                  onChange={(e) => setProp((p) => (p.separatorColor = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Botones',
          content: (
            <div className="d-grid gap-2">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showBackButton}
                  onChange={(e) => setProp((p) => (p.showBackButton = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Botón Volver</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showLikeButton}
                  onChange={(e) => setProp((p) => (p.showLikeButton = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Botón Like</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showCommentButton}
                  onChange={(e) => setProp((p) => (p.showCommentButton = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Botón Comentarios</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showSeparator}
                  onChange={(e) => setProp((p) => (p.showSeparator = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Separador</label>
              </div>
            </div>
          )
        },
        {
          label: 'Avanzado',
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

NewsArticle.craft = {
  displayName: 'Artículo de Noticias',
  props: {
    imageUrl: 'https://placehold.co/1280x720',
    title: 'Por qué la Amazonia no produce realmente el 20% del oxígeno del mundo',
    titleColor: '#ffffff',
    titleFontSize: 48,
    content: 'El científico Michael Coe explicó que la Amazonia consume tanto oxígeno como produce, por lo que su contribución neta al oxígeno global es prácticamente cero. La selva amazónica es un ecosistema en equilibrio donde los árboles producen oxígeno durante el día mediante la fotosíntesis, pero también consumen oxígeno durante la noche para respirar.',
    contentColor: '#ffffff',
    contentFontSize: 18,
    lineHeight: 1.6,
    backgroundColor: '#1a1a1a',
    padding: 60,
    accentColor: '#ff6b35',
    imageHeight: 500,
    imagePosition: 'center',
    showLikeButton: true,
    likeCount: 1000,
    showCommentButton: true,
    commentCount: 0,
    commentButtonLink: '/forum',
    showBackButton: true,
    showSeparator: true,
    separatorColor: '#ff6b35',
    separatorHeight: 2,
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: NewsArticleSettings
  }
};
