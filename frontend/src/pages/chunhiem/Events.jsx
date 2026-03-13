import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CnEvents() {
  const { user } = useAuth();
  const [myClub, setMyClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAttend, setShowAttend] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    ten_su_kien: '', mo_ta: '', thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '',
    hoc_ky: 'HK1_2025_2026', gioi_han_nguoi: 100, cong_khai: true, mo_dang_ky: true
  });

  useEffect(() => {
    api.get('/clubs').then(r => {
      const club = r.data.find(c => c.chu_nhiem_id === user.user_id) || r.data[0];
      if (club) { setMyClub(club); loadEvents(club.clb_id); }
    });
  }, []);

  const loadEvents = (clb_id) => api.get('/events', { params: { clb_id } }).then(r => setEvents(r.data));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', { ...form, clb_id: myClub.clb_id });
      setMsg('Tạo sự kiện thành công! Chờ Admin duyệt.');
      setShowModal(false);
      loadEvents(myClub.clb_id);
      setForm({ ten_su_kien: '', mo_ta: '', thoi_gian_bat_dau: '', thoi_gian_ket_thuc: '', hoc_ky: 'HK1_2025_2026', gioi_han_nguoi: 100, cong_khai: true, mo_dang_ky: true });
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); }
  };

  const openAttend = async (event) => {
    setShowAttend(event);
    const res = await api.get(`/events/${event.su_kien_id}/participants`);
    setParticipants(res.data);
  };

  const handleAttend = async (tv_id, diem) => {
    await api.post('/events/attendance', {
      su_kien_id: showAttend.su_kien_id, tv_id, thoi_gian_vao: new Date().toISOString(), diem_tich_luy: diem
    });
    const res = await api.get(`/events/${showAttend.su_kien_id}/participants`);
    setParticipants(res.data);
  };

  const statusColor = { cho_duyet: 'badge-warning', da_duyet: 'badge-success', tu_choi: 'badge-danger', hoan_thanh: 'badge-secondary' };
  const statusLabel = { cho_duyet: 'Chờ duyệt', da_duyet: 'Đã duyệt', tu_choi: 'Từ chối', hoan_thanh: 'Hoàn thành' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Quản lý sự kiện</div><div className="page-subtitle">{myClub?.ten_clb}</div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Tạo sự kiện</button>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tên sự kiện</th><th>Thời gian</th><th>Đăng ký</th><th>Học kỳ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.su_kien_id}>
                  <td><strong>{e.ten_su_kien}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{e.mo_ta}</small></td>
                  <td><small>{new Date(e.thoi_gian_bat_dau).toLocaleString('vi-VN')}</small></td>
                  <td>{e.so_dang_ky}/{e.gioi_han_nguoi || '∞'}</td>
                  <td><span className="badge badge-secondary">{e.hoc_ky}</span></td>
                  <td><span className={`badge ${statusColor[e.trang_thai]}`}>{statusLabel[e.trang_thai]}</span></td>
                  <td>
                    {e.trang_thai === 'da_duyet' && (
                      <button className="btn btn-sm btn-primary" onClick={() => openAttend(e)}>📋 Điểm danh</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="empty-state"><div className="icon">📅</div><p>Chưa có sự kiện nào</p></div>}
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tạo sự kiện mới</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên sự kiện *</label>
                  <input className="form-control" value={form.ten_su_kien} onChange={e => setForm({...form, ten_su_kien: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={form.mo_ta} onChange={e => setForm({...form, mo_ta: e.target.value})} />
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Thời gian bắt đầu *</label>
                    <input type="datetime-local" className="form-control" value={form.thoi_gian_bat_dau} onChange={e => setForm({...form, thoi_gian_bat_dau: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian kết thúc</label>
                    <input type="datetime-local" className="form-control" value={form.thoi_gian_ket_thuc} onChange={e => setForm({...form, thoi_gian_ket_thuc: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Học kỳ</label>
                    <input className="form-control" value={form.hoc_ky} onChange={e => setForm({...form, hoc_ky: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giới hạn người</label>
                    <input type="number" className="form-control" value={form.gioi_han_nguoi} onChange={e => setForm({...form, gioi_han_nguoi: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                    <input type="checkbox" checked={form.cong_khai} onChange={e => setForm({...form, cong_khai: e.target.checked})} />
                    Công khai
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                    <input type="checkbox" checked={form.mo_dang_ky} onChange={e => setForm({...form, mo_dang_ky: e.target.checked})} />
                    Mở đăng ký
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">📅 Tạo sự kiện</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance modal */}
      {showAttend && (
        <div className="modal-overlay" onClick={() => setShowAttend(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📋 Điểm danh: {showAttend.ten_su_kien}</div>
              <button className="modal-close" onClick={() => setShowAttend(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Họ tên</th><th>Email</th><th>Điểm danh</th><th>Điểm</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {participants.map(p => (
                      <tr key={p.dang_ky_id}>
                        <td>{p.ho_ten}</td>
                        <td>{p.email}</td>
                        <td>{p.thoi_gian_vao ? <span className="badge badge-success">✅ Đã điểm danh</span> : <span className="badge badge-warning">Chưa</span>}</td>
                        <td>{p.diem_tich_luy ?? '-'}</td>
                        <td>
                          {!p.thoi_gian_vao && (
                            <button className="btn btn-sm btn-success" onClick={() => handleAttend(p.tv_id, 10)}>✅ Điểm danh (+10)</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {participants.length === 0 && <div className="empty-state"><p>Chưa có ai đăng ký</p></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
