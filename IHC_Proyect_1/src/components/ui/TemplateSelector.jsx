import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { allTemplates, getTemplateCategories, getTemplate } from '../../hooks/useTemplates';

export default function TemplateSelector({ selectedTemplate: externalSelectedTemplate, onSelectTemplate, onClose }) {
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState(externalSelectedTemplate);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = getTemplateCategories();
  
  // Usar el estado interno pero sincronizar con el externo
  const selectedTemplate = internalSelectedTemplate;
  
  const handleTemplateClick = (templateId) => {
    setInternalSelectedTemplate(templateId);
    onSelectTemplate(templateId);
  };

  const filteredTemplates = selectedCategory
    ? allTemplates.filter(t => t.category === selectedCategory)
    : allTemplates;

  // Renderizar el modal usando Portal para que aparezca sobre todo
  const modalContent = (
    <div 
      className="modal show d-block" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.75)', 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Seleccionar Plantilla</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">
            {/* Filtro por categoría */}
            <div className="mb-4">
              <label className="form-label">Filtrar por categoría:</label>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${selectedCategory === null ? 'btn-a50104' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm ${selectedCategory === cat ? 'btn-a50104' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de plantillas */}
            <div className="row g-3">
              {filteredTemplates.map(template => (
                <div key={template.id} className="col-md-6 col-lg-4">
                  <div
                    className={`card h-100 border ${selectedTemplate === template.id ? 'border-warning border-3' : 'border-secondary'}`}
                    style={{ cursor: 'pointer', backgroundColor: '#1a1a1a' }}
                    onClick={() => handleTemplateClick(template.id)}
                  >
                    {/* Preview de la plantilla */}
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center position-relative"
                      style={{
                        height: '180px',
                        backgroundColor: '#0a0a0a',
                        backgroundImage: template.preview ? `url(${template.preview})` : 'none',
                        backgroundSize: template.preview ? 'cover' : 'auto',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderBottom: '1px solid #333',
                      }}
                    >
                      {!template.preview && (
                        <div className="text-center text-muted">
                          <i className="bi bi-file-earmark-image fs-1 d-block mb-2"></i>
                          <small className="d-block">Sin preview</small>
                        </div>
                      )}
                      {template.preview && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-dark bg-opacity-75">
                            <i className="bi bi-image me-1"></i> Preview
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title text-white mb-1">{template.name}</h6>
                      <small className="text-muted mb-2">{template.category}</small>
                      <p className="card-text text-muted small flex-grow-1">{template.description}</p>
                      {selectedTemplate === template.id && (
                        <span className="badge bg-warning text-dark">Seleccionada</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Opción de crear sin plantilla */}
            <div className="mt-4 pt-3 border-top border-secondary">
              <div
                className={`card border ${selectedTemplate === null ? 'border-warning border-3' : 'border-secondary'}`}
                style={{ cursor: 'pointer', backgroundColor: '#1a1a1a' }}
                onClick={() => handleTemplateClick(null)}
              >
                <div className="card-body text-center">
                  <i className="bi bi-file-earmark-plus fs-1 text-muted mb-2"></i>
                  <h6 className="card-title text-white">Comenzar desde cero</h6>
                  <p className="card-text text-muted small">Crea una página vacía sin plantilla</p>
                  {selectedTemplate === null && (
                    <span className="badge bg-warning text-dark">Seleccionada</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onSelectTemplate(null);
                onClose();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-a50104"
              onClick={() => {
                onClose();
              }}
            >
              {selectedTemplate !== null && selectedTemplate !== undefined 
                ? `Usar plantilla: ${getTemplate(selectedTemplate)?.name || ''}` 
                : 'Cerrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar usando Portal para que aparezca sobre todo
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
