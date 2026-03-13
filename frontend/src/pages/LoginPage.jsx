import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ten_dang_nhap: '', mat_khau: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.ten_dang_nhap, form.mat_khau);
      if (user.vai_tro === 'admin') navigate('/admin/dashboard');
      else if (user.vai_tro === 'chu_nhiem') navigate('/cn/dashboard');
      else navigate('/clubs');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ fontSize: 48 }}>🎓</div>
          <h1>CLB TNUT</h1>
          <p>Hệ thống quản lý câu lạc bộ</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên đăng nhập</label>
            <input className="form-control" placeholder="Nhập tên đăng nhập..." value={form.ten_dang_nhap}
              onChange={e => setForm({ ...form, ten_dang_nhap: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-control" placeholder="Nhập mật khẩu..." value={form.mat_khau}
              onChange={e => setForm({ ...form, mat_khau: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔐 Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
