// components/user/Card.js
import React from "react";
import { Text } from "./Text";
import { Button } from "./Button";
import { Container } from "./Container";
import { Element, useNode, useEditor } from "@craftjs/core";
import {ContainerSettings} from "./Container";
import { ContainerDefaultProps } from "./Container";

export const CardTop = ({children}) => {
  const { connectors: {connect} } = useNode();
  return (
    <div ref={connect} className="text-only">
      {children}
    </div>
  )
}

CardTop.craft = {
  rules: {
    // Only accept Text
    canMoveIn: (incomingNodes) => incomingNodes.every(incomingNode => incomingNode.data.type === Text)
  }
}

export const CardBottom = ({children}) => {
  const { connectors: {connect} } = useNode();
  return (
    <div ref={connect}>
      {children}
    </div>
  )
}

CardBottom.craft = {
  rules: {
    // Only accept Buttons
    canMoveIn : (incomingNodes) => incomingNodes.every(incomingNode => incomingNode.data.type === Button)
  }
}

export const Card = ({
  background,
  padding = 20,
  width = 360,
  height = 220,
  minWidth = 180,
  minHeight = 120,
  // NUEVO: posición libre
  x = 0,
  y = 0,
  // Z-index para evitar desplazamiento
  zIndex = 0,
}) => {
  const {
    id,
    connectors: { connect, drag },
    actions: { setProp },
    selected
  } = useNode((node) => ({
    selected: node.events.selected
  }));
  const { actions: { add, selectNode, delete: deleteNode }, query: { createNode, node } } = useEditor();
 
  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = Number(x) || 0;
    const initialY = Number(y) || 0;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      setProp((props) => {
        props.x = initialX + deltaX;
        props.y = initialY + deltaY;
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
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        // Posicionamiento libre
        position: 'absolute',
        left: typeof x === 'number' ? `${x}px` : x,
        top: typeof y === 'number' ? `${y}px` : y,
        zIndex: Number(zIndex) || 0,

        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        minWidth,
        minHeight,
        boxSizing: 'border-box',
        // contorno solo cuando está seleccionada
        outline: selected ? '1px dashed #3b82f6' : undefined,
      }}
    >
      <Container background={background} padding={padding}>
        <Element id="text" is={CardTop} canvas>
          <Text text="Título" fontSize={20} />
          <Text text="Subtítulo" fontSize={15} />
        </Element>
        <Element id="buttons" is={CardBottom} canvas>
          <Button size="small" text="Saber más" variant="contained" color="primary">Haz clic aquí</Button>
        </Element>
      </Container>
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
             {/* Move */}
             <i 
                className="bi bi-arrows-move" 
                title="Mover"
                style={{ cursor: 'move', fontSize: '1.4rem' }}
                onMouseDown={handleMouseDown}
             />

             {/* Duplicate */}
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
                    x: (Number(props.x) || 0) + 10,
                    y: (Number(props.y) || 0) + 10,
                  };
                  const newNode = createNode(React.createElement(type, shiftedProps));
                  add(newNode, parent, index + 1);
                  selectNode(newNode.id);
                }}
             />

             {/* Delete */}
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
    </div>
  )
}

Card.craft = {
  displayName: 'Tarjeta',
  props: {
    ...ContainerDefaultProps,
    width: 360,
    height: 220,
    minWidth: 180,
    minHeight: 120,
    // NUEVO: defaults posición
    x: 0,
    y: 0,
    // Z-index para evitar desplazamiento
    zIndex: 0,
  },
  related: {
    settings: ContainerSettings
  }
}
