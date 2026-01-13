import React from 'react';
import { useEditor } from '@craftjs/core';

export default function SettingsLite() {

  const { actions,selected } = useEditor((state, query) => {
      const [currentNodeId] = state.events.selected;
      let selected;
  
      if ( currentNodeId ) {
        selected = {
          id: currentNodeId,
          name: state.nodes[currentNodeId].data.name,
          settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
          isDeletable: query.node(currentNodeId).isDeletable()
        };
      }

      return {
        selected
      }
    });

  return selected ? (
    <div className="p-3">
      {/* 
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="fw-semibold">
            Propiedades: {selected.name}
        </div>
      </div> 
      */}

      {selected.settings && typeof selected.settings === 'function' && (
        <div className="mb-3">
          {React.createElement(selected.settings)}
        </div>
      )}

      {selected.isDeletable && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => actions.delete(selected.id)}
        >
          Eliminar
        </button>
      )}
    </div>
  ) : null
}
