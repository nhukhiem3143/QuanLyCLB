import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const adminNav = [
  { group: 'Tổng quan', items: [{ to: '/admin/dashboard', icon: '📊', label: 'Dashboard' }] },
  { group: 'Quản lý', items: [
    { to: '/admin/users', icon: '👥', label: 'Tài khoản' },
    { to: '/admin/clubs', icon: '🏢', label: 'Câu lạc bộ' },
    { to: '/admin/club-requests', icon: '📋', label: 'Yêu cầu lập CLB' },
    { to: '/admin/events', icon: '📅', label: 'Duyệt sự kiện' },
  ]},
  { group: 'Thống kê', items: [{ to: '/admin/stats', icon: '📈', label: 'Thống kê' }] },
];

const cnNav = [
  { group: 'Tổng quan', items: [{ to: '/cn/dashboard', icon: '📊', label: 'Dashboard' }] },
  { group: 'Quản lý CLB', items: [
    { to: '/cn/members', icon: '👥', label: 'Thành viên' },
    { to: '/cn/events', icon: '📅', label: 'Sự kiện' },
    { to: '/cn/finance', icon: '💰', label: 'Tài chính' },
    { to: '/cn/notifications', icon: '🔔', label: 'Thông báo' },
  ]},
];

const userNav = [
  { group: 'Khám phá', items: [
    { to: '/clubs', icon: '🏢', label: 'Câu lạc bộ' },
    { to: '/events', icon: '📅', label: 'Sự kiện' },
  ]},
  { group: 'Của tôi', items: [
    { to: '/my-events', icon: '🗓️', label: 'Sự kiện của tôi' },
    { to: '/my-score', icon: '⭐', label: 'Điểm tích lũy' },
    { to: '/my-requests', icon: '📋', label: 'Yêu cầu của tôi' },
    { to: '/notifications', icon: '🔔', label: 'Thông báo' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);

  const nav = user?.vai_tro === 'admin' ? adminNav : user?.vai_tro === 'chu_nhiem' ? cnNav : userNav;

  const roleLabel = { admin: 'Quản trị viên', chu_nhiem: 'Chủ nhiệm CLB', thanh_vien: 'Thành viên', sinh_vien: 'Sinh viên' };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnread(res.data.count);
    } catch {}
  };

  const toggleNotif = async () => {
    if (!showNotif) {
      const res = await api.get('/notifications');
      setNotifs(res.data.slice(0, 10));
    }
    setShowNotif(!showNotif);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(n => n.map(x => x.thong_bao_id === id ? { ...x, da_doc: 1 } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const notifPath = user?.vai_tro === 'admin' ? null : user?.vai_tro === 'chu_nhiem' ? '/cn/notifications' : '/notifications';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <h2>Quản lý CLB TNUT</h2>
        </div>
        <nav className="sidebar-nav">
          {nav.map(group => (
            <div className="nav-group" key={group.group}>
              <div className="nav-group-label">{group.group}</div>
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="icon">👤</span> Hồ sơ
          </NavLink>
          <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
            <span className="icon">🚪</span> Đăng xuất
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-title">Hệ Thống Quản Lý CLB</div>
        <div className="topbar-right">
          <button className="notif-btn" onClick={toggleNotif}>
            🔔 {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          <div className="user-menu" onClick={() => navigate('/profile')}>
            <div className="user-avatar">{user?.ho_ten?.[0] || 'U'}</div>
            <div className="user-info">
              <div className="name">{user?.ho_ten}</div>
              <div className="role">{roleLabel[user?.vai_tro]}</div>
            </div>
          </div>
        </div>
      </header>

      {showNotif && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowNotif(false)} />
          <div className="notif-panel">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Thông báo</strong>
              {notifPath && <button className="btn btn-sm btn-secondary" onClick={() => { navigate(notifPath); setShowNotif(false); }}>Xem tất cả</button>}
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>Không có thông báo</div>
            ) : notifs.map(n => (
              <div key={n.thong_bao_id} className={`notif-item${!n.da_doc ? ' unread' : ''}`} onClick={() => markRead(n.thong_bao_id)}>
                <div className="notif-item-title">{n.tieu_de}</div>
                <div className="notif-item-text">{n.noi_dung}</div>
                <div className="notif-item-time">{new Date(n.thoi_gian).toLocaleString('vi-VN')}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
