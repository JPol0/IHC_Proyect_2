// components/user/Navbar.jsx
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useNavigate } from "react-router-dom";

export const Navbar = ({
  // Logo props
  logoText = "Akaru",
  logoImageUrl = "",
  showLogo = true,
  showLogoText = true,
  logoSize = 32,
  logoTextSize = 22,
  logoTextColor = "#ffffff",
  
  // Navigation items (JSON string for Craft.js compatibility)
  navItems = JSON.stringify([
    { label: "Foro", actionType: "section", sectionName: "foro" },
    { label: "Tribus", actionType: "section", sectionName: "tribus" },
    { label: "Fauna", actionType: "section", sectionName: "fauna" },
    { label: "Flora", actionType: "section", sectionName: "flora" },
    { label: "Usos", actionType: "section", sectionName: "usos" },
    { label: "Agua", actionType: "section", sectionName: "agua" },
    { label: "Cultura", actionType: "section", sectionName: "cultura" },
    { label: "Geografía", actionType: "section", sectionName: "geografia" }
  ]),
  
  // Styling
  backgroundColor = "#1a1a1a",
  itemColor = "#ffffff",
  itemHoverColor = "#ff6b35",
  activeItemColor = "#ff6b35",
  itemFontSize = 14,
  itemSpacing = 24,
  paddingX = 32,
  paddingY = 16,
  
  // Layout
  layout = "horizontal", // 'horizontal' | 'vertical'
  logoPosition = "left", // 'left' | 'center' | 'right'
  itemsPosition = "center", // 'left' | 'center' | 'right'
  
  // Separator
  showSeparator = true,
  separatorColor = "#666666",
  
  // Positioning
  translateX = 0,
  translateY = 0,
  zIndex = 100,
  opacity = 1,
  
  // Size
  width = "100%",
  height = "auto",
  
  // Sticky
  isSticky = false,
}) => {
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  const { actions: { add, selectNode }, query: { createNode, node } } = useEditor();
  const navigate = useNavigate();
  
  // Parse navItems
  let parsedItems = [];
  try {
    parsedItems = typeof navItems === 'string' ? JSON.parse(navItems) : navItems;
  } catch (e) {
    parsedItems = [];
  }
  
  const handleItemClick = (item, e) => {
    e.preventDefault();
    
    if (item.actionType === 'section') {
      const site = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site') : null;
      const qs = new URLSearchParams();
      if (site) qs.set('site', site);
      if (item.sectionName) qs.set('section', item.sectionName);
      const target = item.sectionName ? `/editor?${qs.toString()}` : '';
      if (!target) return;
      navigate(target);
      return;
    }
    
    if (item.actionType === 'external') {
      const url = (item.externalUrl || '').trim();
      if (!url) return;
      if (typeof window !== 'undefined') {
        window.open(url, item.newTab ? '_blank' : '_self');
      }
      return;
    }
    
    // Default: internal route
    const route = (item.route || '').trim();
    if (route) {
      if (route.startsWith('#')) {
        const el = document.querySelector(route);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      navigate(route);
    }
  };
  
  const containerStyle = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor,
    padding: `${paddingY}px ${paddingX}px`,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
    opacity: Math.max(0, Math.min(1, Number(opacity) || 1)),
    position: isSticky ? 'sticky' : 'relative',
    top: isSticky ? 0 : 'auto',
    zIndex: Number(zIndex) || 100,
    boxSizing: 'border-box',
    outline: selected ? '2px dashed #3b82f6' : undefined,
  };
  
  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    order: logoPosition === 'right' ? 2 : 0,
  };
  
  const navContainerStyle = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: `${itemSpacing}px`,
    justifyContent: itemsPosition === 'center' ? 'center' : 
                    itemsPosition === 'right' ? 'flex-end' : 'flex-start',
    flex: 1,
  };
  
  const getItemStyle = (isFirst) => ({
    color: itemColor,
    fontSize: `${itemFontSize}px`,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: showSeparator && !isFirst ? `${itemSpacing}px` : '0',
  });
  
  const separatorStyle = {
    color: separatorColor,
    fontSize: `${itemFontSize}px`,
    userSelect: 'none',
  };

  return (
    <nav
      ref={ref => connect(drag(ref))}
      style={containerStyle}
    >
      {/* Logo Section - Imagen y texto son independientes */}
      {(showLogo || showLogoText) && (
        <div style={logoContainerStyle}>
          {/* Logo image o icono por defecto */}
          {showLogo && (
            logoImageUrl ? (
              <img 
                src={logoImageUrl} 
                alt={logoText}
                style={{ 
                  height: `${logoSize}px`, 
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <svg 
                width={logoSize} 
                height={logoSize} 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <path 
                  d="M12 2L2 20h20L12 2z" 
                  stroke={logoTextColor} 
                  strokeWidth="2" 
                  fill="none"
                />
                <path 
                  d="M12 8L7 16h10L12 8z" 
                  stroke={logoTextColor} 
                  strokeWidth="1.5" 
                  fill="none"
                />
              </svg>
            )
          )}
          {/* Logo text - independiente de la imagen */}
          {showLogoText && logoText && (
            <span style={{ 
              color: logoTextColor, 
              fontSize: `${logoTextSize}px`,
              fontWeight: 'bold',
              letterSpacing: '1px'
            }}>
              {logoText}
            </span>
          )}
        </div>
      )}
      
      {/* Navigation Items */}
      <div style={navContainerStyle}>
        {parsedItems.map((item, index) => (
          <React.Fragment key={index}>
            {showSeparator && index > 0 && (
              <span style={separatorStyle}>|</span>
            )}
            <a
              href="#"
              style={getItemStyle(index === 0)}
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = itemHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = itemColor;
              }}
            >
              {item.label}
            </a>
          </React.Fragment>
        ))}
      </div>
      
      {/* Duplicate button when selected */}
      {selected && (
        <span
          role="button"
          aria-label="Duplicar"
          className="position-absolute"
          style={{
            top: -14,
            right: -14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#590004',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px #590004, 0 0 12px #590004',
            cursor: 'pointer',
            zIndex: 9999,
          }}
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
            const idx = Math.max(0, siblings.indexOf(id));
            const shiftedProps = {
              ...props,
              translateX: (Number(props.translateX) || 0) + 10,
              translateY: (Number(props.translateY) || 0) + 10,
            };
            const newNode = createNode(React.createElement(type, shiftedProps));
            add(newNode, parent, idx + 1);
            selectNode(newNode.id);
          }}
        >
          <i className="bi bi-copy" />
        </span>
      )}
    </nav>
  );
};

// Settings panel for Navbar
const NavbarSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));
  
  // Parse current items
  let currentItems = [];
  try {
    currentItems = typeof props.navItems === 'string' ? JSON.parse(props.navItems) : (props.navItems || []);
  } catch (e) {
    currentItems = [];
  }
  
  const updateItems = (newItems) => {
    setProp((p) => (p.navItems = JSON.stringify(newItems)));
  };
  
  const addItem = () => {
    const newItems = [...currentItems, { 
      label: "Nuevo", 
      actionType: "section", 
      sectionName: "",
      route: "",
      externalUrl: "",
      newTab: true
    }];
    updateItems(newItems);
  };
  
  const removeItem = (index) => {
    const newItems = currentItems.filter((_, i) => i !== index);
    updateItems(newItems);
  };
  
  const updateItem = (index, field, value) => {
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateItems(newItems);
  };
  
  const moveItem = (index, direction) => {
    const newItems = [...currentItems];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    updateItems(newItems);
  };

  return (
    <>
      <div className="d-grid gap-3">
        {/* Logo Settings */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Logo</h6>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <div className="form-check">
                <input
                  id="navbar-show-logo"
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showLogo !== false}
                  onChange={(e) => setProp((p) => (p.showLogo = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="navbar-show-logo">Mostrar icono/imagen</label>
              </div>
            </div>
            <div className="col-6">
              <div className="form-check">
                <input
                  id="navbar-show-logo-text"
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showLogoText !== false}
                  onChange={(e) => setProp((p) => (p.showLogoText = e.target.checked))}
                />
                <label className="form-check-label" htmlFor="navbar-show-logo-text">Mostrar texto</label>
              </div>
            </div>
          </div>
          <div className="mb-2">
            <label className="form-label">Texto del logo</label>
            <input
              className="form-control form-control-sm"
              type="text"
              value={props.logoText || ''}
              onChange={(e) => setProp((p) => (p.logoText = e.target.value))}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">URL imagen logo (opcional)</label>
            <input
              className="form-control form-control-sm"
              type="text"
              value={props.logoImageUrl || ''}
              onChange={(e) => setProp((p) => (p.logoImageUrl = e.target.value))}
              placeholder="https://..."
            />
            <small className="text-muted">Si se proporciona, reemplaza el icono por defecto</small>
          </div>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label">Tamaño icono/imagen</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.logoSize || 32}
                onChange={(e) => setProp((p) => (p.logoSize = Number(e.target.value)))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Tamaño texto</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.logoTextSize || 22}
                onChange={(e) => setProp((p) => (p.logoTextSize = Number(e.target.value)))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Color texto logo</label>
            <input
              type="color"
              className="form-control form-control-color form-control-sm"
              value={props.logoTextColor || '#ffffff'}
              onChange={(e) => setProp((p) => (p.logoTextColor = e.target.value))}
            />
          </div>
        </div>
        
        {/* Styling */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Estilos</h6>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label">Fondo</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={props.backgroundColor || '#1a1a1a'}
                onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Color items</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={props.itemColor || '#ffffff'}
                onChange={(e) => setProp((p) => (p.itemColor = e.target.value))}
              />
            </div>
          </div>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label">Color hover</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={props.itemHoverColor || '#ff6b35'}
                onChange={(e) => setProp((p) => (p.itemHoverColor = e.target.value))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Color activo</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={props.activeItemColor || '#ff6b35'}
                onChange={(e) => setProp((p) => (p.activeItemColor = e.target.value))}
              />
            </div>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Tamaño fuente</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.itemFontSize || 14}
                onChange={(e) => setProp((p) => (p.itemFontSize = Number(e.target.value)))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Espaciado items</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.itemSpacing || 24}
                onChange={(e) => setProp((p) => (p.itemSpacing = Number(e.target.value)))}
              />
            </div>
          </div>
        </div>
        
        {/* Separator */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Separador</h6>
          <div className="form-check mb-2">
            <input
              id="navbar-show-sep"
              className="form-check-input"
              type="checkbox"
              checked={props.showSeparator !== false}
              onChange={(e) => setProp((p) => (p.showSeparator = e.target.checked))}
            />
            <label className="form-check-label" htmlFor="navbar-show-sep">Mostrar separadores</label>
          </div>
          <div>
            <label className="form-label">Color separador</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={props.separatorColor || '#666666'}
              onChange={(e) => setProp((p) => (p.separatorColor = e.target.value))}
            />
          </div>
        </div>
        
        {/* Layout */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Disposición</h6>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label">Padding horizontal</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.paddingX || 32}
                onChange={(e) => setProp((p) => (p.paddingX = Number(e.target.value)))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Padding vertical</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={props.paddingY || 16}
                onChange={(e) => setProp((p) => (p.paddingY = Number(e.target.value)))}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="form-label">Posición logo</label>
            <select
              className="form-select form-select-sm"
              value={props.logoPosition || 'left'}
              onChange={(e) => setProp((p) => (p.logoPosition = e.target.value))}
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label">Posición items</label>
            <select
              className="form-select form-select-sm"
              value={props.itemsPosition || 'center'}
              onChange={(e) => setProp((p) => (p.itemsPosition = e.target.value))}
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="form-check">
            <input
              id="navbar-sticky"
              className="form-check-input"
              type="checkbox"
              checked={!!props.isSticky}
              onChange={(e) => setProp((p) => (p.isSticky = e.target.checked))}
            />
            <label className="form-check-label" htmlFor="navbar-sticky">Navbar fijo (sticky)</label>
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Items de navegación</h6>
          <div className="d-grid gap-2 mb-3">
            {currentItems.map((item, index) => (
              <div key={index} className="card card-body p-2 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong className="small">Item {index + 1}</strong>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === currentItems.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeItem(index)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => updateItem(index, 'label', e.target.value)}
                    placeholder="Etiqueta"
                  />
                </div>
                <div className="mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={item.actionType || 'section'}
                    onChange={(e) => updateItem(index, 'actionType', e.target.value)}
                  >
                    <option value="section">Ir a sección</option>
                    <option value="route">Ruta interna</option>
                    <option value="external">Enlace externo</option>
                  </select>
                </div>
                {item.actionType === 'section' && (
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={item.sectionName || ''}
                    onChange={(e) => updateItem(index, 'sectionName', e.target.value)}
                    placeholder="Nombre de sección"
                  />
                )}
                {item.actionType === 'route' && (
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={item.route || ''}
                    onChange={(e) => updateItem(index, 'route', e.target.value)}
                    placeholder="/ruta"
                  />
                )}
                {item.actionType === 'external' && (
                  <div className="d-grid gap-1">
                    <input
                      className="form-control form-control-sm"
                      type="text"
                      value={item.externalUrl || ''}
                      onChange={(e) => updateItem(index, 'externalUrl', e.target.value)}
                      placeholder="https://..."
                    />
                    <div className="form-check">
                      <input
                        id={`item-newtab-${index}`}
                        className="form-check-input"
                        type="checkbox"
                        checked={item.newTab !== false}
                        onChange={(e) => updateItem(index, 'newTab', e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor={`item-newtab-${index}`}>
                        Abrir en nueva pestaña
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm w-100"
            onClick={addItem}
          >
            + Agregar item
          </button>
        </div>
        
        {/* Positioning */}
        <div className="border-bottom pb-3">
          <h6 className="mb-3">Posición</h6>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <label className="form-label">Mover X (px)</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={Number.isFinite(props.translateX) ? props.translateX : 0}
                onChange={(e) => setProp((p) => (p.translateX = Number(e.target.value)))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Mover Y (px)</label>
              <input
                className="form-control form-control-sm"
                type="number"
                value={Number.isFinite(props.translateY) ? props.translateY : 0}
                onChange={(e) => setProp((p) => (p.translateY = Number(e.target.value)))}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="form-label">Z-index</label>
            <input
              className="form-control form-control-sm"
              type="number"
              value={props.zIndex || 100}
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
        
        {/* Size */}
        <div>
          <h6 className="mb-3">Tamaño</h6>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Ancho</label>
              <input
                className="form-control form-control-sm"
                type="text"
                value={props.width ?? '100%'}
                onChange={(e) => {
                  const v = e.target.value;
                  setProp((p) => (p.width = v === '' ? '100%' : (isNaN(Number(v)) ? v : Number(v))));
                }}
                placeholder="100% o 960"
              />
            </div>
            <div className="col-6">
              <label className="form-label">Alto</label>
              <input
                className="form-control form-control-sm"
                type="text"
                value={props.height ?? 'auto'}
                onChange={(e) => {
                  const v = e.target.value;
                  setProp((p) => (p.height = v === '' ? 'auto' : (isNaN(Number(v)) ? v : Number(v))));
                }}
                placeholder="auto o 60"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Default props
export const NavbarDefaultProps = {
  logoText: "Akaru",
  logoImageUrl: "",
  showLogo: true,
  showLogoText: true,
  logoSize: 32,
  logoTextSize: 22,
  logoTextColor: "#ffffff",
  navItems: JSON.stringify([
    { label: "Foro", actionType: "section", sectionName: "foro" },
    { label: "Tribus", actionType: "section", sectionName: "tribus" },
    { label: "Fauna", actionType: "section", sectionName: "fauna" },
    { label: "Flora", actionType: "section", sectionName: "flora" },
    { label: "Usos", actionType: "section", sectionName: "usos" },
    { label: "Agua", actionType: "section", sectionName: "agua" },
    { label: "Cultura", actionType: "section", sectionName: "cultura" },
    { label: "Geografía", actionType: "section", sectionName: "geografia" }
  ]),
  backgroundColor: "#1a1a1a",
  itemColor: "#ffffff",
  itemHoverColor: "#ff6b35",
  activeItemColor: "#ff6b35",
  itemFontSize: 14,
  itemSpacing: 24,
  paddingX: 32,
  paddingY: 16,
  layout: "horizontal",
  logoPosition: "left",
  itemsPosition: "center",
  showSeparator: true,
  separatorColor: "#666666",
  translateX: 0,
  translateY: 0,
  zIndex: 100,
  opacity: 1,
  width: "100%",
  height: "auto",
  isSticky: false,
};

Navbar.craft = {
  props: NavbarDefaultProps,
  displayName: "Navbar",
  related: {
    settings: NavbarSettings
  }
};
