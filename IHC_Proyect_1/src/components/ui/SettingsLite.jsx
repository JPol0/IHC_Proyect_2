import React from 'react';
import { useEditor } from '@craftjs/core';

export default function SettingsLite() {

  const { actions, selected } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected || [];
    let selected = null;

    if (currentNodeId) {
      try {
        const node = state.nodes && state.nodes[currentNodeId] ? state.nodes[currentNodeId] : null;
        const name = node && node.data ? node.data.name : '(sin nombre)';
        const settings = node && node.related ? node.related.settings : null;
        let isDeletable = false;
        try { isDeletable = !!(query.node && query.node(currentNodeId) && query.node(currentNodeId).isDeletable && query.node(currentNodeId).isDeletable()); } catch(e) { isDeletable = false; }

        selected = {
          id: currentNodeId,
          name,
          settings,
          isDeletable
        };
      } catch (e) {
        // Defensive: if state shape changes, return null selected
        selected = null;
      }
    }

    return { selected };
  });

  return selected ? (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="fw-semibold">Seleccionado {selected.name}</div>
      </div>

      {selected.settings && typeof selected.settings === 'function' && (
        <div className="mb-3">
          {React.createElement(selected.settings)}
        </div>
      )}

      {selected.isDeletable && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => {
            try {
              const ts = Date.now();
              // Suppress deserialize calls for a short window to avoid reloads
              try { window.__suppressDeserializeUntil = ts + 5000; } catch(e) {}
              try { sessionStorage.setItem('lastLocalChange', String(ts)); } catch(e) {}
            } catch(e) {}
            try { actions.delete(selected.id); } catch(e) { console.error('Delete action failed', e); }
          }}
        >
          Eliminar
        </button>
      )}
    </div>
  ) : null
}
