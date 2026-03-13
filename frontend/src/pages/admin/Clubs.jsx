import { useState, useEffect } from 'react';
import api from '../../utils/api';

const linhVucList = ['Công nghệ', 'Nghệ thuật', 'Thể thao', 'Học thuật', 'Kỹ năng mềm', 'Khác'];
const statusColor = { dang_hoat_dong: 'badge-success', tam_ngung: 'badge-warning', cho_duyet: 'badge-info' };
const statusLabel = { dang_hoat_dong: 'Đang hoạt động', tam_ngung: 'Tạm ngừng', cho_duyet: 'Chờ duyệt' };

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ten_clb: '', mo_ta: '', linh_vuc: 'Công nghệ', muc_tieu: '', noi_quy: '' });
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const fetch = () => api.get('/clubs').then(r => setClubs(r.data));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.post('/clubs', form); setMsg('Tạo CLB thành công'); setShowModal(false); fetch(); }
    catch (err) { setMsg(err.response?.data?.message); }
  };

  const toggleStatus = async (club) => {
    const newStatus = club.trang_thai === 'dang_hoat_dong' ? 'tam_ngung' : 'dang_hoat_dong';
    await api.put(`/clubs/${club.clb_id}`, { ...club, trang_thai: newStatus });
    fetch();
  };

  const remove = async (id) => {
    if (!confirm('Xóa CLB này?')) return;
    await api.delete(`/clubs/${id}`); fetch();
  };

  const filtered = clubs.filter(c => c.ten_clb.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý câu lạc bộ</div>
          <div className="page-subtitle">Quản lý tất cả CLB trong trường</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Thêm CLB</button>
      </div>

      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="card">
        <div className="card-header">
          <input className="form-control" style={{ maxWidth: 300 }} placeholder="🔍 Tìm CLB..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Tên CLB</th><th>Lĩnh vực</th><th>Chủ nhiệm</th><th>Thành viên</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.clb_id}>
                  <td><strong>{c.ten_clb}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{c.ngay_thanh_lap}</small></td>
                  <td><span className="badge badge-secondary">{c.linh_vuc}</span></td>
                  <td>{c.ten_chu_nhiem || '-'}</td>
                  <td><strong>{c.so_thanh_vien}</strong></td>
                  <td><span className={`badge ${statusColor[c.trang_thai]}`}>{statusLabel[c.trang_thai]}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className={`btn btn-sm ${c.trang_thai === 'dang_hoat_dong' ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleStatus(c)}>
                      {c.trang_thai === 'dang_hoat_dong' ? '⏸ Tạm ngừng' : '▶ Kích hoạt'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(c.clb_id)}>🗑 Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><div className="icon">🏢</div><p>Không có CLB nào</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Thêm câu lạc bộ</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Tên CLB *</label>
                  <input className="form-control" value={form.ten_clb} onChange={e => setForm({...form, ten_clb: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Lĩnh vực</label>
                  <select className="form-control form-select" value={form.linh_vuc} onChange={e => setForm({...form, linh_vuc: e.target.value})}>
                    {linhVucList.map(l => <option key={l}>{l}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Mô tả</label>
                  <textarea className="form-control" value={form.mo_ta} onChange={e => setForm({...form, mo_ta: e.target.value})} rows={3} /></div>
                <div className="form-group"><label className="form-label">Mục tiêu</label>
                  <textarea className="form-control" value={form.muc_tieu} onChange={e => setForm({...form, muc_tieu: e.target.value})} rows={2} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo CLB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
