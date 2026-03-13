import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function MyEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => { api.get('/my-events').then(r => setEvents(r.data)); }, []);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Sự kiện của tôi</div><div className="page-subtitle">Lịch sử tham gia sự kiện</div></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tên sự kiện</th><th>CLB</th><th>Thời gian</th><th>Điểm rèn luyện</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.dang_ky_id}>
                  <td><strong>{e.ten_su_kien}</strong></td>
                  <td>{e.ten_clb}</td>
                  <td>{new Date(e.thoi_gian_bat_dau).toLocaleString('vi-VN')}</td>
                  <td><strong style={{ color: 'var(--primary)' }}>{e.diem_tich_luy ?? '-'}</strong></td>
                  <td>
                    <span className={`badge ${e.da_diem_danh ? 'badge-success' : e.trang_thai === 'huy' ? 'badge-danger' : 'badge-warning'}`}>
                      {e.da_diem_danh ? '✅ Đã điểm danh' : e.trang_thai === 'huy' ? 'Đã hủy' : '⏳ Chờ điểm danh'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="empty-state"><div className="icon">🗓️</div><p>Bạn chưa đăng ký sự kiện nào</p></div>}
        </div>
      </div>
    </div>
  );
}
