import React, { useEffect, useState } from 'react';
import { getCategories } from '../../../hooks/useForum';

export const CategoryList = ({ onSelectCategory, settings }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center">Cargando categorías...</div>;

  return (
    <div className="forum-categories">
        <h2 className="mb-4 text-white d-flex align-items-center" style={{ fontWeight: 'bold' }}>
            <span style={{ height: '32px', width: '6px', backgroundColor: settings.primary_color, marginRight: '15px' }}></span>
            Foros
        </h2>
        <div className="d-flex flex-column gap-3">
            {categories.map((cat) => (
                <div 
                    key={cat.id} 
                    className="d-flex align-items-center p-0 overflow-hidden"
                    style={{ 
                        backgroundColor: settings.card_bg_color, 
                        color: settings.text_color,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        borderRadius: '4px',
                        border: '1px solid #333'
                    }}
                    onClick={() => onSelectCategory(cat)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = settings.card_bg_color}
                >
                    {/* Image Section */}
                    <div style={{ width: '120px', height: '80px', flexShrink: 0, backgroundColor: '#333' }}>
                        {cat.image_url ? (
                            <img 
                                src={cat.image_url} 
                                alt={cat.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image'; // Fallback visual
                                }}
                            />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary">
                                <i className="bi bi-image"></i>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3 flex-grow-1">
                        <h5 className="mb-0 fw-bold text-white">{cat.name}</h5>
                    </div>

                    {/* Stats Section */}
                    <div className="px-4 py-3 text-center" style={{ minWidth: '100px', borderLeft: '1px solid #333' }}>
                        <div className="mb-1" style={{ fontSize: '0.8rem', color: '#ccc' }}>Temas</div>
                        <div className="fw-bold fs-5">{cat.topic_count || 0}</div>
                    </div>
                </div>
            ))}
        </div>
        {categories.length === 0 && (
            <p className="text-center opacity-50 py-5">No hay categorías disponibles.</p>
        )}
    </div>
  );
};
