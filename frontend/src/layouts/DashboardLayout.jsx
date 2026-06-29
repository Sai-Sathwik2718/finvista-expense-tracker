import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`layout-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <TopBar title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
