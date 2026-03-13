import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ ho_ten: '', email: '', so_dien_thoai: '' });
  const [pwForm, setPwForm] = useState({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (user) setForm({ ho_ten: user.ho_ten || '', email: user.email || '', so_dien_thoai: user.so_dien_thoai || '' });
  }, [user]);

  const saveInfo = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', form);
      await refreshProfile();
      setMsg('Cập nhật thông tin thành công'); setMsgType('success');
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); setMsgType('danger'); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.mat_khau_moi !== pwForm.xac_nhan) { setMsg('Mật khẩu xác nhận không khớp'); setMsgType('danger'); return; }
    try {
      await api.put('/auth/profile', { ...form, mat_khau_cu: pwForm.mat_khau_cu, mat_khau_moi: pwForm.mat_khau_moi });
      setMsg('Đổi mật khẩu thành công'); setMsgType('success');
      setPwForm({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); setMsgType('danger'); }
  };

  const roleLabel = { admin: 'Quản trị viên', chu_nhiem: 'Chủ nhiệm CLB', thanh_vien: 'Thành viên', sinh_vien: 'Sinh viên' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Hồ sơ cá nhân</div><div className="page-subtitle">Quản lý thông tin tài khoản</div></div>
      </div>

      {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

      <div className="grid grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 700, margin: '0 auto 16px' }}>
              {user?.ho_ten?.[0] || 'U'}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user?.ho_ten}</div>
            <div style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 12 }}>@{user?.ten_dang_nhap}</div>
            <span className="badge badge-info" style={{ fontSize: 13, padding: '5px 14px' }}>{roleLabel[user?.vai_tro]}</span>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5, color: 'var(--gray-600)', textAlign: 'left' }}>
              <div>📧 {user?.email}</div>
              <div>📱 {user?.so_dien_thoai || 'Chưa cập nhật'}</div>
              <div>🔑 {user?.ten_dang_nhap}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="tabs">
            <div className={`tab${tab === 'info' ? ' active' : ''}`} onClick={() => setTab('info')}>📄 Thông tin</div>
            <div className={`tab${tab === 'password' ? ' active' : ''}`} onClick={() => setTab('password')}>🔒 Mật khẩu</div>
          </div>

          {tab === 'info' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Cập nhật thông tin</div></div>
              <div className="card-body">
                <form onSubmit={saveInfo}>
                  <div className="form-group">
                    <label className="form-label">Họ tên</label>
                    <input className="form-control" value={form.ho_ten} onChange={e => setForm({...form, ho_ten: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-control" value={form.so_dien_thoai} onChange={e => setForm({...form, so_dien_thoai: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary">💾 Lưu thay đổi</button>
                </form>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="card">
              <div className="card-header"><div className="card-title">Đổi mật khẩu</div></div>
              <div className="card-body">
                <form onSubmit={savePassword}>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu cũ</label>
                    <input type="password" className="form-control" value={pwForm.mat_khau_cu} onChange={e => setPwForm({...pwForm, mat_khau_cu: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input type="password" className="form-control" value={pwForm.mat_khau_moi} onChange={e => setPwForm({...pwForm, mat_khau_moi: e.target.value})} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <input type="password" className="form-control" value={pwForm.xac_nhan} onChange={e => setPwForm({...pwForm, xac_nhan: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary">🔒 Đổi mật khẩu</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
