import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FileText, FileSpreadsheet, Filter } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate, type, categoryId, paymentMode };
      const res = await api.get('/reports', { params });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, type, categoryId, paymentMode]);

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get('/reports/export/pdf', {
        params: { startDate, endDate, type, categoryId, paymentMode },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinVista_Report_${new Date().toLocaleString('default', { month: 'long' })}_${new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF report.');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await api.get('/reports/export/excel', {
        params: { startDate, endDate, type, categoryId, paymentMode },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinVista_Report_${new Date().toLocaleString('default', { month: 'long' })}_${new Date().getFullYear()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate Excel report.');
    }
  };

  const columns = [
    { header: 'Date', cell: (row) => formatDate(row.date) },
    { header: 'Description', accessor: 'description' },
    { header: 'Category', cell: (row) => row.Category?.name || 'N/A' },
    { header: 'Type', cell: (row) => <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, color: row.type === 'income' ? 'var(--status-success)' : 'var(--status-danger)' }}>{row.type}</span> },
    { header: 'Payment Mode', cell: (row) => <span style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{row.payment_mode}</span> },
    { header: 'Amount', cell: (row) => <span style={{ fontWeight: 700 }}>{formatCurrency(row.amount)}</span> }
  ];

  return (
    <DashboardLayout title="FinVista Reports & Compliance Exports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Audit Trail & Statements</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter dataset and generate compliance-ready downloads</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownloadPdf} className="btn btn-secondary">
              <FileText size={18} color="#EF4444" /> Export PDF
            </button>
            <button onClick={handleDownloadExcel} className="btn btn-secondary">
              <FileSpreadsheet size={18} color="#22C55E" /> Export Excel
            </button>
          </div>
        </div>

        <div className="aurax-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Filter size={18} color="var(--accent-primary)" /> Advanced Filter Suite
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="">All Modes</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="aurax-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Matching Rows</span>
            <h4 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>{reportData?.summary?.totalTransactions || 0}</h4>
          </div>
          <div className="aurax-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Inflow</span>
            <h4 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0 0', color: '#22C55E' }}>{formatCurrency(reportData?.summary?.totalIncome)}</h4>
          </div>
          <div className="aurax-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Outflow</span>
            <h4 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0 0', color: '#EF4444' }}>{formatCurrency(reportData?.summary?.totalExpense)}</h4>
          </div>
          <div className="aurax-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Differential</span>
            <h4 style={{ fontSize: '1.4rem', margin: '0.25rem 0 0 0', color: 'var(--accent-primary)' }}>{formatCurrency(reportData?.summary?.netSavings)}</h4>
          </div>
        </div>

        <div className="aurax-card" style={{ padding: 0 }}>
          <DataTable
            columns={columns}
            data={reportData?.transactions || []}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
