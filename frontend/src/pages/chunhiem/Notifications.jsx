import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CnNotifications() {
  const { user } = useAuth();
  const [myClub, setMyClub] = useState(null);
  const [form, setForm] = useState({ tieu_de: '', noi_dung: '' });
  const [myNotifs, setMyNotifs] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/clubs').then(r => {
      const club = r.data.find(c => c.chu_nhiem_id === user.user_id) || r.data[0];
      setMyClub(club);
    });
    api.get('/notifications').then(r => setMyNotifs(r.data));
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', { ...form, clb_id: myClub?.clb_id });
      setMsg('Đã gửi thông báo đến tất cả thành viên CLB');
      setForm({ tieu_de: '', noi_dung: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); }
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setMyNotifs(n => n.map(x => x.thong_bao_id === id ? { ...x, da_doc: 1 } : x));
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Thông báo</div><div className="page-subtitle">Gửi thông báo đến thành viên CLB</div></div>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="grid grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header"><div className="card-title">📢 Gửi thông báo mới</div></div>
          <div className="card-body">
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">Tiêu đề *</label>
                <input className="form-control" value={form.tieu_de} onChange={e => setForm({...form, tieu_de: e.target.value})} required placeholder="Tiêu đề thông báo..." />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung *</label>
                <textarea className="form-control" rows={5} value={form.noi_dung} onChange={e => setForm({...form, noi_dung: e.target.value})} required placeholder="Nội dung thông báo..." />
              </div>
              <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--primary-dark)', marginBottom: 16 }}>
                📢 Thông báo sẽ được gửi đến tất cả thành viên của <strong>{myClub?.ten_clb}</strong>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>🔔 Gửi thông báo</button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📬 Thông báo của tôi</div></div>
          <div>
            {myNotifs.slice(0, 10).map(n => (
              <div key={n.thong_bao_id} onClick={() => !n.da_doc && markRead(n.thong_bao_id)}
                style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', cursor: !n.da_doc ? 'pointer' : 'default',
                  background: !n.da_doc ? 'var(--primary-light)' : 'white' }}>
                <div style={{ fontWeight: n.da_doc ? 500 : 700, fontSize: 13.5, marginBottom: 3 }}>{n.tieu_de}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{n.noi_dung}</div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-400)', marginTop: 5 }}>{new Date(n.thoi_gian).toLocaleString('vi-VN')}</div>
              </div>
            ))}
            {myNotifs.length === 0 && <div className="empty-state"><div className="icon">🔔</div><p>Không có thông báo</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
