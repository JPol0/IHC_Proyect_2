import { supabase } from '../SupabaseCredentials.js';

async function listComponents() {
  const { data, error } = await supabase.from('ComponentesActualizables').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) {
    console.error('Error listing components:', error);
    return null;
  }
  return data;
}

async function tryDelete(id) {
  const { data, error } = await supabase.from('ComponentesActualizables').delete().eq('id', id).select('*');
  return { data, error };
}

async function tryInsertTest() {
  const doc = {
    ROOT: { nodes: ['n1'] },
    n1: { id: 'n1', type: 'Container', isCanvas: true, props: {}, nodes: [] }
  };
  const insert = {
    name: 'Smoke test component insertion',
    slug: 'smoke-test-component',
    json: doc,
    size: (globalThis.Buffer ? globalThis.Buffer.from(JSON.stringify(doc)).length : JSON.stringify(doc).length),
    tags: ['smoke']
  };
  const { data, error } = await supabase.from('ComponentesActualizables').insert([insert]).select('*');
  return { data, error };
}

(async () => {
  console.log('Listing components...');
  const comps = await listComponents();
  if (!comps) return;
  console.log('Found', comps.length, 'components');
  comps.forEach(c => {
    console.log('-', c.id, '|', c.name, '| owner:', c.owner_id, '| size:', c.size);
  });

  // Try to find test ones
  const toDelete = comps.filter(c => c.name && (c.name.includes('Prueba') || c.name.includes('Componente de ejemplo') || c.name.includes('Smoke test component')));
  if (toDelete.length === 0) {
    console.log('No obvious test components found to delete.');
  } else {
    for (const c of toDelete) {
      console.log('Attempting delete for', c.id, c.name);
      const res = await tryDelete(c.id);
      if (res.error) {
        console.error('Delete failed for', c.id, res.error);
      } else {
        console.log('Deleted:', res.data);
      }
    }
  }

  console.log('Attempting to insert a test component using anon key...');
  const ins = await tryInsertTest();
  if (ins.error) {
    console.error('Insert test failed:', ins.error);
  } else {
    console.log('Insert test success:', ins.data);
  }

  console.log('Done');
})();
