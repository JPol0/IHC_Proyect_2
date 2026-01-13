// components/user/Navbar.jsx
import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useNavigate } from "react-router-dom";
import { useUploadImage } from "../../hooks/useUploadImage";

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

  const { upload, isUploading } = useUploadImage("Assets");
  
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
    <SettingsTabs
      tabs={[
        {
          label: "Logo",
          content: (
            <div className="d-grid gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showLogo !== false}
                  onChange={(e) => setProp((p) => (p.showLogo = e.target.checked))}
                />
                <label className="form-check-label">Mostrar imagen</label>
              </div>

              {props.showLogo !== false && (
                <>
                  <div>
                    <label className="form-label">Imagen</label>
                    <div className="d-flex gap-2">
                       <input
                        className="form-control form-control-sm"
                        type="file"
                        accept="image/*"
                         onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await upload(file);
                          if (url) setProp((p) => (p.logoImageUrl = url));
                        }}
                        disabled={isUploading}
                      />
                    </div>
                    {isUploading && <div className="text-info small mt-1">Subiendo...</div>}
                    {props.logoImageUrl && (
                      <div className="mt-2">
                        <img 
                          src={props.logoImageUrl} 
                          alt="Logo preview" 
                          style={{ height: '30px', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Tamaño imagen (px)</label>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      value={props.logoSize || 32}
                      onChange={(e) => setProp((p) => (p.logoSize = Number(e.target.value)))}
                    />
                  </div>
                </>
              )}

              <hr />

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.showLogoText !== false}
                  onChange={(e) => setProp((p) => (p.showLogoText = e.target.checked))}
                />
                <label className="form-check-label">Mostrar texto</label>
              </div>

              {props.showLogoText !== false && (
                <>
                  <div>
                    <label className="form-label">Texto del Logo</label>
                    <input
                      className="form-control form-control-sm"
                      type="text"
                      value={props.logoText || ''}
                      onChange={(e) => setProp((p) => (p.logoText = e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Tamaño texto (px)</label>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      value={props.logoTextSize || 22}
                      onChange={(e) => setProp((p) => (p.logoTextSize = Number(e.target.value)))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Color texto</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={props.logoTextColor || '#ffffff'}
                      onChange={(e) => setProp((p) => (p.logoTextColor = e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          )
        },
        {
          label: "Menú",
          content: (
            <div className="d-grid gap-3">
              <label className="form-label mb-0">Elementos del menú</label>
              <div className="border rounded p-2 bg-light">
                <div className="d-grid gap-2">
                  {currentItems.map((item, index) => (
                    <div key={index} className="card p-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => moveItem(index, 1)}
                            disabled={index === currentItems.length - 1}
                          >
                            ↓
                          </button>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      
                      <div className="mb-2">
                        <input
                          className="form-control form-control-sm"
                          placeholder="Etiqueta"
                          value={item.label}
                          onChange={(e) => updateItem(index, 'label', e.target.value)}
                        />
                      </div>

                      <div className="mb-2">
                        <select
                          className="form-select form-select-sm"
                          value={item.actionType || 'none'}
                          onChange={(e) => updateItem(index, 'actionType', e.target.value)}
                        >
                          <option value="none">Sin acción</option>
                          <option value="section">Ir a Sección</option>
                          <option value="external">Link Externo</option>
                          <option value="route">Ruta Interna</option>
                        </select>
                      </div>

                      {item.actionType === 'section' && (
                        <input
                          className="form-control form-control-sm mb-2"
                          placeholder="Nombre sección (ej: foro)"
                          value={item.sectionName || ''}
                          onChange={(e) => updateItem(index, 'sectionName', e.target.value)}
                        />
                      )}

                      {item.actionType === 'external' && (
                        <div className="d-grid gap-1">
                          <input
                            className="form-control form-control-sm mb-2"
                            placeholder="URL (https://...)"
                            value={item.externalUrl || ''}
                            onChange={(e) => updateItem(index, 'externalUrl', e.target.value)}
                          />
                           <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={item.newTab !== false}
                              onChange={(e) => updateItem(index, 'newTab', e.target.checked)}
                            />
                            <label className="form-check-label small">Nueva pestaña</label>
                          </div>
                        </div>
                      )}
                      
                      {item.actionType === 'route' && (
                        <input
                          className="form-control form-control-sm mb-2"
                          placeholder="Ruta (ej: /login)"
                          value={item.route || ''}
                          onChange={(e) => updateItem(index, 'route', e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn btn-sm btn-primary w-100 mt-2"
                  onClick={addItem}
                >
                  <i className="bi bi-plus-circle me-1"></i> Agregar Item
                </button>
              </div>
            </div>
          )
        },
        {
          label: "Diseño",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Color Fondo</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={props.backgroundColor}
                  onChange={(e) => setProp((p) => (p.backgroundColor = e.target.value))}
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Color Items</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.itemColor}
                    onChange={(e) => setProp((p) => (p.itemColor = e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Color Hover</label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.itemHoverColor}
                    onChange={(e) => setProp((p) => (p.itemHoverColor = e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Tamaño Fuente</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={props.itemFontSize}
                  onChange={(e) => setProp((p) => (p.itemFontSize = Number(e.target.value)))}
                />
              </div>

              <div>
                <label className="form-label">Espaciado Items</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={props.itemSpacing}
                  onChange={(e) => setProp((p) => (p.itemSpacing = Number(e.target.value)))}
                />
              </div>

              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={props.isSticky}
                  onChange={(e) => setProp((p) => (p.isSticky = e.target.checked))}
                />
                <label className="form-check-label">Pegajoso (Sticky)</label>
              </div>
            </div>
          )
        },
        {
          label: "Avanzado",
          content: (
            <div className="d-grid gap-3">
              <div>
                <label className="form-label">Padding Y / X</label>
                <div className="input-group input-group-sm">
                  <input
                    className="form-control"
                    type="number"
                    value={props.paddingY}
                    onChange={(e) => setProp((p) => (p.paddingY = Number(e.target.value)))}
                    placeholder="Y"
                  />
                  <input
                    className="form-control"
                    type="number"
                    value={props.paddingX}
                    onChange={(e) => setProp((p) => (p.paddingX = Number(e.target.value)))}
                    placeholder="X"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Separador</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    className="form-check-input m-0"
                    type="checkbox"
                    checked={props.showSeparator !== false}
                    onChange={(e) => setProp((p) => (p.showSeparator = e.target.checked))}
                  />
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={props.separatorColor}
                    onChange={(e) => setProp((p) => (p.separatorColor = e.target.value))}
                    disabled={!props.showSeparator}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Z-Index</label>
                <input
                  className="form-control form-control-sm"
                  type="number"
                  value={props.zIndex}
                  onChange={(e) => setProp((p) => (p.zIndex = Number(e.target.value)))}
                />
              </div>

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
                  />
                </div>
              </div>
            </div>
          )
        }
      ]}
    />
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
