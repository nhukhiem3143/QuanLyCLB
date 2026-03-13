import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CnDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myClub, setMyClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingJoin, setPendingJoin] = useState([]);

  useEffect(() => {
    api.get('/clubs').then(r => {
      const club = r.data.find(c => c.chu_nhiem_id === user.user_id);
      if (club) {
        setMyClub(club);
        api.get(`/clubs/${club.clb_id}/members`).then(m => {
          setMembers(m.data.filter(x => x.trang_thai === 'da_duyet'));
          setPendingJoin(m.data.filter(x => x.trang_thai === 'cho_duyet').length);
        });
        api.get('/events', { params: { clb_id: club.clb_id } }).then(e => setEvents(e.data));
      }
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Chủ nhiệm</div>
          <div className="page-subtitle">Tổng quan hoạt động CLB của bạn</div>
        </div>
      </div>

      {myClub ? (
        <>
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 48 }}>🏢</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{myClub.ten_clb}</div>
                <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13.5, marginTop: 4 }}>{myClub.mo_ta}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, color: 'rgba(255,255,255,.9)', fontSize: 13 }}>
                  <span>👥 {myClub.so_thanh_vien} thành viên</span>
                  <span>📅 {events.length} sự kiện</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: 'white' }}>{myClub.linh_vuc}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {[
              { icon: '👥', label: 'Thành viên', value: members.length, color: 'blue', to: '/cn/members' },
              { icon: '⏳', label: 'Chờ duyệt tham gia', value: pendingJoin, color: 'yellow', to: '/cn/members' },
              { icon: '📅', label: 'Tổng sự kiện', value: events.length, color: 'green', to: '/cn/events' },
              { icon: '✅', label: 'Đã duyệt', value: events.filter(e => e.trang_thai === 'da_duyet').length, color: 'red', to: '/cn/events' },
            ].map(s => (
              <div className="stat-card" key={s.label} onClick={() => navigate(s.to)} style={{ cursor: 'pointer' }}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">📅 Sự kiện gần đây</div></div>
              <div className="card-body">
                {events.slice(0, 5).map(e => (
                  <div key={e.su_kien_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.ten_su_kien}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(e.thoi_gian_bat_dau).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <span className={`badge ${e.trang_thai === 'da_duyet' ? 'badge-success' : e.trang_thai === 'tu_choi' ? 'badge-danger' : 'badge-warning'}`}>
                      {e.trang_thai === 'da_duyet' ? 'Đã duyệt' : e.trang_thai === 'tu_choi' ? 'Từ chối' : 'Chờ duyệt'}
                    </span>
                  </div>
                ))}
                {events.length === 0 && <div style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chưa có sự kiện</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">👥 Thành viên mới nhất</div></div>
              <div className="card-body">
                {members.slice(0, 5).map(m => (
                  <div key={m.tv_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
                      {m.ho_ten?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.ho_ten}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{m.ngay_tham_gia}</div>
                    </div>
                  </div>
                ))}
                {members.length === 0 && <div style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chưa có thành viên</div>}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="icon">🏢</div>
          <p>Bạn chưa được phân công quản lý CLB nào</p>
        </div>
      )}
    </div>
  );
}
