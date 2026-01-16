import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { getForumSettings } from '../../../hooks/useForum';
import { CategoryList } from './CategoryList';
import { TopicList } from './TopicList';
import { ThreadView } from './ThreadView';

export const Forum = ({ padding = 20, ...props }) => {
  const { 
    connectors: { connect, drag },
    selected 
  } = useNode((node) => ({
    selected: node.events.selected,
  }));
  
  // Custom Settings from DB
  const [settings, setSettings] = useState({
      bg_color: '#000000',
      text_color: '#ffffff',
      primary_color: '#ff5722',
      card_bg_color: '#1e1e1e'
  });

  // Navigation State
  // view: 'categories' | 'topics' | 'thread'
  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
     loadSettings();
  }, []);

  const loadSettings = async () => {
      const data = await getForumSettings();
      if (data) setSettings(data);
  };

  const handleSelectCategory = (category) => {
      setSelectedCategory(category);
      setView('topics');
  };

  const handleSelectThread = (thread) => {
      setSelectedThread(thread);
      setView('thread');
  };

  const goBackToCategories = () => {
      setSelectedCategory(null);
      setView('categories');
  };

  const goBackToTopics = () => {
      setSelectedThread(null);
      setView('topics');
  };

  return (
    <div 
        ref={ref => connect(drag(ref))} 
        className="forum-component-wrapper"
        data-cy="forum-component"
        style={{ 
            padding: `${padding}px`, 
            backgroundColor: settings.bg_color || '#000000',
            color: settings.text_color || '#ffffff',
            minHeight: '400px',
            width: '100%',
            border: selected ? '2px solid #2684FF' : '1px dashed transparent'
        }}
    >
        {view === 'categories' && (
            <CategoryList 
                onSelectCategory={handleSelectCategory} 
                settings={settings}
            />
        )}

        {view === 'topics' && selectedCategory && (
            <TopicList 
                category={selectedCategory} 
                onSelectThread={handleSelectThread} 
                onBack={goBackToCategories}
                settings={settings}
            />
        )}

        {view === 'thread' && selectedThread && (
            <ThreadView 
                thread={selectedThread} 
                onBack={goBackToTopics} 
                settings={settings} 
            />
        )}
    </div>
  );
};

export const ForumSettings = () => {
  return (
    <div>
      <p>Forum settings are managed via the Forum Admin Dashboard.</p>
    </div>
  );
};

Forum.craft = {
  displayName: 'Foro Completo',
  props: {
    padding: 20
  },
  related: {
    settings: ForumSettings
  }
};
