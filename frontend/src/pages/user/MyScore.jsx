import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function MyScore() {
  const [scores, setScores] = useState([]);
  useEffect(() => { api.get('/my-score').then(r => setScores(r.data)); }, []);

  const xepLoaiColor = { A: 'badge-success', B: 'badge-info', C: 'badge-warning', D: 'badge-danger' };

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Điểm tích lũy</div><div className="page-subtitle">Điểm rèn luyện theo từng CLB</div></div></div>
      <div className="grid grid-2">
        {scores.map(s => (
          <div className="card" key={s.diem_id}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.ten_clb}</div>
                <span className={`badge ${xepLoaiColor[s.xep_loai]}`}>Loại {s.xep_loai}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{s.tong_diem}</div>
              <div style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>điểm tích lũy</div>
              <div style={{ marginTop: 12, background: 'var(--gray-100)', borderRadius: 6, height: 8 }}>
                <div style={{ background: 'var(--primary)', borderRadius: 6, height: 8, width: `${Math.min(100, s.tong_diem)}%`, transition: '.5s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>A≥80 · B≥60 · C≥40 · D&lt;40</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
                Vai trò: <strong>{s.vai_tro === 'chu_nhiem' ? 'Chủ nhiệm' : s.vai_tro === 'pho_chu_nhiem' ? 'Phó chủ nhiệm' : 'Thành viên'}</strong>
              </div>
            </div>
          </div>
        ))}
        {scores.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">⭐</div><p>Bạn chưa có điểm tích lũy nào</p></div>}
      </div>
    </div>
  );
}
