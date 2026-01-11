import { supabase } from '../../SupabaseCredentials';

// === CONFIG/SETTINGS ===
export const getForumSettings = async () => {
    try {
        const { data, error } = await supabase
            .from('forum_config')
            .select('*')
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
             console.error("Error getting settings:", error);
             return null;
        }
        
        // Default settings if not found
        if (!data) return {
            bg_color: '#000000',
            text_color: '#ffffff',
            primary_color: '#ff5722', // The orange accent
            card_bg_color: '#1e1e1e'
        };

        return data;
    } catch (e) {
        console.error("Exception getting settings", e);
        return {
            bg_color: '#000000',
            text_color: '#ffffff',
            primary_color: '#ff5722',
            card_bg_color: '#1e1e1e'
        };
    }
};

export const saveForumSettings = async (settings) => {
    // Check if exists
    const { data: existing } = await supabase.from('forum_config').select('id').single();
    if (existing) {
        const { error } = await supabase.from('forum_config').update(settings).eq('id', existing.id);
        return { ok: !error, error };
    } else {
        const { error } = await supabase.from('forum_config').insert([settings]);
        return { ok: !error, error };
    }
};

// === CATEGORIES ===
export const getCategories = async () => {
    try {
        const { data, error } = await supabase
            .from('forum_categories')
            .select('*, forum_threads(count)')
            .order('created_at', { ascending: true });
        if (error) throw error;
        
        return data.map(cat => ({
            ...cat,
            // forum_threads is an array like [{ count: 5 }]
            topic_count: cat.forum_threads && cat.forum_threads[0] ? cat.forum_threads[0].count : 0
        })) || [];
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
};

export const createCategory = async (name, description, image) => {
    try {
        // Simple slugify
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);
        const { data, error } = await supabase
            .from('forum_categories')
            .insert([{ name, slug, description, image_url: image }]);
        return { ok: !error, error };
    } catch (err) {
        return { ok: false, error: err };
    }
};

export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', id);
    return { ok: !error, error };
};

export const getCategoryBySlug = async (slug) => {
    const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return data;
};

// === TOPICS (THREADS) ===
export const getThreads = async (categoryId) => {
    const { data, error } = await supabase
        .from('forum_threads')
        .select('*, forum_posts(count)')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });
    if (error) return [];
    
    // Format dates and handle mock structure compatibility if needed
    return data.map(t => ({
        ...t,
        date: new Date(t.created_at).toLocaleDateString(),
        replies: t.forum_posts && t.forum_posts[0] ? t.forum_posts[0].count : 0
    }));
};

export const getThread = async (threadId) => {
    const { data, error } = await supabase
        .from('forum_threads')
        .select(`
            *,
            forum_categories ( id, name, slug )
        `)
        .eq('id', threadId)
        .single();
    if (error || !data) return null;

    return {
        ...data,
        date: new Date(data.created_at).toLocaleDateString(),
        // content is already there
        author: data.author_name || 'Anonymous'
    };
};

// === REPLIES (POSTS) ===
export const getReplies = async (threadId) => {
    const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
    
    if (error) return [];
    return data.map(p => ({
        ...p,
        author: p.author_name || 'Anonymous',
        date: new Date(p.created_at).toLocaleDateString()
    }));
};

export const createThread = async (categoryId, title, content, author) => {
    const { error } = await supabase
        .from('forum_threads')
        .insert([{ category_id: categoryId, title, content, author_name: author }]);
    return { ok: !error, error };
};

export const createReply = async (threadId, content, author, parentId = null) => {
    const payload = { 
        thread_id: threadId, 
        content, 
        author_name: author 
    };
    if (parentId) payload.parent_id = parentId;

    const { error } = await supabase
        .from('forum_posts')
        .insert([payload]);
    return { ok: !error, error };
};
