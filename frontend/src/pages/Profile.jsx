import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { User, Mail, Calendar, ShieldCheck, Award } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setDashboardStats(res.data);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Account Executive Profile">
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Card Header */}
        <div className="aurax-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2.5rem' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>{user?.name || 'Alex Mercer'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={16} /> {user?.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={16} /> Joined {formatDate(user?.created_at || new Date())}</span>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              width: 'fit-content',
              marginTop: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} /> Verified Enterprise Account
            </span>
          </div>
        </div>

        {/* User Statistics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div className="aurax-card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly Outflow</span>
            <h3 style={{ fontSize: '1.6rem', margin: '0.35rem 0 0 0', color: 'var(--text-primary)' }}>
              {formatCurrency(dashboardStats?.quickStats?.totalMonthlyExpenses)}
            </h3>
          </div>

          <div className="aurax-card">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monthly Transactions</span>
            <h3 style={{ fontSize: '1.6rem', margin: '0.35rem 0 0 0', color: 'var(--text-primary)' }}>
              {dashboardStats?.quickStats?.transactionCount || 0} Records
            </h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
