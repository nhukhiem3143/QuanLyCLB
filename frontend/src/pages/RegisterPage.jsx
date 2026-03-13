import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ten_dang_nhap: '', mat_khau: '', ho_ten: '', email: '', so_dien_thoai: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Đăng ký thành công! Chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <div style={{ fontSize: 40 }}>🎓</div>
          <h1>Đăng ký tài khoản</h1>
          <p>Tham gia hệ thống CLB TNUT</p>
        </div>
        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Họ tên *</label>
              <input className="form-control" value={form.ho_ten} onChange={set('ho_ten')} required placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tên đăng nhập *</label>
              <input className="form-control" value={form.ten_dang_nhap} onChange={set('ten_dang_nhap')} required placeholder="username" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} required placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-control" value={form.so_dien_thoai} onChange={set('so_dien_thoai')} placeholder="0912345678" />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <input type="password" className="form-control" value={form.mat_khau} onChange={set('mat_khau')} required placeholder="Tối thiểu 6 ký tự" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 10 }} disabled={loading}>
            {loading ? <span className="spinner" /> : '📝 Đăng ký'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
