-- Safe updater: replace components that are empty or obviously placeholder with a Text-only default JSON
-- Review before running. Execute in a test DB first.

BEGIN;

-- Default Text-only JSON (as jsonb)
WITH default_json AS (
  SELECT ('{"ROOT":{"nodes":["c_sample_text"]},"c_sample_text":{"type":{"resolvedName":"Text"},"isCanvas":false,"props":{"text":"Texto de ejemplo"},"displayName":"Text","custom":{},"hidden":false,"nodes":[],"linkedNodes":{}}}' )::jsonb AS j
)

-- Update rows where json is null, empty, or literally an empty object, limited to rows with 'example'/'ejemplo' in the name to reduce risk
UPDATE "ComponentesActualizables" c
SET json = d.j,
    size = octet_length(d.j::text),
    updated_at = now()
FROM default_json d
WHERE (c.json IS NULL OR c.json = '{}'::jsonb OR c.json = ''::jsonb)
  AND (c.name ILIKE '%ejemplo%' OR c.name ILIKE '%example%' OR c.name ILIKE '%sample%');

-- As an additional safe operation, you might want to set/update any row that has no top-level nodes (ROOT.nodes missing)
-- Uncomment if you want to apply more broadly (exercise caution):
-- UPDATE "ComponentesActualizables" c
-- SET json = d.j, size = octet_length(d.j::text), updated_at = now()
-- FROM default_json d
-- WHERE (c.json->'ROOT'->'nodes' IS NULL OR jsonb_array_length(c.json->'ROOT'->'nodes') = 0)
--   AND (c.name ILIKE '%ejemplo%' OR c.name ILIKE '%example%' OR c.name ILIKE '%sample%');

COMMIT;

-- NOTE: Run this on a staging/test DB first. If you are comfortable, run against your dev DB.
-- To run: psql <connection_string> -f scripts/fix-sample-component.sql