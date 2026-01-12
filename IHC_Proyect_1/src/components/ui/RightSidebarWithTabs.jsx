import React, { useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import Sidebar from './Sidebar';    // Renombrar mentalmente a 'PagesList'
import RightPanel from './RightPanel'; // Panel de Propiedades

export default function RightSidebarWithTabs() {
    const { selected } = useEditor((state) => ({
        selected: state.events.selected,
    }));
    
    // Por defecto 'pages', pero si seleccionas algo, cambia a 'settings'
    const [activeTab, setActiveTab] = useState('pages');

    useEffect(() => {
        if (selected && selected.size > 0) {
            setActiveTab('settings');
        }
    }, [selected]);

    return (
        <div className="d-flex flex-column h-100 bg-white shadow-sm" style={{ borderLeft: '1px solid #e2e8f0' }}>
            {/* Tabs Header - Estilo NEXUM (Oscuro con highlight morado) */}
            <div className="d-flex w-100" style={{ backgroundColor: '#1a202c', minHeight: '48px' }}>
                <button 
                    className="btn flex-grow-1 rounded-0 border-0 fw-bold small text-uppercase py-3 position-relative"
                    style={{ 
                        color: activeTab === 'pages' ? '#ffffff' : '#94a3b8',
                        backgroundColor: 'transparent',
                        fontSize: '0.75rem',
                        letterSpacing: '1px'
                    }}
                    onClick={() => setActiveTab('pages')}
                >
                    PAGES
                    {activeTab === 'pages' && (
                        <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#8b5cf6' }}></div>
                    )}
                </button>
                <button 
                    className="btn flex-grow-1 rounded-0 border-0 fw-bold small text-uppercase py-3 position-relative"
                    style={{ 
                        color: activeTab === 'settings' ? '#ffffff' : '#94a3b8',
                        backgroundColor: 'transparent',
                        fontSize: '0.75rem',
                        letterSpacing: '1px'
                    }}
                    onClick={() => setActiveTab('settings')}
                >
                    SECTIONS
                    {activeTab === 'settings' && (
                        <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '3px', backgroundColor: '#8b5cf6' }}></div>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow-1 overflow-auto bg-light">
                {activeTab === 'pages' ? (
                    <div className="h-100">
                         {/* El componente Sidebar existente maneja la lista de páginas/secciones */}
                         <div className="p-3">
                            <Sidebar />
                         </div>
                         {/* Botón flotante o al final para "+ New Page" se simulará con el estilo existente de Sidebar */}
                    </div>
                ) : (
                    <div className="h-100">
                        {/* RightPanel muestra propiedades del componente seleccionado */}
                        {selected && selected.size > 0 ? (
                             <RightPanel />
                        ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-4 text-center">
                                <i className="bi bi-cursor fs-1 mb-3 opacity-25"></i>
                                <p className="small">Select an element on the canvas to edit its properties.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer Falso si estamos en PAGES (Para imitar el botón "+ New Page" de la imagen, si es que Sidebar no lo tiene prominente) */}
            {activeTab === 'pages' && (
                <div className="p-3 bg-white border-top">
                    <button className="btn w-100 py-2 fw-semibold text-white shadow-sm" style={{ backgroundColor: '#c084fc', borderRadius: '8px' }}>
                        <i className="bi bi-plus me-2"></i> New Page
                    </button>
                </div>
            )}
        </div>
    );
}
