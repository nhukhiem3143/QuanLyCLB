import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return <div className="loading-center"><span className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Tổng quan hệ thống quản lý CLB</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '🏢', label: 'CLB đang hoạt động', value: stats.totalCLB, color: 'blue', to: '/admin/clubs' },
          { icon: '👥', label: 'Tổng người dùng', value: stats.totalUsers, color: 'green', to: '/admin/users' },
          { icon: '📅', label: 'Tổng sự kiện', value: stats.totalEvents, color: 'yellow', to: '/admin/events' },
          { icon: '🎓', label: 'Tổng thành viên', value: stats.totalMembers, color: 'red', to: '/admin/clubs' },
        ].map(s => (
          <div className="stat-card" key={s.label} onClick={() => navigate(s.to)} style={{ cursor: 'pointer' }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">🏢 CLB theo lĩnh vực</div></div>
          <div className="card-body">
            {stats.clbByLinhVuc.map(r => (
              <div key={r.linh_vuc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--gray-700)' }}>{r.linh_vuc}</span>
                <span className="badge badge-info">{r.count}</span>
              </div>
            ))}
            {stats.clbByLinhVuc.length === 0 && <div className="empty-state"><p>Chưa có dữ liệu</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">👥 Thành viên theo CLB</div></div>
          <div className="card-body">
            {stats.memberByCLB.map(r => (
              <div key={r.ten_clb} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{r.ten_clb}</span><span style={{ fontWeight: 600 }}>{r.so_thanh_vien}</span>
                </div>
                <div style={{ background: 'var(--gray-100)', borderRadius: 4, height: 6 }}>
                  <div style={{ background: 'var(--primary)', borderRadius: 4, height: 6, width: `${Math.min(100, (r.so_thanh_vien / (stats.memberByCLB[0]?.so_thanh_vien || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
