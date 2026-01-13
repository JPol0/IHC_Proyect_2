# Componentes Actualizables — Migración y Notas de Deploy

## Resumen
Este módulo introduce la tabla `ComponentesActualizables` para almacenar `components` (plantillas parciales) como JSON serializado de Craft.js + metadatos (preview_url, tags, size, metadata). Las imágenes deben almacenarse en Storage (bucket `assets/component-previews`).

## Archivo de migración
Revisar `SUPABASE_COMPONENTES.sql` en la raíz del repo. Incluye:
- Creación de la tabla `ComponentesActualizables`
- Índices por `site_id` y `tags`
- Trigger `updated_at`
- Comentarios con ejemplos de RLS (policy)

## Pasos para aplicar la migración (Supabase)
1. Abrir la consola de Supabase o usar la CLI.
2. Ejecutar el SQL de `SUPABASE_COMPONENTES.sql` en el editor SQL o mediante `supabase db push` / `psql`.
3. Verificar que la tabla exista y que el `owner_id` y `site_id` funcionen según su esquema de usuarios/sites.

## RLS sugeridas (ejemplo)
- Permitir lectura pública para componentes: `CREATE POLICY "Public read" ON public."ComponentesActualizables" FOR SELECT TO public USING (true);`
- Permitir inserción/actualización/ eliminación solo al propietario:
  - `CREATE POLICY "Owner full access" ON public."ComponentesActualizables" FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);`

> Nota: Ajustar RLS según necesidades del proyecto (si los componentes deben ser compartidos entre usuarios, o restringidos a un equipo/organización).

## Consideraciones
- Límite por componente: se sugiere un límite de ~100 KB por JSON (configurable en `useUpdatableComponents.js`). Si espera componentes grandes, ajustes de storage o compresión pueden ser necesarios.
- Imágenes y assets deben guardarse en Storage para no inflar la DB.
- Se añadió lógica de cliente para remapear IDs al insertar en el lienzo para evitar colisiones entre IDs serializados.

## QA / Pruebas recomendadas
1. Crear un componente desde el editor (`Guardar como componente`) y verificar que aparece en la lista.
2. Subir preview y comprobar URL pública.
3. Editar componente y comprobar que los cambios persisten.
4. Insertar componente en el editor y verificar que no se pierde el contenido anterior y que no hay errores en consola.
5. Probar con componentes grandes y confirmar que la advertencia de tamaño funciona.

## Notas para el PR
- Añadir este archivo a la PR para facilitar a ops las instrucciones de deploy.
- Indicar si RLS fue aplicada en staging/prod para la revisión.
