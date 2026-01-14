import React, { useState } from 'react';

export default function ComponentEditorModal({ open, onClose, onSave, initial = {} }) {
  const [name, setName] = useState(initial.name || '');
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [file, setFile] = useState(null);

  if (!open) return null;

  const handleSave = () => {
    const payload = { name, tags: tags.split(',').map(t => t.trim()).filter(Boolean), previewFile: file };
    onSave && onSave(payload);
  };

  return (
    <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Guardar componente</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Nombre</label>
              <input className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-control form-control-sm" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Preview</label>
              <input type="file" accept="image/*" className="form-control form-control-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-sm btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-sm btn-primary" onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
