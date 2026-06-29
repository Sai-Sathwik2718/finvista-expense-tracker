import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Search, Filter, Trash2, Edit, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  
  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_mode: 'card',
    description: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        type: typeFilter,
        categoryId: categoryFilter
      };
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalItems: res.data.totalItems
      });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, typeFilter, categoryFilter]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      amount: '',
      type: 'expense',
      category_id: categories[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'card',
      description: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      category_id: transaction.category_id,
      date: transaction.date,
      payment_mode: transaction.payment_mode,
      description: transaction.description,
      notes: transaction.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        alert('Failed to delete transaction.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      alert(err.message || 'Failed to save transaction record.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Transaction',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: row.type === 'income' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
            color: row.type === 'income' ? 'var(--status-success)' : 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {row.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{row.description}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.notes || 'No extra notes'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      cell: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: `${row.Category?.color || '#FF6B35'}15`,
          color: row.Category?.color || '#FF6B35',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {row.Category?.name || 'Uncategorized'}
        </span>
      )
    },
    {
      header: 'Date',
      cell: (row) => formatDate(row.date)
    },
    {
      header: 'Payment Mode',
      cell: (row) => <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{row.payment_mode}</span>
    },
    {
      header: 'Amount',
      cell: (row) => (
        <span style={{ fontWeight: 700, color: row.type === 'income' ? 'var(--status-success)' : 'var(--text-primary)' }}>
          {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleOpenEditModal(row)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '0.25rem' }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout title="Transactions Ledger">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Action Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Type Filter */}
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '150px' }}>
              <option value="">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>

            {/* Category Filter */}
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: '180px' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} /> Add Transaction
          </button>
        </div>

        {/* Transactions Table Card */}
        <div className="aurax-card" style={{ padding: 0 }}>
          <DataTable
            columns={columns}
            data={transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Edit Transaction Record' : 'Record New Transaction'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                /> Expense
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                /> Income
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                required
                className="form-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="" disabled>Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
              >
                <option value="card">Credit / Debit Card</option>
                <option value="upi">UPI / Mobile Payment</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. AWS Cloud Server Hosting"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Additional memo or ref code..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Transactions;
