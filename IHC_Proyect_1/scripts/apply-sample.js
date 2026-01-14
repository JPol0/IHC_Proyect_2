// Run with: node scripts/apply-sample.js
// This script will list candidate components (by name match) and update them to the Text-only default JSON.
// Requires that your Supabase anon/service key is available via SupabaseCredentials.js (project-local) or ENV.

import { supabase } from '../SupabaseCredentials.js';

const DEFAULT_JSON = {
  ROOT: { nodes: ['c_sample_text'] },
  c_sample_text: {
    type: { resolvedName: 'Text' },
    isCanvas: false,
    props: { text: 'Texto de ejemplo' },
    displayName: 'Text',
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
  }
};

async function main() {
  console.log('Listing candidate components (name ilike "sample|ejemplo|example")');
  const { data, error } = await supabase.from('ComponentesActualizables').select('*').ilike('name', '%sample%').limit(50);
  if (error) {
    console.error('Error listing candidates:', error);
    return;
  }
  console.log('Found', (data||[]).length, 'candidates');
  for (const c of data) {
    console.log('Updating', c.id, c.name);
    const { error: err2 } = await supabase.from('ComponentesActualizables').update({ json: JSON.stringify(DEFAULT_JSON), size: JSON.stringify(DEFAULT_JSON).length }).eq('id', c.id).select('*');
    if (err2) console.error('Update error for', c.id, err2);
    else console.log('Updated', c.id);
  }
}

main().catch(e => { console.error(e); throw e; });