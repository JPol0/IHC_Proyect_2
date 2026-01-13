import React, { useState } from 'react';

export const SettingsTabs = ({ tabs = [] }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <ul className="nav nav-tabs nav-fill mb-2" style={{ fontSize: '0.7rem' }}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <li className="nav-item" key={index}>
              <button
                className={`nav-link w-100 py-1 px-1 ${isActive ? 'active fw-bold' : 'text-secondary'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab(index); }}
                style={{ cursor: 'pointer', borderRadius: '4px 4px 0 0' }}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="tab-content">
         {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};
