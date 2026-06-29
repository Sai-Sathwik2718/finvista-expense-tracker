import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KPICard from '../components/KPICard';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Calendar, Zap, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview || {};

  return (
    <DashboardLayout title="Deep Analytics Engine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* KPI Averages Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <KPICard
            title="Avg Spend / Day"
            value={formatCurrency(overview.avgSpendPerDay)}
            subtext="Calculated for active days"
            icon={Calendar}
            color="#3B82F6"
          />
          <KPICard
            title="Avg Spend / Month"
            value={formatCurrency(overview.avgSpendPerMonth)}
            subtext="Historical baseline average"
            icon={TrendingUp}
            color="#8B5CF6"
          />
          <KPICard
            title="Peak Spending Day"
            value={formatCurrency(overview.highestSpendingDay?.amount)}
            subtext={`Date: ${overview.highestSpendingDay?.date || 'N/A'}`}
            icon={Zap}
            color="#EF4444"
          />
          <KPICard
            title="MoM Change"
            value={`${overview.monthOverMonthChangePercentage || 0}%`}
            subtext="Current vs previous month"
            icon={overview.monthOverMonthChangePercentage >= 0 ? ArrowUpRight : ArrowDownRight}
            color={overview.monthOverMonthChangePercentage >= 0 ? '#EF4444' : '#22C55E'}
          />
        </div>

        {/* Daily Expense Graph Card */}
        <div className="aurax-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Daily Expense Velocity</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Granular daily run-rate throughout the current billing cycle</p>
          </div>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyGraph || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="amount" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Daily Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Spending Categories */}
        <div className="aurax-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Top 5 Spending Drivers</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analytics?.top5Categories?.map((cat, index) => (
              <div key={cat.categoryId || index} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.total)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-hover)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '4px',
                    backgroundColor: cat.color || '#FF6B35',
                    width: `${Math.min(100, (cat.total / (overview.currentMonthSpend || 1)) * 100)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
