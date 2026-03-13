import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState('');

  const fetch = () => api.get('/admin/pending-events').then(r => setEvents(r.data));
  useEffect(() => { fetch(); }, []);

  const duyet = async (id, trang_thai) => {
    await api.put(`/admin/events/${id}/approve`, { trang_thai });
    setMsg(trang_thai === 'da_duyet' ? 'Đã phê duyệt sự kiện' : 'Đã từ chối sự kiện');
    fetch();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Duyệt sự kiện</div>
          <div className="page-subtitle">Phê duyệt các sự kiện được đề xuất từ CLB</div>
        </div>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tên sự kiện</th><th>CLB</th><th>Người tạo</th><th>Thời gian bắt đầu</th><th>Học kỳ</th><th>Thao tác</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.su_kien_id}>
                  <td><strong>{e.ten_su_kien}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{e.mo_ta}</small></td>
                  <td>{e.ten_clb}</td>
                  <td>{e.ten_nguoi_tao}</td>
                  <td>{new Date(e.thoi_gian_bat_dau).toLocaleString('vi-VN')}</td>
                  <td><span className="badge badge-info">{e.hoc_ky}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-success" onClick={() => duyet(e.su_kien_id, 'da_duyet')}>✅ Duyệt</button>
                      <button className="btn btn-sm btn-danger" onClick={() => duyet(e.su_kien_id, 'tu_choi')}>❌ Từ chối</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="empty-state"><div className="icon">📅</div><p>Không có sự kiện chờ duyệt</p></div>}
        </div>
      </div>
    </div>
  );
}
