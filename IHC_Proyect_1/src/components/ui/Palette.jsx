import React, { useState } from 'react';
import { Element, useEditor } from '@craftjs/core';
import { Container } from '../user/Container';
import { Button } from '../user/Button';
import { Text } from '../user/Text';
import { Image } from '../user/Image';
import { Card } from '../user/Card';
import { ChevronButton } from '../user/ChevronButton';
import { IconButton } from '../user/IconButton';
import {BackgroundImageContainer} from "../user/ImageContainer";
import { FileDownload } from '../user/FileDownload';import { ForumButton } from '../user/ForumButton';import Sidebar from "./Sidebar";

export default function Palette() {
  const { connectors } = useEditor();
  const [view, setView] = useState('componentes'); // 'componentes' | 'sidebar'
  return (
    <div className="p-3 border-end bg-body-tertiary" style={{ width: 280, overflowX: 'hidden', minWidth: 280 }}>
      {/* Toggle buttons */}
      <div className="d-flex gap-2 mb-2">
        <button
          type="button"
          className={`btn btn-sm ${view === 'componentes' ? 'btn-a50104' : 'btn-outline-a50104'}`}
          onClick={() => setView('componentes')}
        >
          Componentes
        </button>
        <button
          type="button"
          className={`btn btn-sm ${view === 'sidebar' ? 'btn-a50104' : 'btn-outline-a50104'}`}
          onClick={() => setView('sidebar')}
        >
          Secciones
        </button>
      </div>
      <hr />

      {view === 'componentes' ? (
        <>
          <div className="mb-3">
            <h5 className="mb-1">Componentes</h5>
            <small className="text-muted">Arrastra para agregar</small>
          </div>

          <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)', paddingRight: '12px' }}>
            <div className="d-grid gap-2">
              <button
                ref={(ref) => ref && connectors.create(ref, <Text text="Texto" fontSize={18} />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-type"></span> Texto
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <Button size="small" variant="contained">Botón</Button>)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-lightning"></span> Botón
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <IconButton iconName="star" iconSize={24} />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-app"></span> Icono
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <ChevronButton direction="left" color="#E6E3A1" />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-chevron-left"></span> Botón de Navegación
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <Image />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-image"></span> Imagen
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <Element is={Container} padding={16} background="#ffffff" canvas />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-square"></span> Contenedor
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <ForumButton />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-chat-square-text"></span> Botón Foro
              </button>

              {/* Botones de columnas eliminados */}

              <button
                ref={(ref) => ref && connectors.create(ref, <Element is={BackgroundImageContainer} padding={16} background="#ffffff" canvas />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-square"></span> Contenedor Imagen
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <Element is={Card} />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-credit-card-2-front"></span> Tarjeta
              </button>

              <button
                ref={(ref) => ref && connectors.create(ref, <FileDownload />)}
                className="btn btn-light d-flex align-items-center gap-2 text-start"
                type="button"
              >
                <span className="bi bi-download"></span> Archivo descargable
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)', paddingLeft: '12px', paddingRight: '16px' }}>
          <Sidebar />
        </div>
      )}
    </div>
  );
}
