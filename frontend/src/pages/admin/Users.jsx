import { useState, useEffect } from 'react';
import api from '../../utils/api';

const roleLabel = { admin: 'Admin', chu_nhiem: 'Chủ nhiệm', thanh_vien: 'Thành viên', sinh_vien: 'Sinh viên' };
const roleColors = { admin: 'badge-danger', chu_nhiem: 'badge-info', thanh_vien: 'badge-success', sinh_vien: 'badge-secondary' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ten_dang_nhap: '', mat_khau: '123456', ho_ten: '', email: '', so_dien_thoai: '', vai_tro: 'sinh_vien' });
  const [msg, setMsg] = useState('');

  const fetch = async () => {
    const params = {};
    if (filterRole) params.vai_tro = filterRole;
    const res = await api.get('/admin/users', { params });
    setUsers(res.data);
  };

  useEffect(() => { fetch(); }, [filterRole]);

  const toggleStatus = async (id) => {
    await api.put(`/admin/users/${id}/status`);
    fetch();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      setMsg('Tạo tài khoản thành công');
      setShowModal(false);
      fetch();
      setForm({ ten_dang_nhap: '', mat_khau: '123456', ho_ten: '', email: '', so_dien_thoai: '', vai_tro: 'sinh_vien' });
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); }
  };

  const filtered = users.filter(u =>
    u.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
    u.ten_dang_nhap?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý tài khoản</div>
          <div className="page-subtitle">Quản lý tất cả người dùng trong hệ thống</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Thêm tài khoản</button>
      </div>

      {msg && <div className="alert alert-success">✅ {msg}</div>}

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ margin: 0, width: '100%' }}>
            <input className="form-control search-input" placeholder="🔍 Tìm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-control form-select" style={{ width: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="chu_nhiem">Chủ nhiệm</option>
              <option value="thanh_vien">Thành viên</option>
              <option value="sinh_vien">Sinh viên</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td><strong>{u.ho_ten}</strong></td>
                  <td><code style={{ fontSize: 12 }}>{u.ten_dang_nhap}</code></td>
                  <td>{u.email}</td>
                  <td>{u.so_dien_thoai || '-'}</td>
                  <td><span className={`badge ${roleColors[u.vai_tro]}`}>{roleLabel[u.vai_tro]}</span></td>
                  <td><span className={`badge ${u.trang_thai === 'hoat_dong' ? 'badge-success' : 'badge-danger'}`}>
                    {u.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Bị khóa'}
                  </span></td>
                  <td>
                    <button className={`btn btn-sm ${u.trang_thai === 'hoat_dong' ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => toggleStatus(u.user_id)}>
                      {u.trang_thai === 'hoat_dong' ? '🔒 Khóa' : '🔓 Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><div className="icon">👥</div><p>Không có tài khoản nào</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Thêm tài khoản</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group"><label className="form-label">Họ tên *</label>
                    <input className="form-control" value={form.ho_ten} onChange={e => setForm({...form, ho_ten: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Tên đăng nhập *</label>
                    <input className="form-control" value={form.ten_dang_nhap} onChange={e => setForm({...form, ten_dang_nhap: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="form-group"><label className="form-label">Mật khẩu</label>
                    <input className="form-control" value={form.mat_khau} onChange={e => setForm({...form, mat_khau: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Vai trò</label>
                    <select className="form-control form-select" value={form.vai_tro} onChange={e => setForm({...form, vai_tro: e.target.value})}>
                      <option value="sinh_vien">Sinh viên</option>
                      <option value="thanh_vien">Thành viên</option>
                      <option value="chu_nhiem">Chủ nhiệm</option>
                      <option value="admin">Admin</option>
                    </select></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
