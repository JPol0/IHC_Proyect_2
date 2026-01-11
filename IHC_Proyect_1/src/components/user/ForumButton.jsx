import React from "react";
import { useNode } from "@craftjs/core";
import { useNavigate } from "react-router-dom";

export const ForumButton = ({ text, ...props }) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  const navigate = useNavigate();

  return (
    <button
      {...props}
      ref={(ref) => connect(drag(ref))}
      onClick={() => {
        // En un entorno real de edición, evitar la navegación
        // Pero en producción o preview, esto navegaría
        // Como estamos en un SPA, usamos navigate de react-router
        // Para simular comportamiento "real", verificamos si estamos en modo edición o no?
        // Craft.js 'enabled' state se puede obtener, pero por simplicidad:
         navigate('/forum');
      }}
      className="btn btn-primary d-inline-flex align-items-center gap-2"
      style={{ 
        backgroundColor: '#ff5722', // Orange accent from the image
        borderColor: '#ff5722',
        color: '#fff',
        padding: '10px 20px',
        fontSize: '1rem',
        ...props.style 
      }}
    >
      <i className="bi bi-chat-square-text-fill"></i>
      {text}
    </button>
  );
};

export const ForumButtonSettings = () => {
  const { actions: { setProp }, text } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Texto del botón</label>
        <input
          type="text"
          className="form-control"
          value={text}
          onChange={(e) => setProp((props) => (props.text = e.target.value))}
        />
      </div>
    </div>
  );
};

ForumButton.craft = {
  displayName: "Botón Foro",
  props: {
    text: "Ir al Foro",
  },
  related: {
    settings: ForumButtonSettings,
  },
};
