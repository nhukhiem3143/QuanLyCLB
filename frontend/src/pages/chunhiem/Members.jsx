import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CnMembers() {
  const { user } = useAuth();
  const [myClub, setMyClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('members');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/clubs').then(r => {
      const club = r.data.find(c => c.chu_nhiem_id === user.user_id) || r.data[0];
      if (club) {
        setMyClub(club);
        loadMembers(club.clb_id);
        loadPending(club.clb_id);
      }
    });
  }, []);

  const loadMembers = (clb_id) => {
    api.get(`/clubs/${clb_id}/members`).then(r => {
      setMembers(r.data.filter(m => m.trang_thai === 'da_duyet'));
      setPending(r.data.filter(m => m.trang_thai === 'cho_duyet'));
    });
  };

  const loadPending = (clb_id) => {
    api.get(`/join-requests/club/${clb_id}`).then(r => {
      setPending(r.data.filter(x => x.trang_thai === 'cho_duyet'));
    });
  };

  const approveJoin = async (id, trang_thai) => {
    await api.put(`/join-requests/${id}`, { trang_thai });
    setMsg(trang_thai === 'da_duyet' ? 'Đã duyệt thành viên' : 'Đã từ chối');
    if (myClub) { loadMembers(myClub.clb_id); loadPending(myClub.clb_id); }
  };

  const removeMembers = async (tv_id) => {
    if (!confirm('Xóa thành viên này?')) return;
    await api.delete(`/clubs/members/${tv_id}`);
    setMsg('Đã xóa thành viên');
    if (myClub) loadMembers(myClub.clb_id);
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Quản lý thành viên</div><div className="page-subtitle">{myClub?.ten_clb}</div></div>
      </div>
      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="tabs">
        <div className={`tab${tab === 'members' ? ' active' : ''}`} onClick={() => setTab('members')}>
          ✅ Thành viên ({members.length})
        </div>
        <div className={`tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>
          ⏳ Chờ duyệt {pending.length > 0 && <span className="badge badge-warning" style={{ marginLeft: 6 }}>{pending.length}</span>}
        </div>
      </div>

      {tab === 'members' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Ngày tham gia</th><th>Thao tác</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.tv_id}>
                    <td><strong>{m.ho_ten}</strong></td>
                    <td>{m.email}</td>
                    <td>{m.so_dien_thoai || '-'}</td>
                    <td><span className={`badge ${m.vai_tro === 'chu_nhiem' ? 'badge-info' : 'badge-secondary'}`}>
                      {m.vai_tro === 'chu_nhiem' ? 'Chủ nhiệm' : m.vai_tro === 'pho_chu_nhiem' ? 'Phó CN' : 'Thành viên'}
                    </span></td>
                    <td>{m.ngay_tham_gia}</td>
                    <td>
                      {m.vai_tro !== 'chu_nhiem' && (
                        <button className="btn btn-sm btn-danger" onClick={() => removeMembers(m.tv_id)}>🗑 Xóa</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && <div className="empty-state"><div className="icon">👥</div><p>Chưa có thành viên</p></div>}
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Thời gian gửi</th><th>Thao tác</th></tr></thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.yc_id}>
                    <td><strong>{p.ho_ten}</strong></td>
                    <td>{p.email}</td>
                    <td>{p.so_dien_thoai || '-'}</td>
                    <td>{new Date(p.thoi_gian).toLocaleString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-success" onClick={() => approveJoin(p.yc_id, 'da_duyet')}>✅ Duyệt</button>
                        <button className="btn btn-sm btn-danger" onClick={() => approveJoin(p.yc_id, 'tu_choi')}>❌ Từ chối</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pending.length === 0 && <div className="empty-state"><div className="icon">⏳</div><p>Không có yêu cầu nào</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
