import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);

  const fetch = () => api.get('/notifications').then(r => setNotifs(r.data));
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(n => n.map(x => x.thong_bao_id === id ? { ...x, da_doc: 1 } : x));
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, da_doc: 1 })));
  };

  const unread = notifs.filter(n => !n.da_doc).length;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Thông báo</div><div className="page-subtitle">{unread > 0 ? `${unread} thông báo chưa đọc` : 'Tất cả đã đọc'}</div></div>
        {unread > 0 && <button className="btn btn-outline" onClick={markAll}>✅ Đọc tất cả</button>}
      </div>
      <div className="card">
        {notifs.map(n => (
          <div key={n.thong_bao_id} onClick={() => !n.da_doc && markRead(n.thong_bao_id)}
            style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', cursor: !n.da_doc ? 'pointer' : 'default',
              background: !n.da_doc ? 'var(--primary-light)' : 'white', transition: '.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: n.da_doc ? 500 : 700, fontSize: 14, marginBottom: 4 }}>
                  {!n.da_doc && <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', marginRight: 8 }} />}
                  {n.tieu_de}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{n.noi_dung}</div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 6 }}>
                  {n.ten_clb && <span>{n.ten_clb} · </span>}
                  {new Date(n.thoi_gian).toLocaleString('vi-VN')}
                </div>
              </div>
              {!n.da_doc && <span className="badge badge-info" style={{ flexShrink: 0 }}>Mới</span>}
            </div>
          </div>
        ))}
        {notifs.length === 0 && <div className="empty-state"><div className="icon">🔔</div><p>Không có thông báo nào</p></div>}
      </div>
    </div>
  );
}
