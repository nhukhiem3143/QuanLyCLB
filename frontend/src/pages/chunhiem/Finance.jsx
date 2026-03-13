import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CnFinance() {
  const { user } = useAuth();
  const [myClub, setMyClub] = useState(null);
  const [data, setData] = useState({ records: [], tongThu: 0, tongChi: 0, soDu: 0 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ so_tien: '', loai: 'thu', mo_ta: '' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/clubs').then(r => {
      const club = r.data.find(c => c.chu_nhiem_id === user.user_id) || r.data[0];
      if (club) { setMyClub(club); loadFinance(club.clb_id); }
    });
  }, []);

  const loadFinance = (clb_id, loai = '') => {
    const params = loai ? { loai } : {};
    api.get(`/finance/${clb_id}`, { params }).then(r => setData(r.data));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance', { ...form, clb_id: myClub.clb_id });
      setMsg('Thêm giao dịch thành công');
      setShowModal(false);
      loadFinance(myClub.clb_id, filter);
      setForm({ so_tien: '', loai: 'thu', mo_ta: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa giao dịch này?')) return;
    await api.delete(`/finance/${id}`);
    loadFinance(myClub.clb_id, filter);
  };

  const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Quản lý tài chính</div><div className="page-subtitle">{myClub?.ten_clb}</div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Thêm giao dịch</button>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="finance-summary">
        <div className="finance-box">
          <div className="amount" style={{ color: 'var(--success)' }}>{fmt(data.tongThu)}</div>
          <div className="label">💰 Tổng thu</div>
        </div>
        <div className="finance-box">
          <div className="amount" style={{ color: 'var(--danger)' }}>{fmt(data.tongChi)}</div>
          <div className="label">💸 Tổng chi</div>
        </div>
        <div className="finance-box">
          <div className="amount" style={{ color: data.soDu >= 0 ? 'var(--primary)' : 'var(--danger)' }}>{fmt(data.soDu)}</div>
          <div className="label">📊 Số dư</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 10 }}>
            {['', 'thu', 'chi'].map(v => (
              <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilter(v); if (myClub) loadFinance(myClub.clb_id, v); }}>
                {v === '' ? 'Tất cả' : v === 'thu' ? '💰 Thu' : '💸 Chi'}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Loại</th><th>Số tiền</th><th>Mô tả</th><th>Người tạo</th><th>Thời gian</th><th></th></tr></thead>
            <tbody>
              {data.records.map(r => (
                <tr key={r.tai_chinh_id}>
                  <td><span className={`badge ${r.loai === 'thu' ? 'badge-success' : 'badge-danger'}`}>{r.loai === 'thu' ? '💰 Thu' : '💸 Chi'}</span></td>
                  <td><strong style={{ color: r.loai === 'thu' ? 'var(--success)' : 'var(--danger)' }}>{fmt(r.so_tien)}</strong></td>
                  <td>{r.mo_ta}</td>
                  <td>{r.ten_nguoi_tao}</td>
                  <td><small>{new Date(r.thoi_gian).toLocaleString('vi-VN')}</small></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.tai_chinh_id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.records.length === 0 && <div className="empty-state"><div className="icon">💰</div><p>Chưa có giao dịch nào</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Thêm giao dịch</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Loại giao dịch</label>
                  <select className="form-control form-select" value={form.loai} onChange={e => setForm({...form, loai: e.target.value})}>
                    <option value="thu">💰 Thu</option>
                    <option value="chi">💸 Chi</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Số tiền (VNĐ) *</label>
                  <input type="number" className="form-control" value={form.so_tien} onChange={e => setForm({...form, so_tien: e.target.value})} required min={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={3} value={form.mo_ta} onChange={e => setForm({...form, mo_ta: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">💾 Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
