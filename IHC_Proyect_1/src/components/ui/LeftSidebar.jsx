import React, { useState } from 'react';
import { Element, useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import Sidebar from './Sidebar';

// Component Imports
import { Container } from '../user/Container';
import { Button } from '../user/Button';
import { Text } from '../user/Text';
import { Image } from '../user/Image';
import { Card } from '../user/Card';
import { ChevronButton } from '../user/ChevronButton';
import { IconButton } from '../user/IconButton';
import { BackgroundImageContainer } from "../user/ImageContainer";
import { FileDownload } from '../user/FileDownload';
import { ForumButton } from '../user/ForumButton';
import { LikeButton } from '../user/LikeButton';
import { Navbar } from '../user/Navbar';

export default function LeftSidebar() {
  const { connectors } = useEditor();
  const [activeTab, setActiveTab] = useState('components'); // 'components', 'pages', 'layers'

  const ToolButton = ({ icon, label, refProp }) => (
    <div className="col-6">
       <div 
        ref={refProp} 
        className="card h-100 text-center p-2 shadow-sm border-0 bg-white cursor-pointer hover-shadow"
        style={{ cursor: 'grab', transition: 'all 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
       >
         <div className="card-body p-1 d-flex flex-column align-items-center justify-content-center">
            <i className={`bi ${icon} fs-3 mb-2`} style={{ color: '#6d28d9' }}></i>
            <span className="small fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>{label}</span>
         </div>
       </div>
    </div>
  );

  return (
    <div className="d-flex h-100 bg-white border-end">
        {/* Barra lateral oscura estrecha (Iconos) */}
        <div className="d-flex flex-column align-items-center py-3 bg-dark" style={{ width: '50px', backgroundColor: '#1e1e1e', flexShrink: 0 }}>
            {/* Tab: Components */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'components' ? 'text-white' : 'text-secondary'}`}
                onClick={() => setActiveTab('components')}
                title="Components"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-grid-fill fs-5"></i>
            </div>
            
            {/* Tab: Pages */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'pages' ? 'text-white' : 'text-secondary'}`}
                onClick={() => setActiveTab('pages')}
                title="Pages / Sections"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-file-earmark fs-5"></i>
            </div>

            {/* Tab: Layers */}
            <div 
                className={`mb-4 cursor-pointer ${activeTab === 'layers' ? 'text-white' : 'text-secondary'}`}
                onClick={() => setActiveTab('layers')}
                title="Layers"
                style={{ cursor: 'pointer' }}
            >
                <i className="bi bi-layers fs-5"></i>
            </div>

            <div className="mt-auto text-secondary mb-3"><i className="bi bi-gear fs-5"></i></div>
        </div>

        {/* Contenido del Panel (Ancho fijo o flexible?) usaremos fijo por ahora para reemplazar Palette */}
        <div className="h-100 bg-light" style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
            
            {activeTab === 'components' && (
                <div className="p-3 h-100 overflow-auto">
                    <div className="mb-3">
                        <input type="text" className="form-control form-control-sm border-0 shadow-sm" placeholder="Search components..." />
                    </div>
                    <h6 className="fw-bold fs-7 text-uppercase text-muted mb-3 small" style={{ letterSpacing: '0.5px' }}>Components</h6>
                    
                    <div className="row g-2 pb-5">
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Text text="Texto" fontSize={18} />)} icon="bi-type" label="Text Block" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Button size="small" variant="contained">Botón</Button>)} icon="bi-hand-index-thumb" label="Button" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Image />)} icon="bi-image" label="Image" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Element is={Container} padding={16} background="#ffffff" canvas />)} icon="bi-square" label="Container" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Element is={Card} />)} icon="bi-card-heading" label="Card" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <IconButton iconName="star" iconSize={24} />)} icon="bi-star" label="Icon" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <ChevronButton direction="left" color="#E6E3A1" />)} icon="bi-chevron-bar-left" label="Nav Btn" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Element is={BackgroundImageContainer} padding={16} background="#ffffff" canvas />)} icon="bi-card-image" label="Img Box" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <FileDownload />)} icon="bi-download" label="Download" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <ForumButton />)} icon="bi-chat-left-text" label="Forum" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <LikeButton />)} icon="bi-heart" label="Like" />
                       
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Element is={Container} padding={16} background="#eeeeee" canvas ><Text text="Column 1" /><Text text="Column 2" /></Element>)} icon="bi-layout-sidebar" label="Columns" />
                       <ToolButton refProp={(ref) => ref && connectors.create(ref, <Navbar />)} icon="bi-menu-button-wide" label="Navbar" />
                    </div>
                </div>
            )}

            {activeTab === 'pages' && (
                <div className="h-100 overflow-hidden d-flex flex-column">
                    {/* Renderizamos Sidebar tal cual, asumiendo que se ajusta al contenedor */}
                    <Sidebar />
                </div>
            )}

            {activeTab === 'layers' && (
                <div className="p-3 h-100 overflow-auto">
                    <h6 className="fw-bold fs-7 text-uppercase text-muted mb-3 small" style={{ letterSpacing: '0.5px' }}>Layers</h6>
                    <div className="layers-container">
                        <Layers expandRootOnLoad={true} />
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
