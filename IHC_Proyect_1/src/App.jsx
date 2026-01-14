import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Editor from './pages/Editor.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sites from './pages/Sites.jsx';
import ComponentesActualizables from './pages/ComponentesActualizables.jsx';
import ComponentEditorPage from './pages/ComponentEditorPage.jsx';
import ForumCategories from './pages/Forum/ForumCategories.jsx';
import ForumTopics from './pages/Forum/ForumTopics.jsx';
import ForumThread from './pages/Forum/ForumThread.jsx';

// Vista simple para placeholders
function Page({ title, children }) {
  return (
    <div className="container py-3">
      <h2 className="mb-2">{title}</h2>
      <p className="mb-0">{children}</p>
    </div>
  );
}

// Router con transiciones CSS y sin navbar. Renderiza tu editor (App.jsx) en /editor.
export default function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState('fadeIn'); // fadeIn | fadeOut

  useEffect(() => {
    if (location !== displayLocation) setStage('fadeOut');
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (stage === 'fadeOut') {
      setStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  return (
    <div className="min-h-screen">
      <div className={`route-wrapper ${stage}`} onAnimationEnd={handleAnimationEnd}>
        <Routes location={displayLocation}>
          {/* Ruta raíz: Dashboard principal */}
          <Route path="/" element={<Dashboard />} />

          {/* Rutas principales */}
          <Route path="/editor" element={<Editor nameSection={"editor"}/>} />
          <Route path="/sites" element={<Sites />} />

          {/* Componentes Actualizables */}
          <Route path="/componentes-actualizables" element={<ComponentesActualizables />} />
          <Route path="/componentes-actualizables/:id/edit" element={<ComponentEditorPage />} />

          {/* Rutas del Foro */}
          <Route path="/forum" element={<ForumCategories />} />
          <Route path="/forum/:catSlug" element={<ForumTopics />} />
          <Route path="/forum/topic/:topicId" element={<ForumThread />} />

          {/* Rutas del Sidebar usando renderizado condicional por ruta */}
          <Route path="/indice" element={<Page title="Índice">Página índice.</Page>} />
          <Route path="/about" element={<Page title="About">Acerca de esta app.</Page>} />
          <Route path="/hola-mundo" element={<Page title="Hola Mundo">Ejemplo básico.</Page>} />

          {/* 404 opcional */}
          <Route path="*" element={<Page title="No encontrado">La ruta no existe.</Page>} />
        </Routes>
      </div>
    </div>
  );
}