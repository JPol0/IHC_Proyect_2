// Usage: node scripts/seed-updatable-text.js
// Inserts a simple Text-only component into the `ComponentesActualizables` table
// Marked with tag 'actualizable' so it appears in the updatable components list.

import { supabase, uploadImage } from '../SupabaseCredentials.js';

const DEFAULT_JSON = {
  ROOT: { nodes: ['c_sample_text'] },
  c_sample_text: {
    type: { resolvedName: 'Text' },
    isCanvas: false,
    props: { text: 'Componente actualizable de prueba' },
    displayName: 'Text',
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
  }
};

async function main() {
  try {
    // Attempt to get the authenticated user id; fall back to null (RLS may block anon inserts)
    let owner_id = null;
    try {
      const { data: ud, error: ue } = await supabase.auth.getUser();
      if (!ue && ud && ud.user && ud.user.id) owner_id = ud.user.id;
    } catch (e) { /* ignore */ }

    const insertRow = {
      name: 'Texto actualizable de prueba',
      site_id: null,
      owner_id,
      json: JSON.stringify(DEFAULT_JSON),
      preview_url: null,
      tags: ['actualizable', 'seed'],
      metadata: {},
      size: Buffer ? Buffer.from(JSON.stringify(DEFAULT_JSON)).length : JSON.stringify(DEFAULT_JSON).length,
    };

    const { data, error } = await supabase.from('ComponentesActualizables').insert([insertRow]).select('*');
    if (error) {
      console.error('Insert failed:', error);
      process.exit(1);
    }
    console.log('Inserted component:', data && data[0] ? data[0] : data);
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(1);
  }
}

main();
