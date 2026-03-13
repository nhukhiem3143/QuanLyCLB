import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const linhVucList = ['', 'Công nghệ', 'Nghệ thuật', 'Thể thao', 'Học thuật', 'Kỹ năng mềm', 'Khác'];
const linhVucEmoji = { 'Công nghệ': '💻', 'Nghệ thuật': '🎨', 'Thể thao': '⚽', 'Học thuật': '📚', 'Kỹ năng mềm': '🤝', 'Khác': '🏢' };

export default function ClubList() {
  const [clubs, setClubs] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [reqForm, setReqForm] = useState({ ten_clb: '', mo_ta: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = filter ? { linh_vuc: filter } : {};
    api.get('/clubs', { params }).then(r => setClubs(r.data));
  }, [filter]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/create-club-requests', reqForm);
      setMsg('Gửi yêu cầu thành công! Chờ Admin duyệt.');
      setShowRequest(false);
    } catch (err) { setMsg(err.response?.data?.message); }
  };

  const filtered = clubs.filter(c => c.ten_clb.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Câu lạc bộ</div>
          <div className="page-subtitle">Khám phá và tham gia các CLB trong trường</div>
        </div>
        <button className="btn btn-outline" onClick={() => setShowRequest(true)}>📝 Yêu cầu lập CLB</button>
      </div>

      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="search-bar">
        <input className="form-control search-input" placeholder="🔍 Tìm câu lạc bộ..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control form-select" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          {linhVucList.map(l => <option key={l} value={l}>{l || 'Tất cả lĩnh vực'}</option>)}
        </select>
      </div>

      <div className="grid grid-3">
        {filtered.map(c => (
          <div className="club-card" key={c.clb_id} onClick={() => navigate(`/clubs/${c.clb_id}`)}>
            <div className="club-card-img">
              <span style={{ fontSize: 48 }}>{linhVucEmoji[c.linh_vuc] || '🏢'}</span>
            </div>
            <div className="club-card-body">
              <div className="club-card-name">{c.ten_clb}</div>
              <div className="club-card-desc">{c.mo_ta || 'Chưa có mô tả'}</div>
            </div>
            <div className="club-card-footer">
              <span className="badge badge-secondary">{c.linh_vuc}</span>
              <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>👥 {c.so_thanh_vien} thành viên</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state"><div className="icon">🏢</div><p>Không có CLB nào</p></div>}

      {showRequest && (
        <div className="modal-overlay" onClick={() => setShowRequest(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Yêu cầu lập CLB mới</div>
              <button className="modal-close" onClick={() => setShowRequest(false)}>✕</button>
            </div>
            <form onSubmit={handleSendRequest}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Tên CLB *</label>
                  <input className="form-control" value={reqForm.ten_clb} onChange={e => setReqForm({...reqForm, ten_clb: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Mô tả</label>
                  <textarea className="form-control" rows={4} value={reqForm.mo_ta} onChange={e => setReqForm({...reqForm, mo_ta: e.target.value})} placeholder="Giới thiệu về CLB bạn muốn thành lập..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequest(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Gửi yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
