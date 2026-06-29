import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-content">
        <TopBar title={title} />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
