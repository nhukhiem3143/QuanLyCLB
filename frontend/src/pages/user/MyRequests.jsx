import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function MyRequests() {
  const [joinReqs, setJoinReqs] = useState([]);
  const [clubReqs, setClubReqs] = useState([]);
  const [tab, setTab] = useState('join');

  useEffect(() => {
    api.get('/join-requests/my').then(r => setJoinReqs(r.data));
    // Club requests not separated by user in backend, load join requests only
  }, []);

  const sColor = { cho_duyet: 'badge-warning', da_duyet: 'badge-success', tu_choi: 'badge-danger' };
  const sLabel = { cho_duyet: 'Chờ duyệt', da_duyet: 'Đã duyệt', tu_choi: 'Từ chối' };

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Yêu cầu của tôi</div><div className="page-subtitle">Theo dõi trạng thái yêu cầu</div></div></div>
      <div className="tabs">
        <div className={`tab${tab === 'join' ? ' active' : ''}`} onClick={() => setTab('join')}>Yêu cầu tham gia CLB</div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Câu lạc bộ</th><th>Thời gian gửi</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {joinReqs.map(r => (
                <tr key={r.yc_id}>
                  <td><strong>{r.ten_clb}</strong></td>
                  <td>{new Date(r.thoi_gian).toLocaleString('vi-VN')}</td>
                  <td><span className={`badge ${sColor[r.trang_thai]}`}>{sLabel[r.trang_thai]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {joinReqs.length === 0 && <div className="empty-state"><div className="icon">📋</div><p>Chưa có yêu cầu nào</p></div>}
        </div>
      </div>
    </div>
  );
}
