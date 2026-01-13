import React from 'react';
import { useEditor } from '@craftjs/core';
import SettingsLite from './SettingsLite';

export default function RightSidebar() {
    const { selected } = useEditor((state) => ({
        selected: state.events.selected,
    }));
    
    // Si hay selección, mostramos Settings. Si no, un placeholder.
    // El usuario pidió: "en el menu derecho solo debe estar la personalizacion y cuando seccionas un componente"
    // Esto implica que si NO hay componente, estaría vacío o placeholder.

    const hasSelection = selected && selected.size > 0;

    return (
        <div className="d-flex flex-column h-100 bg-white shadow-sm border-start">
            {/* Header */}
            <div className="d-flex w-100 align-items-center px-3" style={{ backgroundColor: '#1a202c', minHeight: '48px' }}>
                <span className="fw-bold small text-uppercase text-white" style={{ letterSpacing: '1px', fontSize: '0.75rem' }}>
                    PROPERTIES
                </span>
            </div>

            {/* Content */}
            <div className="flex-grow-1 overflow-auto bg-light">
                {hasSelection ? (
                    <SettingsLite />
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-4 text-center opacity-50">
                        <i className="bi bi-cursor fs-1 mb-3"></i>
                        <p className="small">Select an element on the canvas to edit its properties.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
