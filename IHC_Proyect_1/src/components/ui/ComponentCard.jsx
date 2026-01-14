import React from 'react';

export default function ComponentCard({ component, onEdit, onInsert, onDelete, isInserting = false }) {
  const { id, name, preview_url, tags = [] } = component || {};
  return (
    <div className="card mb-2 shadow-sm">
      <div className="row g-0">
        <div className="col-auto" style={{ width: 140 }}>
          <img src={preview_url || '/placehold.png'} alt={name} style={{ width: 140, height: 90, objectFit: 'cover' }} />
        </div>
        <div className="col">
          <div className="card-body py-2">
            <h6 className="card-title mb-1">{name}</h6>
            <div className="small text-muted mb-2">{tags.join(', ')}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit && onEdit(id)} disabled={isInserting}>Editar</button>
              <button className="btn btn-sm btn-outline-success" onClick={() => onInsert && onInsert(id)} disabled={isInserting}>{isInserting ? 'Insertando...' : 'Insertar'}</button>
              <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => onDelete && onDelete(id)} disabled={isInserting}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
