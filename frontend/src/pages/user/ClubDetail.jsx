import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('info');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    api.get(`/clubs/${id}`).then(r => setClub(r.data));
    api.get(`/clubs/${id}/members`).then(r => setMembers(r.data.filter(m => m.trang_thai === 'da_duyet')));
    api.get('/events', { params: { clb_id: id } }).then(r => setEvents(r.data.filter(e => e.trang_thai === 'da_duyet')));
  }, [id]);

  const joinClub = async () => {
    try {
      await api.post('/join-requests', { clb_id: id });
      setMsg('Gửi yêu cầu tham gia thành công! Đang chờ duyệt.');
      setMsgType('success');
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); setMsgType('danger'); }
  };

  const followEvent = async (su_kien_id) => {
    try { await api.post('/events/follow', { su_kien_id }); setMsg('Đã theo dõi sự kiện'); setMsgType('success'); }
    catch { setMsg('Đã theo dõi sự kiện này rồi'); setMsgType('warning'); }
  };

  const registerEvent = async (su_kien_id) => {
    try { await api.post('/events/register', { su_kien_id }); setMsg('Đăng ký sự kiện thành công!'); setMsgType('success'); }
    catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); setMsgType('danger'); }
  };

  if (!club) return <div className="loading-center"><span className="spinner" /></div>;

  const isMember = user.vai_tro === 'thanh_vien' || user.vai_tro === 'chu_nhiem' || user.vai_tro === 'admin';

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ height: 160, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24 }}>
          <div style={{ fontSize: 60 }}>🏢</div>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>{club.ten_clb}</h1>
            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: 'white' }}>{club.linh_vuc}</span>
              <span style={{ marginLeft: 12, fontSize: 13 }}>👥 {club.so_thanh_vien} thành viên</span>
            </div>
          </div>
          {user.vai_tro === 'sinh_vien' && (
            <button className="btn" style={{ marginLeft: 'auto', background: 'white', color: 'var(--primary)', fontWeight: 600 }} onClick={joinClub}>
              📝 Tham gia CLB
            </button>
          )}
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="tabs">
        {['info', 'members', 'events'].map(t => (
          <div key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'info' ? '📄 Thông tin' : t === 'members' ? '👥 Thành viên' : '📅 Sự kiện'}
          </div>
        ))}
      </div>

      {tab === 'info' && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-2" style={{ gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Thông tin CLB</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, fontSize: 13.5 }}>{club.mo_ta || 'Chưa có mô tả'}</p>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div><strong style={{ fontSize: 13 }}>Chủ nhiệm:</strong> <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{club.ten_chu_nhiem || '-'}</span></div>
                  <div><strong style={{ fontSize: 13 }}>Ngày thành lập:</strong> <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{club.ngay_thanh_lap || '-'}</span></div>
                  <div><strong style={{ fontSize: 13 }}>Lĩnh vực:</strong> <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{club.linh_vuc}</span></div>
                </div>
              </div>
              <div>
                {club.muc_tieu && <><h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Mục tiêu</h3><p style={{ fontSize: 13.5, color: 'var(--gray-600)', lineHeight: 1.7 }}>{club.muc_tieu}</p></>}
                {club.noi_quy && <><h3 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px' }}>Nội quy</h3><p style={{ fontSize: 13.5, color: 'var(--gray-600)', lineHeight: 1.7 }}>{club.noi_quy}</p></>}
                {club.dieu_kien_tuyen && <><h3 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px' }}>Điều kiện tuyển</h3><p style={{ fontSize: 13.5, color: 'var(--gray-600)', lineHeight: 1.7 }}>{club.dieu_kien_tuyen}</p></>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Họ tên</th><th>Vai trò</th><th>Ngày tham gia</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.tv_id}>
                    <td><strong>{m.ho_ten}</strong><br /><small style={{ color: 'var(--gray-400)' }}>{m.email}</small></td>
                    <td><span className={`badge ${m.vai_tro === 'chu_nhiem' ? 'badge-info' : m.vai_tro === 'pho_chu_nhiem' ? 'badge-warning' : 'badge-secondary'}`}>
                      {m.vai_tro === 'chu_nhiem' ? 'Chủ nhiệm' : m.vai_tro === 'pho_chu_nhiem' ? 'Phó chủ nhiệm' : 'Thành viên'}
                    </span></td>
                    <td>{m.ngay_tham_gia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && <div className="empty-state"><div className="icon">👥</div><p>Chưa có thành viên</p></div>}
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="grid grid-2">
          {events.map(e => (
            <div className="card" key={e.su_kien_id}>
              <div className="card-body">
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{e.ten_su_kien}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>{e.mo_ta}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'var(--gray-600)' }}>
                  <div>🕐 {new Date(e.thoi_gian_bat_dau).toLocaleString('vi-VN')}</div>
                  <div>👥 {e.so_dang_ky}/{e.gioi_han_nguoi || '∞'} đã đăng ký</div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {isMember && e.mo_dang_ky ? (
                    <button className="btn btn-sm btn-primary" onClick={() => registerEvent(e.su_kien_id)}>📝 Đăng ký</button>
                  ) : (
                    <button className="btn btn-sm btn-outline" onClick={() => followEvent(e.su_kien_id)}>👁 Theo dõi</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">📅</div><p>Chưa có sự kiện</p></div>}
        </div>
      )}
    </div>
  );
}
