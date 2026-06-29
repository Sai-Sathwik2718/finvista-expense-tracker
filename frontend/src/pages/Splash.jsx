import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, ArrowRight, Shield, TrendingUp, Cpu } from 'lucide-react';

const Splash = () => {
  return (
    <div className="splash-page">
      <header className="splash-header">
        <div className="brand-row">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #E85A24 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)'
          }}>
            <PieChart size={24} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>FinVista</h2>
        </div>

        <div className="hero-actions">
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="splash-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px' }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <Cpu size={16} /> FinVista Enterprise Financial OS
          </span>

          <h1 style={{
            fontSize: '3.8rem',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            fontWeight: 800
          }}>
            Master your capital with <span style={{ color: 'var(--accent-primary)' }}>FinVista Intelligence</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            Real-time monthly category budget alerts, automated notification tracking, and compliance PDF/Excel reporting.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary hero-cta-button" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Launch Workstation <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary hero-cta-button" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Demo Portal
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Splash;
