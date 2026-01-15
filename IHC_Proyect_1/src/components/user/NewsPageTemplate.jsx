// components/user/NewsPageTemplate.jsx
// Plantilla completa de página de noticias/artículo
import React from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import { SettingsTabs } from '../ui/SettingsTabs';
import { Navbar } from './Navbar';
import { NewsArticle } from './NewsArticle';
import { BackgroundImageContainer } from './ImageContainer';

export const NewsPageTemplate = ({
  showNavbar = true,
  showArticle = true,
  // Navbar props
  navbarLogoText = 'Akaru',
  navbarBackgroundColor = '#1a1a1a',
  navbarItemColor = '#ffffff',
  navbarItemHoverColor = '#ff6b35',
  activeSection = 'Noticias',
  // Article props
  articleImageUrl = 'https://placehold.co/1280x720',
  articleTitle = 'Por qué la Amazonia no produce realmente el 20% del oxígeno del mundo',
  articleContent = 'El científico Michael Coe explicó que la Amazonia consume tanto oxígeno como produce, por lo que su contribución neta al oxígeno global es prácticamente cero. La selva amazónica es un ecosistema en equilibrio donde los árboles producen oxígeno durante el día mediante la fotosíntesis, pero también consumen oxígeno durante la noche para respirar.',
            articleLikeCount = 1000,
            articleCommentCount = 0,
            articleCommentButtonLink = '/forum',
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

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        position: 'relative',
        width: '100%',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
        zIndex: Number(zIndex) || 0,
        outline: selected ? '2px dashed #3b82f6' : undefined,
      }}
    >
      <Element is={BackgroundImageContainer} padding={0} background="#000000" canvas>
        {/* Navbar */}
        {showNavbar && (
          <Element is={Navbar}
            id="news-navbar"
            logoText={navbarLogoText}
            backgroundColor={navbarBackgroundColor}
            itemColor={navbarItemColor}
            itemHoverColor={navbarItemHoverColor}
            navItems={JSON.stringify([
              { label: "Foro", actionType: "section", sectionName: "foro", active: false },
              { label: "Tribus", actionType: "section", sectionName: "tribus", active: false },
              { label: "Fauna", actionType: "section", sectionName: "fauna", active: false },
              { label: "Flora", actionType: "section", sectionName: "flora", active: false },
              { label: "Usos", actionType: "section", sectionName: "usos", active: false },
              { label: "Agua", actionType: "section", sectionName: "agua", active: false },
              { label: "Cultura", actionType: "section", sectionName: "cultura", active: false },
              { label: "Geografia", actionType: "section", sectionName: "geografia", active: false },
              { label: "Inicio", actionType: "route", route: "/", active: false },
            ])}
          />
        )}

        {/* Indicador de sección activa */}
        {showNavbar && activeSection && (
          <div
            style={{
              paddingLeft: '60px',
              paddingTop: '20px',
              paddingBottom: '15px',
              backgroundColor: '#000000',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '18px',
                fontFamily: 'sans-serif',
                fontWeight: '600',
                borderBottom: '3px solid #ff6b35',
                paddingBottom: '8px',
                paddingLeft: '0',
                paddingRight: '0',
                cursor: 'default',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {activeSection}
            </button>
          </div>
        )}

        {/* Artículo de Noticias */}
        {showArticle && (
          <Element is={NewsArticle}
            id="news-article"
            imageUrl={articleImageUrl}
            title={articleTitle}
            content={articleContent}
            likeCount={articleLikeCount}
            commentCount={articleCommentCount}
            commentButtonLink={articleCommentButtonLink}
            backgroundColor="#000000"
            padding={60}
            titleFontSize={48}
            contentFontSize={18}
            imageHeight={500}
          />
        )}
      </Element>

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

const NewsPageTemplateSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: 'Secciones',
          content: (
            <div className="d-grid gap-2">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showNavbar}
                  onChange={(e) => setProp((p) => (p.showNavbar = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Navbar</label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showArticle}
                  onChange={(e) => setProp((p) => (p.showArticle = e.target.checked))}
                />
                <label className="form-check-label">Mostrar Artículo</label>
              </div>
            </div>
          )
        },
        {
          label: 'Navbar',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Texto del Logo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.navbarLogoText || 'Akaru'}
                  onChange={(e) => setProp((p) => (p.navbarLogoText = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Sección Activa</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.activeSection || 'Noticias'}
                  onChange={(e) => setProp((p) => (p.activeSection = e.target.value))}
                />
              </div>
            </div>
          )
        },
        {
          label: 'Artículo',
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">URL de Imagen</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.articleImageUrl || ''}
                  onChange={(e) => setProp((p) => (p.articleImageUrl = e.target.value))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="form-label">Título del Artículo</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={props.articleTitle || ''}
                  onChange={(e) => setProp((p) => (p.articleTitle = e.target.value))}
                />
              </div>
              <div>
                <label className="form-label">Contenido</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={5}
                  value={props.articleContent || ''}
                  onChange={(e) => setProp((p) => (p.articleContent = e.target.value))}
                />
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Likes</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={props.articleLikeCount || 0}
                    onChange={(e) => setProp((p) => (p.articleLikeCount = Number(e.target.value)))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Comentarios</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={props.articleCommentCount || 0}
                    onChange={(e) => setProp((p) => (p.articleCommentCount = Number(e.target.value)))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Link del Botón de Comentarios</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={props.articleCommentButtonLink || '/forum'}
                  onChange={(e) => setProp((p) => (p.articleCommentButtonLink = e.target.value))}
                  placeholder="/forum o https://..."
                />
                <small className="text-muted">Ruta interna (ej: /forum) o URL externa (ej: https://...)</small>
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
                <label className="form-label">Z-index</label>
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

NewsPageTemplate.craft = {
  displayName: 'Página de Noticias Completa',
  props: {
    showNavbar: true,
    showArticle: true,
    navbarLogoText: 'Akaru',
    navbarBackgroundColor: '#1a1a1a',
    navbarItemColor: '#ffffff',
    navbarItemHoverColor: '#ff6b35',
    activeSection: 'Noticias',
    articleImageUrl: 'https://placehold.co/1280x720',
    articleTitle: 'Por qué la Amazonia no produce realmente el 20% del oxígeno del mundo',
    articleContent: 'El científico Michael Coe explicó que la Amazonia consume tanto oxígeno como produce, por lo que su contribución neta al oxígeno global es prácticamente cero. La selva amazónica es un ecosistema en equilibrio donde los árboles producen oxígeno durante el día mediante la fotosíntesis, pero también consumen oxígeno durante la noche para respirar.',
    articleLikeCount: 1000,
    articleCommentCount: 0,
    articleCommentButtonLink: '/forum',
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1,
  },
  related: {
    settings: NewsPageTemplateSettings
  }
};
