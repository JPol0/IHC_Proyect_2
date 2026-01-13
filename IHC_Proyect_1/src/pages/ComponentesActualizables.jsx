import React, { useEffect, useState } from 'react';
import ComponentCard from '../components/ui/ComponentCard';
import ComponentEditorModal from '../components/ui/ComponentEditorModal';
import { listComponents, createComponent, deleteComponent, getComponentById } from '../hooks/useUpdatableComponents';
import { useNavigate } from 'react-router-dom';

export default function ComponentesActualizables() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [insertingId, setInsertingId] = useState(null);
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    const res = await listComponents({ limit: 100 });
    setLoading(false);
    if (res.ok) setComponents(res.components || []);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreate = async ({ name, tags, previewFile }) => {
    setModalOpen(false);
    const res = await createComponent({ name, tags, previewFile, json: '{}' });
    if (res.ok) {
      // navigate to editor for the new component
      navigate(`/componentes-actualizables/${res.component.id}/edit`);
    } else {
      alert('Error creating component: ' + (res.error?.message || 'unknown'));
      fetchList();
    }
  };

  const handleEdit = (id) => navigate(`/componentes-actualizables/${id}/edit`);
  const handleInsert = async (id) => {
    try {
      setInsertingId(id);
      const res = await getComponentById(id);
      setInsertingId(null);
      if (!res.ok || !res.component) {
        alert('No se pudo obtener el componente.');
        return;
      }
      // Warn if component is large
      if (res.component.size && res.component.size > 90 * 1024) {
        if (!confirm('El componente es bastante grande (' + Math.round(res.component.size/1024) + ' KB). ¿Desea continuar?')) return;
      }

      // Navegamos al editor y pasamos el JSON del componente para insertar
      navigate('/editor', { state: { insertComponent: res.component.json } });
    } catch (e) {
      setInsertingId(null);
      console.error('Error inserting component:', e);
      alert('Error al insertar componente');
    }
  };
  const handleDelete = async (id) => {
    if (!confirm('Eliminar componente?')) return;
    const res = await deleteComponent(id);
    if (res.ok) fetchList(); else alert('Error: ' + (res.error?.message || 'unknown'));
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Componentes actualizables</h3>
        <div>
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Crear componente</button>
        </div>
      </div>

      {loading && <div className="small text-muted">Cargando...</div>}

      <div style={{ maxWidth: 900 }}>
        {components.map(c => (
          <ComponentCard key={c.id} component={c} onEdit={handleEdit} onInsert={handleInsert} onDelete={handleDelete} isInserting={insertingId === c.id} />
        ))}
        {components.length === 0 && !loading && <div className="text-muted small">No hay componentes.</div>}
      </div>

      <ComponentEditorModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </div>
  );
}
