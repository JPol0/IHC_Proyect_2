/**
 * Utilidad para manejar navegación entre secciones.
 * Detecta si estamos en un sitio exportado o en el editor y navega apropiadamente.
 */

// Convierte nombre a slug (debe coincidir con la función en Header.jsx)
export const toSlug = (s) => (s || 'seccion')
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  .toLowerCase() || 'seccion';

/**
 * Detecta si estamos en un sitio exportado (tiene window.__CRAFT_ROUTES__)
 */
export const isExportedSite = () => {
  return typeof window !== 'undefined' && !!window.__CRAFT_ROUTES__;
};

/**
 * Navega a una sección por nombre.
 * - En sitio exportado: navega a /{slug}
 * - En editor: navega a /editor?site=xxx&section=xxx
 * 
 * @param {Function} navigate - función navigate de react-router-dom
 * @param {string} sectionName - nombre de la sección
 */
export const navigateToSection = (navigate, sectionName) => {
  if (!sectionName) return;
  
  if (isExportedSite()) {
    // En sitio exportado: navegar directamente al slug
    const slug = toSlug(sectionName);
    navigate(`/${slug}`);
    return;
  }
  
  // En editor: usar ruta /editor con params
  const site = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('site') 
    : null;
  const qs = new URLSearchParams();
  if (site) qs.set('site', site);
  qs.set('section', sectionName);
  navigate(`/editor?${qs.toString()}`);
};
