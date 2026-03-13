// ClubRequests.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export function AdminClubRequests() {
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState('');

  const fetch = () => api.get('/admin/club-requests').then(r => setRequests(r.data));
  useEffect(() => { fetch(); }, []);

  const duyet = async (id, trang_thai) => {
    try {
      await api.put(`/admin/club-requests/${id}`, { trang_thai });
      setMsg(trang_thai === 'da_duyet' ? 'Đã duyệt yêu cầu' : 'Đã từ chối');
      fetch();
    } catch (err) { setMsg(err.response?.data?.message); }
  };

  const statusColor = { cho_duyet: 'badge-warning', da_duyet: 'badge-success', tu_choi: 'badge-danger' };
  const statusLabel = { cho_duyet: 'Chờ duyệt', da_duyet: 'Đã duyệt', tu_choi: 'Từ chối' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Yêu cầu lập CLB</div>
          <div className="page-subtitle">Duyệt các yêu cầu thành lập CLB mới</div>
        </div>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tên CLB</th><th>Người yêu cầu</th><th>Email</th><th>Mô tả</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.yeu_cau_id}>
                  <td><strong>{r.ten_clb}</strong></td>
                  <td>{r.ho_ten}</td><td>{r.email}</td>
                  <td style={{ maxWidth: 200 }}><small>{r.mo_ta}</small></td>
                  <td><small>{new Date(r.thoi_gian).toLocaleString('vi-VN')}</small></td>
                  <td><span className={`badge ${statusColor[r.trang_thai]}`}>{statusLabel[r.trang_thai]}</span></td>
                  <td>
                    {r.trang_thai === 'cho_duyet' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-success" onClick={() => duyet(r.yeu_cau_id, 'da_duyet')}>✅ Duyệt</button>
                        <button className="btn btn-sm btn-danger" onClick={() => duyet(r.yeu_cau_id, 'tu_choi')}>❌ Từ chối</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <div className="empty-state"><div className="icon">📋</div><p>Không có yêu cầu nào</p></div>}
        </div>
      </div>
    </div>
  );
}

export default AdminClubRequests;
