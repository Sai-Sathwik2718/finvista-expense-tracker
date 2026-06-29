import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertOctagon,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupNotif, setPopupNotif] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      if (res.data.budgetExceededPopup) {
        setPopupNotif(res.data.budgetExceededPopup);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDismissPopup = async () => {
    if (popupNotif) {
      try {
        await api.put(`/notifications/${popupNotif.id}/read`);
      } catch (e) {
        console.error(e);
      }
      setPopupNotif(null);
    }
  };

  const COLORS = ['#FF6B35', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  return (
    <DashboardLayout title="FinVista Intelligence Console">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SkeletonLoader height="120px" count={1} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <SkeletonLoader height="140px" count={4} />
          </div>
          <SkeletonLoader height="300px" count={1} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Smart Financial Insights Banner */}
          {data?.smartInsights?.length > 0 && (
            <div className="aurax-card" style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(59,130,246,0.08) 100%)',
              border: '1px solid var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Lightbulb size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Smart Financial Insights</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.35rem' }}>
                  {data.smartInsights.map((insight, idx) => (
                    <span key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      • {insight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <KPICard
              title="Monthly Expenses"
              value={formatCurrency(data?.quickStats?.totalMonthlyExpenses)}
              subtext="Total outflow this month"
              icon={TrendingDown}
              color="#EF4444"
            />
            <KPICard
              title="Monthly Income"
              value={formatCurrency(data?.quickStats?.totalMonthlyIncome)}
              subtext="Total inflow this month"
              icon={TrendingUp}
              color="#22C55E"
            />
            <KPICard
              title="Net Cashflow"
              value={formatCurrency(data?.quickStats?.netBalance)}
              subtext="Current month balance"
              icon={DollarSign}
              color={data?.quickStats?.netBalance >= 0 ? '#22C55E' : '#EF4444'}
            />
            <KPICard
              title="Total Transactions"
              value={data?.quickStats?.transactionCount || 0}
              subtext={`Top: ${data?.quickStats?.topCategory?.name || 'N/A'}`}
              icon={Receipt}
              color="#3B82F6"
            />
          </div>

          {/* Visual Analytics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div className="aurax-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Monthly Financial Trend</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>6 Month Horizon</span>
              </div>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="aurax-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Category Distribution</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expenses</span>
              </div>
              <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data?.categoryWiseChart?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.categoryWiseChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data?.categoryWiseChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No categorical expenditure recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="aurax-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Recent Activity Log</h3>
              <a href="/transactions" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>View All</a>
            </div>

            {data?.recentTransactions?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-hover)',
                      transition: 'transform var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: t.type === 'income' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                        color: t.type === 'income' ? 'var(--status-success)' : 'var(--status-danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.description}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.Category?.name || 'Uncategorized'} • {formatDate(t.date)}</span>
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: t.type === 'income' ? 'var(--status-success)' : 'var(--text-primary)'
                    }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No recent transactions found.</p>
            )}
          </div>
        </div>
      )}

      {/* High-Priority Budget Exceeded Modal Popup */}
      <Modal
        isOpen={!!popupNotif}
        onClose={handleDismissPopup}
        title="🚨 High Priority Alert"
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertOctagon size={36} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{popupNotif?.title}</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
            {popupNotif?.message}
          </p>
          <button onClick={handleDismissPopup} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Acknowledge & Dismiss
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;
