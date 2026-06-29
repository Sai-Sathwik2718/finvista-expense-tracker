import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="aurax-card" style={{ maxWidth: '480px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'var(--status-danger-bg)',
          color: 'var(--status-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: '2.2rem', margin: 0, color: 'var(--text-primary)' }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          The financial route or resource you requested does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={18} /> Return to Workstation
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
