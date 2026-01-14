import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSectionData } from '../hooks/useGetSectionData';
import { getComponentById, updateComponent } from '../hooks/useUpdatableComponents';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { BackgroundImageContainer } from '../components/user/ImageContainer';

export default function ComponentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, query } = useEditor();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getComponentById(id);
        if (!res.ok) {
          alert('No se encontró el componente');
          navigate('/componentes-actualizables');
          return;
        }
        if (cancelled) return;

        // Component JSON may be stored as string or object
        const raw = res.component.json;
        const jsonStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
        actions.deserialize(jsonStr);
      } catch (e) {
        console.error(e);
        alert('Error al cargar componente');
        navigate('/componentes-actualizables');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, actions, navigate]);

  const handleSave = async () => {
    try {
      // get serialized state from Craft
      const state = query.serialize();
      const rawJson = JSON.stringify(state);
      const res = await updateComponent(id, { json: rawJson });
      if (res.ok) alert('Componente guardado');
      else {
        console.error('Update error:', res.error);
        if (res.error && res.error.code === '42501') {
          alert('No tienes permiso para editar este componente. Verifica que seas el propietario.');
        } else {
          alert('Error: ' + (res.error?.message || 'unknown'));
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error guardando componente');
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Editor de componente</h3>
        <div>
          <button className="btn btn-secondary btn-sm me-2" onClick={() => navigate('/componentes-actualizables')}>Volver</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Guardar componente</button>
        </div>
      </div>

      <div style={{ width: 960, margin: '0 auto' }}>
        <Frame>
          <Element is={BackgroundImageContainer} padding={10} canvas />
        </Frame>
      </div>
    </div>
  );
}
