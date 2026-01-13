import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { copySection, cutSection } from '../../hooks/useCopyPasteSection';
import { useGetSectionData } from '../../hooks/useGetSectionData';

export default function SectionMenu({ sectionName, onDelete, onRename, onCopy, onCut, siteId = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  
  const handleCopy = async () => {
    try {
      const sectionData = await useGetSectionData(sectionName, siteId);
      console.log('Datos copiados de la sección:', sectionName, sectionData);
      if (sectionData) {
        copySection(sectionName, sectionData);
        if (onCopy) onCopy(sectionName);
      } else {
        alert('No se pudieron obtener los datos de la sección para copiar.');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error copiando sección:', error);
      alert('Error al copiar la sección: ' + error.message);
    }
  };

  const handleCut = async () => {
    try {
      const sectionData = await useGetSectionData(sectionName, siteId);
      if (sectionData) {
        cutSection(sectionName, sectionData);
        if (onCut) onCut(sectionName);
      } else {
        alert('No se pudieron obtener los datos de la sección para cortar.');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error cortando sección:', error);
      alert('Error al cortar la sección: ' + error.message);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation(); // Avoid triggering parent click handlers
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position to the right of the button
      setCoords({
        top: rect.top,
        left: rect.right + 10 
      });
    }
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    // Add listener to window to catch clicks anywhere
    window.addEventListener('click', handleClickOutside);
    // Also close on scroll to avoid detached menu
    window.addEventListener('scroll', handleClickOutside, true); 
    
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, [isOpen]);

  const MenuItem = ({ onClick, icon, label, className = "text-dark" }) => (
    <button
        type="button"
        className={`btn btn-sm text-start w-100 border-0 px-2 py-1 d-flex align-items-center gap-2 ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
          setIsOpen(false);
        }}
        style={{ fontSize: '0.85rem' }}
    >
        <i className={`bi ${icon}`} style={{ fontSize: '1rem' }}></i>
        <span>{label}</span>
    </button>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`btn btn-sm p-1 border-0 ${isOpen ? 'text-dark' : 'text-secondary'}`}
        onClick={toggleMenu}
        title="Opciones"
        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
      >
        <i className="bi bi-three-dots" style={{ fontSize: '1.2rem' }}></i>
      </button>

      {isOpen && createPortal(
        <div
            className="shadow-sm border bg-white rounded py-2 d-flex flex-column gap-1"
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 9999,
                minWidth: '160px',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
        >
            <div className="px-3 py-1 mb-1 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold small text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Opciones</span>
                <button type="button" className="btn-close" style={{ width: '0.5rem', height: '0.5rem' }} onClick={() => setIsOpen(false)}></button>
            </div>
            
            <MenuItem onClick={handleCopy} icon="bi-copy" label="Copiar" />
            <MenuItem onClick={onRename} icon="bi-pencil" label="Renombrar" />
            <MenuItem onClick={onDelete} icon="bi-trash" label="Eliminar" className="text-danger" />
        </div>,
        document.body
      )}
    </>
  );
}


