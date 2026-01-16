import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { useNavigate } from "react-router-dom";
import { SettingsTabs } from "../ui/SettingsTabs";

export const ForumButton = ({ 
  text = "Ir al Foro",
  translateX = 0,
  translateY = 0,
  zIndex = 0,
  opacity = 1,
  ...props 
}) => {
  const { 
    id, 
    connectors: { connect, drag }, 
    actions: { setProp }, 
    selected 
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
  const navigate = useNavigate();

  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = Number(translateX) || 0;
    const initialY = Number(translateY) || 0;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setProp((props) => {
        props.translateX = initialX + deltaX;
        props.translateY = initialY + deltaY;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <button
      {...props}
      ref={(ref) => connect(drag(ref))}
      onClick={() => {
         navigate('/forum');
      }}
      className="btn btn-primary d-inline-flex align-items-center gap-2"
      style={{ 
        backgroundColor: '#ff5722', 
        borderColor: '#ff5722',
        color: '#fff',
        padding: '10px 20px',
        fontSize: '1rem',
        transform: `translate(${Number(translateX) || 0}px, ${Number(translateY) || 0}px)`,
        zIndex: Number(zIndex) || 0,
        opacity: Number(opacity) || 1,
        position: 'relative',
        ...props.style 
      }}
    >
      <i className="bi bi-chat-square-text-fill"></i>
      {text}
      
      {selected && (
        <div 
            className="position-absolute d-flex align-items-center px-3 rounded-top shadow-sm"
            style={{
                top: 0,
                left: 0,
                transform: 'translateY(-100%)',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                zIndex: 9999,
                height: '42px',
                gap: '16px',
            }}
         >
             <i 
                className="bi bi-arrows-move" 
                title="Mover"
                style={{ cursor: 'move', fontSize: '1.4rem' }}
                onMouseDown={handleMouseDown}
             />
             <i 
                className="bi bi-copy"
                title="Duplicar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
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
                  const index = Math.max(0, siblings.indexOf(id));
                  const shiftedProps = {
                    ...props,
                    translateX: (Number(props.translateX) || 0) + 10,
                    translateY: (Number(props.translateY) || 0) + 10,
                  };
                  const newNode = createNode(React.createElement(type, shiftedProps));
                  add(newNode, parent, index + 1);
                  selectNode(newNode.id);
                }}
             />
             <i 
                className="bi bi-trash" 
                title="Eliminar"
                style={{ cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    deleteNode(id);
                }}
             />
         </div>
      )}
    </button>
  );
};

export const ForumButtonSettings = () => {
  const { actions: { setProp }, text } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <SettingsTabs
      tabs={[
        {
          label: "General",
          content: (
            <div className="mb-3">
              <label className="form-label">Texto del botón</label>
              <input
                type="text"
                className="form-control"
                value={text}
                onChange={(e) => setProp((props) => (props.text = e.target.value))}
              />
            </div>
          )
        }
      ]}
    />
  );
};

ForumButton.craft = {
  displayName: "Botón Foro",
  props: {
    text: "Ir al Foro",
    translateX: 0,
    translateY: 0,
    zIndex: 0,
    opacity: 1
  },
  related: {
    settings: ForumButtonSettings,
  },
};
