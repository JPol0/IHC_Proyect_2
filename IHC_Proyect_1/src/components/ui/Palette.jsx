import React from 'react';
import { Element, useEditor } from '@craftjs/core';
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

export default function Palette() {
  const { connectors } = useEditor();

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
    <div className="d-flex h-100">
        {/* Barra lateral oscura estrecha (Iconos) */}
        <div className="d-flex flex-column align-items-center py-3 bg-dark" style={{ width: '50px', backgroundColor: '#1e1e1e' }}>
            <div className="mb-4 text-white"><i className="bi bi-grid-fill fs-5"></i></div>
            <div className="mb-4 text-secondary"><i className="bi bi-layers fs-5"></i></div>
            <div className="mb-4 text-secondary"><i className="bi bi-file-earmark fs-5"></i></div>
            <div className="mt-auto text-secondary mb-3"><i className="bi bi-gear fs-5"></i></div>
        </div>

        {/* Panel de Componentes */}
        <div className="p-3 bg-light border-end" style={{ width: '230px', overflowY: 'auto' }}>
            
            <div className="mb-3">
                <input type="text" className="form-control form-control-sm border-0 shadow-sm" placeholder="Search components..." />
            </div>

            <h6 className="fw-bold fs-7 text-uppercase text-muted mb-3 small" style={{ letterSpacing: '0.5px' }}>Components</h6>
            
            <div className="row g-2">
                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Text text="Texto" fontSize={18} />)}
                    icon="bi-type" 
                    label="Text Block" 
                />
                
                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Button size="small" variant="contained">Botón</Button>)}
                    icon="bi-hand-index-thumb" 
                    label="Button" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Image />)}
                    icon="bi-image" 
                    label="Image" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Element is={Container} padding={16} background="#ffffff" canvas />)}
                    icon="bi-square" 
                    label="Container" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Element is={Card} />)}
                    icon="bi-card-heading" 
                    label="Card" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <IconButton iconName="star" iconSize={24} />)}
                    icon="bi-star" 
                    label="Icon" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <ChevronButton direction="left" color="#E6E3A1" />)}
                    icon="bi-chevron-bar-left" 
                    label="Nav Btn" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <Element is={BackgroundImageContainer} padding={16} background="#ffffff" canvas />)}
                    icon="bi-card-image" 
                    label="Img Box" 
                />

                 <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <FileDownload />)}
                    icon="bi-download" 
                    label="Download" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <ForumButton />)}
                    icon="bi-chat-left-text" 
                    label="Forum Btn" 
                />

                <ToolButton 
                    refProp={(ref) => ref && connectors.create(ref, <LikeButton />)}
                    icon="bi-heart" 
                    label="Like Btn" 
                />
            </div>
        </div>
    </div>
  );
}

