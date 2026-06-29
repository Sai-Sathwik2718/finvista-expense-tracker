import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, ShieldCheck, CheckCheck, AlertCircle, AlertTriangle, Info, CheckCircle2, Menu } from 'lucide-react';

const TopBar = ({ title = 'Financial Intelligence', onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertCircle size={16} color="#EF4444" />;
      case 'warning': return <AlertTriangle size={16} color="#F59E0B" />;
      case 'success': return <CheckCircle2 size={16} color="#22C55E" />;
      default: return <Info size={16} color="#3B82F6" />;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="menu-trigger" onClick={onMenuClick} title="Open navigation">
          <Menu size={20} />
        </button>

        <div className="topbar-title-group">
          <h1 className="topbar-title">{title}</h1>
          <span className="topbar-status">
            <ShieldCheck size={14} /> FinVista Session
          </span>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          onClick={toggleTheme}
          className="icon-button"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#FF6B35" />}
        </button>

        <div className="notification-root">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="icon-button"
            title="Notifications Panel"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="notification-panel"
              >
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Alert History</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: n.is_read ? 'transparent' : 'var(--accent-light)',
                          cursor: n.is_read ? 'default' : 'pointer',
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</p>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No notifications yet.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
