# Plantillas de Preview

Esta carpeta contiene las imágenes de preview para las plantillas del constructor de páginas.

## Cómo agregar imágenes de preview

1. Coloca las imágenes en esta carpeta (`public/templates/`)
2. Nombres sugeridos:
   - `homepage-v2-preview.png` - Preview del Homepage V2
   - `blog-post-preview.png` - Preview del Blog Post
   - `category-page-preview.png` - Preview de Página de Categoría
   - `forum-page-preview.png` - Preview de Página de Foro
   - `detailed-article-preview.png` - Preview de Artículo Detallado
   - `forum-categories-preview.png` - Preview de Lista de Categorías del Foro

3. Formatos soportados: PNG, JPG, JPEG, WEBP
4. Tamaño recomendado: 400x300px o similar (proporción 4:3)

## Usar URLs externas

También puedes usar URLs de imágenes directamente editando el campo `preview` en `useTemplates.js`:

```javascript
preview: 'https://ejemplo.com/imagen.png'
```

Las plantillas funcionarán perfectamente sin imágenes de preview, pero tenerlas mejora la experiencia de usuario al seleccionar plantillas.
