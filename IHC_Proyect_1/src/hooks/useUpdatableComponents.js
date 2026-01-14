import { supabase, uploadImage } from '../SupabaseCredentials';

const TABLE = 'ComponentesActualizables';
const MAX_JSON_BYTES = 100 * 1024; // 100 KB default limit for a component JSON (configurable)

export async function listComponents({ siteId = null, tag = null, search = null, limit = 50, offset = 0 } = {}) {
  try {
    let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false }).range(offset, Math.max(0, offset + limit - 1));
    if (siteId) q = q.eq('site_id', siteId);
    if (tag) q = q.contains('tags', [tag]);
    if (search) q = q.ilike('name', `%${search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return { ok: true, components: data || [] };
  } catch (e) {
    console.error('Error listing components:', e);
    return { ok: false, error: e, components: [] };
  }
}

export async function getComponentById(id) {
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) return { ok: false, error };
    return { ok: true, component: data };
  } catch (e) {
    console.error('Error fetching component:', e);
    return { ok: false, error: e };
  }
}

export async function createComponent({ name, site_id = null, owner_id = null, json, previewFile = null, tags = [], metadata = {} } = {}) {
  try {
    const jsonStr = typeof json === 'string' ? json : JSON.stringify(json);
    if (new Blob([jsonStr]).size > MAX_JSON_BYTES) {
      return { ok: false, error: new Error(`Component JSON exceeds ${MAX_JSON_BYTES} bytes limit`) };
    }

    let preview_url = null;
    if (previewFile) {
      // upload image to storage 'assets' bucket under 'component-previews'
      preview_url = await uploadImage(previewFile, 'assets', 'component-previews');
    }

    const { data, error } = await supabase.from(TABLE).insert([{ name, site_id, owner_id, json: jsonStr, preview_url, tags, metadata, size: new Blob([jsonStr]).size }]).select('*');
    if (error) return { ok: false, error };
    return { ok: true, component: (data && data[0]) || null };
  } catch (e) {
    console.error('Error creating component:', e);
    return { ok: false, error: e };
  }
}

export async function updateComponent(id, { name, json, previewFile, tags, metadata } = {}) {
  try {
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (json !== undefined) {
      const jsonStr = typeof json === 'string' ? json : JSON.stringify(json);
      if (new Blob([jsonStr]).size > MAX_JSON_BYTES) {
        return { ok: false, error: new Error(`Component JSON exceeds ${MAX_JSON_BYTES} bytes limit`) };
      }
      payload.json = jsonStr;
      payload.size = new Blob([jsonStr]).size;
    }
    if (tags !== undefined) payload.tags = tags;
    if (metadata !== undefined) payload.metadata = metadata;

    if (previewFile) {
      payload.preview_url = await uploadImage(previewFile, 'assets', 'component-previews');
    }

    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*');
    if (error) return { ok: false, error };
    return { ok: true, component: (data && data[0]) || null };
  } catch (e) {
    console.error('Error updating component:', e);
    return { ok: false, error: e };
  }
}

export async function deleteComponent(id) {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (e) {
    console.error('Error deleting component:', e);
    return { ok: false, error: e };
  }
}

export default {
  listComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
};
