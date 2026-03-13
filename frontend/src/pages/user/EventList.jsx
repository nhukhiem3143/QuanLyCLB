// EventList.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const { user } = useAuth();

  useEffect(() => { api.get('/events', { params: { cong_khai: '1' } }).then(r => setEvents(r.data)); }, []);

  const register = async (su_kien_id) => {
    try { await api.post('/events/register', { su_kien_id }); setMsg('Đăng ký thành công!'); setMsgType('success'); }
    catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); setMsgType('danger'); }
  };

  const follow = async (su_kien_id) => {
    try { await api.post('/events/follow', { su_kien_id }); setMsg('Đã theo dõi'); setMsgType('success'); }
    catch { setMsg('Đã theo dõi rồi'); setMsgType('warning'); }
  };

  const isMember = ['thanh_vien', 'chu_nhiem', 'admin'].includes(user?.vai_tro);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Sự kiện</div><div className="page-subtitle">Danh sách sự kiện công khai</div></div>
      </div>
      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}
      <div className="grid grid-2">
        {events.map(e => (
          <div className="card" key={e.su_kien_id}>
            <div style={{ padding: '14px 20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{e.ten_su_kien}</div>
                <span className="badge badge-info">{e.ten_clb}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '8px 0' }}>{e.mo_ta}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--gray-600)', marginBottom: 14 }}>
                <span>🕐 {new Date(e.thoi_gian_bat_dau).toLocaleString('vi-VN')}</span>
                <span>👥 {e.so_dang_ky} đăng ký</span>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}>
              {isMember && e.mo_dang_ky
                ? <button className="btn btn-sm btn-primary" onClick={() => register(e.su_kien_id)}>📝 Đăng ký</button>
                : <button className="btn btn-sm btn-outline" onClick={() => follow(e.su_kien_id)}>👁 Theo dõi</button>}
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">📅</div><p>Không có sự kiện công khai</p></div>}
      </div>
    </div>
  );
}
