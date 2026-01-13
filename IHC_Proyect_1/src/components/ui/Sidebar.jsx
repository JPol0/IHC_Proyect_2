import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSectionNames } from "../../hooks/useSectionNames";
import { createSection } from "../../hooks/useCreateSection";
import { deleteSection } from "../../hooks/useDeleteSection";
import { renameSection } from "../../hooks/useRenameSection";
import { pasteSection } from "../../hooks/usePasteSection";
import { hasClipboard } from "../../hooks/useCopyPasteSection";
import { getFolders, createFolder, deleteFolder, moveSectionToFolder, getSectionFolderId, getSectionsByFolder } from "../../hooks/useFolders";
import SectionMenu from "./SectionMenu";
import { getSiteIdBySlug } from "../../hooks/useSites";

const Sidebar = ({ items = [] }) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const qp = new URLSearchParams(search);
  const currentSection = qp.get("section");
  const siteSlug = qp.get("site") || null;
  const [siteId, setSiteId] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!siteSlug) { setSiteId(null); return; }
      const id = await getSiteIdBySlug(siteSlug);
      if (!cancelled) setSiteId(id);
    }
    load();
    return () => { cancelled = true };
  }, [siteSlug]);
  const { names, loading, error, refetch } = useSectionNames(siteId);
  const isEditorActive = pathname === "/editor";
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState([]);
  const [sectionFolderMap, setSectionFolderMap] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [draggedSection, setDraggedSection] = useState(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Cargar carpetas y mapeo de secciones
  useEffect(() => {
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names]);

  const loadFolders = async () => {
    const foldersData = await getFolders();
    setFolders(foldersData);
    
    // Cargar mapeo de secciones a carpetas
    const mapping = {};
    names.forEach((name) => {
      const folderId = getSectionFolderId(name);
      if (folderId) {
        mapping[name] = folderId;
      }
    });
    setSectionFolderMap(mapping);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const initialJson = { ROOT: { type: { resolvedName: 'BackgroundImageContainer' }, isCanvas: true, props: { padding: 10, background: '#f5f5f5' }, displayName: 'BackgroundImageContainer', custom: {}, hidden: false, nodes: [], linkedNodes: {} } };
  const result = await createSection(name, initialJson, siteId);
    if (result.ok) {
      setNewName("");
      await refetch();
    } else if (result.code === 'exists') {
      alert('La sección ya existe.');
    } else {
      console.error('No se pudo crear la sección', result.error);
      alert('Error creando la sección');
    }
    setCreating(false);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Nombre de la carpeta:');
    if (!folderName || !folderName.trim()) return;

    const result = await createFolder(folderName.trim());
    if (result.ok) {
      await loadFolders();
    } else {
      alert('Error creando la carpeta');
    }
  };
  
  const handlePaste = async (newSectionName) => {
  const result = await pasteSection(newSectionName, siteId);
    if (result.ok) {
      await refetch();
    } else if (result.code === 'exists') {
      alert('Ya existe una sección con ese nombre.');
    } else {
      alert('Error pegando la sección');
    }
    return result;
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('¿Eliminar esta carpeta? Las secciones dentro se moverán a la raíz.')) return;
    
  const result = await deleteFolder(folderId, siteId);
    if (result.ok) {
      await loadFolders();
      await refetch();
    } else {
      alert('Error eliminando la carpeta');
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, sectionName) => {
    setDraggedSection(sectionName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, folderId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDraggedOverFolder(null);
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    if (draggedSection) {
  const result = await moveSectionToFolder(draggedSection, folderId, siteId);
      if (result.ok) {
        await loadFolders();
      } else {
        alert('Error moviendo la sección');
      }
    }
    setDraggedSection(null);
    setDraggedOverFolder(null);
  };

  const handleDropRoot = async (e) => {
    e.preventDefault();
    if (draggedSection) {
  const result = await moveSectionToFolder(draggedSection, null, siteId);
      if (result.ok) {
        await loadFolders();
      } else {
        alert('Error moviendo la sección');
      }
    }
    setDraggedSection(null);
    setDraggedOverFolder(null);
  };

  // Manejar menú contextual (clic derecho)
  const handleContextMenu = (e, folderId = null) => {
    e.preventDefault();
    if (!hasClipboard()) return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId,
    });
  };

  const handleContextMenuPaste = async () => {
    if (!contextMenu) return;
    
    const newName = prompt('Nombre para la nueva sección:');
    if (!newName || !newName.trim()) {
      setContextMenu(null);
      return;
    }

    const result = await handlePaste(newName.trim());
    if (result && result.ok && contextMenu.folderId) {
      // Si se pegó en una carpeta, mover la sección a esa carpeta
      await moveSectionToFolder(newName.trim(), contextMenu.folderId, siteId);
      await loadFolders();
    } else if (result && result.ok) {
      await refetch();
      await loadFolders();
    }
    
    setContextMenu(null);
  };

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  const filteredNames = names.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Organizar secciones por carpeta
  const sectionsByFolder = {};
  const rootSections = [];

  filteredNames.forEach((name) => {
    const folderId = sectionFolderMap[name];
    if (folderId) {
      if (!sectionsByFolder[folderId]) {
        sectionsByFolder[folderId] = [];
      }
      sectionsByFolder[folderId].push(name);
    } else {
      rootSections.push(name);
    }
  });

  return (
    <aside className="w-100 h-100" style={{ overflowX: 'hidden', overflowY: 'auto', padding: '16px', paddingRight: '20px' }}>
      <div className="d-flex justify-content-start mb-3">
        <div className="text-center w-100" style={{ overflowX: 'hidden', paddingRight: '12px' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="fw-semibold text-xl">Secciones</div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={refetch}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>

          {/* Form para crear una nueva sección */}
          <form className="d-flex gap-2 mb-3" onSubmit={handleCreate}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Nueva sección"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={creating}
              aria-label="Nombre de nueva sección"
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={creating || !newName.trim()}>
              {creating ? 'Creando…' : 'Crear'}
            </button>
          </form>

          {/* Buscador de secciones */}
          <input
            type="text"
            className="form-control form-control-sm mb-3"
            placeholder="Buscar sección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar sección"
          />

          {error && (
            <div className="alert alert-danger p-2" role="alert">
              No se pudieron cargar las secciones.
            </div>
          )}

          {(!loading && names.length === 0) && (
            <div className="text-muted small">No hay secciones.</div>
          )}

          {/* Lista plana de secciones */}
          <div className="d-flex flex-column gap-1 pb-4">
            {filteredNames.map((name) => (
              <SectionItem
                key={name}
                name={name}
                isActive={isEditorActive && currentSection === name}
                onDelete={async () => {
                  if (!confirm(`¿Eliminar la sección "${name}"? Esta acción no se puede deshacer.`)) return;
                  const result = await deleteSection(name, siteId);
                  if (!result.ok) {
                    console.error('No se pudo eliminar la sección', result.error);
                    alert('Error eliminando la sección');
                  }
                  await refetch();
                }}
                onRename={async () => {
                  const proposed = prompt(`Nuevo nombre para "${name}"`, name);
                  const newName = (proposed || '').trim();
                  if (!newName || newName === name) return;
                  const res = await renameSection(name, newName, siteId);
                  if (!res.ok) {
                    if (res.code === 'conflict') {
                      alert('Ya existe una sección con ese nombre.');
                    } else if (res.code === 'not-found') {
                      alert('No se encontró la sección a renombrar.');
                    } else {
                      console.error('Error renombrando sección', res.error);
                      alert('No se pudo renombrar la sección');
                    }
                    return;
                  }
                  await refetch();
                  if (isEditorActive && currentSection === name) {
                    const qs = new URLSearchParams();
                    if (siteSlug) qs.set('site', siteSlug);
                    qs.set('section', newName);
                    navigate(`/editor?${qs.toString()}`);
                  }
                }}
                onPaste={handlePaste}
                navigate={navigate}
                siteId={siteId}
              />
            ))}
          </div>

        </div>
      </div>
    </aside>
  );
};

// Componente para renderizar una sección
function SectionItem({ name, isActive, onDelete, onRename, onPaste, onDragStart, navigate, siteId }) {
  const handleDragStartLocal = (e) => {
    if (onDragStart) {
      onDragStart(e, name);
    }
  };

  // Construir URL destino correctamente (Link no acepta función en `to` en RRv6)
  const toHref = React.useMemo(() => {
    try {
      const qs = new URLSearchParams();
      const site = new URLSearchParams(window.location.search).get('site');
      if (site) qs.set('site', site);
      qs.set('section', name);
      return `/editor?${qs.toString()}`;
    } catch {
      return `/editor?section=${encodeURIComponent(name)}`;
    }
  }, [name]);

  return (
    <div
      draggable
      onDragStart={handleDragStartLocal}
      className={`mb-2 d-flex flex-column align-items-start justify-content-between p-2 rounded transition-all ${isActive ? 'shadow-sm' : 'bg-white hover-bg-light border'}`}
      style={{ 
        width: '100%', 
        overflowX: 'hidden',
        border: '1px solid #e2e8f0',
        backgroundColor: isActive ? '#f8f9fa' : '#ffffff',
        marginBottom: '8px'
      }}
    >
      <div className="grow d-flex align-items-center gap-2 w-100" style={{ minWidth: 0 }}>
        <Link
          to={toHref}
          className={`d-inline-flex align-items-center text-decoration-none ${isActive ? "text-purple-700 fw-bold" : "text-dark"}`}
          style={{ 
             minWidth: 0, 
             overflow: 'hidden', 
             flex: '1 1 auto', 
             color: isActive ? '#6d28d9' : '#334155'
          }}
          title={name}
        >
          <i className={`bi ${isActive ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-text'} fs-5 flex-shrink-0 me-2`} style={{ color: isActive ? '#8b5cf6' : '#94a3b8' }}></i>
          <span className="text-truncate" style={{ fontSize: '0.9rem' }}>{name}</span>
        </Link>
        
        <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
          <SectionMenu
            sectionName={name}
            onDelete={onDelete}
            onRename={onRename}
            onPaste={onPaste}
            siteId={siteId}
          />
        </div>
      </div>
    </div>
  );
}

// Componente para renderizar una carpeta
function FolderItem({
  folder,
  sections,
  isExpanded,
  onToggle,
  onDelete,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedOver,
  currentSection,
  isEditorActive,
  onSectionAction,
  navigate,
  onDragStartSection,
  onContextMenu,
  siteId,
}) {

  return (
    <div className="mb-2">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onContextMenu={(e) => {
          e.stopPropagation();
          if (onContextMenu) {
            onContextMenu(e, folder.id);
          }
        }}
         style={{
           border: draggedOver ? '2px dashed #0d6efd' : '1px solid #dee2e6',
           borderRadius: '4px',
           padding: '12px',
           paddingRight: '16px',
           backgroundColor: draggedOver ? '#f0f7ff' : 'transparent',
           overflowX: 'hidden',
         }}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-start text-decoration-none d-flex align-items-center"
            onClick={onToggle}
            style={{ flex: 1 }}
          >
            <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'} me-1`}></i>
            <i className="bi bi-folder me-1"></i>
            <span className="fw-semibold">{folder.nombre}</span>
            <span className="text-muted ms-2 small">({sections.length})</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Eliminar carpeta ${folder.nombre}`}
            title="Eliminar carpeta"
          >
            <i className="bi bi-trash" aria-hidden="true"></i>
          </button>
        </div>

         {isExpanded && (
           <div className="ms-3" style={{ paddingRight: '12px', overflowX: 'hidden' }}>
            {sections.length === 0 ? (
              <div className="text-muted small">Vacía</div>
            ) : (
              sections.map((sectionName) => (
                <SectionItem
                  key={sectionName}
                  name={sectionName}
                  isActive={isEditorActive && currentSection === sectionName}
                  onDelete={() => onSectionAction('delete', sectionName)}
                  onRename={() => onSectionAction('rename', sectionName)}
                  onPaste={async (newName) => {
                    // Esto se maneja en el SectionMenu
                  }}
                  onDragStart={onDragStartSection}
                  navigate={navigate}
                  siteId={siteId}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
