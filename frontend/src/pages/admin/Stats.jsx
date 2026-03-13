import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return <div className="loading-center"><span className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Thống kê hệ thống</div>
          <div className="page-subtitle">Báo cáo tổng quan hoạt động CLB toàn trường</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '🏢', label: 'CLB hoạt động', value: stats.totalCLB, color: 'blue' },
          { icon: '👥', label: 'Người dùng', value: stats.totalUsers, color: 'green' },
          { icon: '📅', label: 'Sự kiện', value: stats.totalEvents, color: 'yellow' },
          { icon: '🎓', label: 'Thành viên', value: stats.totalMembers, color: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">🥧 CLB theo lĩnh vực</div></div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.clbByLinhVuc} dataKey="count" nameKey="linh_vuc" cx="50%" cy="50%" outerRadius={90} label={({ linh_vuc, count }) => `${linh_vuc}: ${count}`}>
                  {stats.clbByLinhVuc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📊 Thành viên theo CLB</div></div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.memberByCLB} margin={{ left: -10 }}>
                <XAxis dataKey="ten_clb" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="so_thanh_vien" fill="#2563eb" radius={[4, 4, 0, 0]} name="Thành viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📅 Sự kiện theo học kỳ</div></div>
          <div className="card-body" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.eventByHocKy}>
                <XAxis dataKey="hoc_ky" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Sự kiện" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📋 Bảng thống kê CLB</div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tên CLB</th><th>Thành viên</th></tr></thead>
              <tbody>
                {stats.memberByCLB.map(r => (
                  <tr key={r.ten_clb}>
                    <td>{r.ten_clb}</td>
                    <td><strong>{r.so_thanh_vien}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
