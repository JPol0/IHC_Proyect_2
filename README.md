# IHC_Proyect_2

Proyecto para la asignatura de Interacción Humano-Computadora (IHC). Es un constructor visual de páginas (page builder) desarrollado principalmente con React y la librería Craft.js. El caso de estudio del proyecto es la creación de una página sobre la Amazonia, demostrando la composición dinámica de contenidos geográficos, imágenes y textos mediante componentes arrastrables y configurables.

## Descripción
La aplicación permite a usuarios construir y editar páginas visualmente usando componentes reutilizables (texto, imágenes, secciones, mapas, etc.). Craft.js se utiliza para gestionar la edición visual (drag & drop, layout, props) y React para la renderización y lógica de UI.

## Características principales
- Editor visual de páginas con arrastrar y soltar (Craft.js).
- Componentes configurables (texto, imagen, galería, sección, botones).
- Caso de estudio: plantilla y contenido orientado a una página informativa sobre la Amazonia.
- Exportación/guardado de la estructura de la página (si está implementado en el proyecto).
- Interfaz desarrollada en JavaScript/React.

## Tecnologías
- React
- Craft.js — https://craft.js.org/
- JavaScript (ES6+)
- HTML / CSS

## Requisitos
```markdown
## Requisitos
- Node.js (v14+ recomendado)
- npm o yarn
```

## Instalación
1. Clona el repositorio:
   git clone https://github.com/helowdas/IHC_Proyect_1.git
2. Entra en la carpeta del proyecto:
   cd IHC_Proyect_1
3. Instala las dependencias:
   npm install
   (o `yarn install` si usas yarn)

## Uso (comandos comunes)
- Ejecutar en modo desarrollo:
  npm start
- Construir para producción:
  npm run build
- Ejecutar pruebas (si existen):
  npm test

Ajusta los comandos según los scripts definidos en package.json.

## Estructura recomendada
- src/ — código fuente en React y Craft.js
- public/ — archivos estáticos
- src/components/ — componentes reutilizables del editor y de la página
- src/pages/ — plantillas o vistas principales (incluye la plantilla Amazonia)
- src/styles/ — hojas de estilo
- README.md — este archivo

(Revisa la estructura real del repositorio para confirmarla.)

## Cómo contribuir
1. Haz fork del repositorio.
2. Crea una rama nueva: `git checkout -b feature/mi-mejora`
3. Realiza tus cambios y haz commits descriptivos.
4. Envía un Pull Request describiendo los cambios y el propósito.

## Recursos útiles
- Craft.js — https://craft.js.org/
- Documentación de React — https://es.reactjs.org/
