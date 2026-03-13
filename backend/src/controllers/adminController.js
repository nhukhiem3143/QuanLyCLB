const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Quản lý tài khoản
const getAllUsers = async (req, res) => {
  const { vai_tro, trang_thai } = req.query;
  let sql = 'SELECT user_id, ten_dang_nhap, ho_ten, email, so_dien_thoai, vai_tro, trang_thai FROM nguoi_dung WHERE 1=1';
  const params = [];
  if (vai_tro) { sql += ' AND vai_tro = ?'; params.push(vai_tro); }
  if (trang_thai) { sql += ' AND trang_thai = ?'; params.push(trang_thai); }
  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const toggleUserStatus = async (req, res) => {
  const [rows] = await db.query('SELECT trang_thai FROM nguoi_dung WHERE user_id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  const newStatus = rows[0].trang_thai === 'hoat_dong' ? 'khoa' : 'hoat_dong';
  await db.query('UPDATE nguoi_dung SET trang_thai = ? WHERE user_id = ?', [newStatus, req.params.id]);
  res.json({ message: `Tài khoản đã ${newStatus === 'hoat_dong' ? 'mở khóa' : 'bị khóa'}`, trang_thai: newStatus });
};

const updateUserRole = async (req, res) => {
  const { vai_tro } = req.body;
  await db.query('UPDATE nguoi_dung SET vai_tro = ? WHERE user_id = ?', [vai_tro, req.params.id]);
  res.json({ message: 'Cập nhật vai trò thành công' });
};

const createUser = async (req, res) => {
  const { ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, vai_tro } = req.body;
  const hashed = await bcrypt.hash(mat_khau || '123456', 10);
  await db.query(
    'INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, vai_tro) VALUES (?,?,?,?,?,?)',
    [ten_dang_nhap, hashed, ho_ten, email, so_dien_thoai, vai_tro || 'sinh_vien']
  );
  res.status(201).json({ message: 'Tạo tài khoản thành công' });
};

// Yêu cầu tạo CLB
const getYeuCauTaoCLB = async (req, res) => {
  const [rows] = await db.query(
    `SELECT y.*, nd.ho_ten, nd.email FROM yeu_cau_tao_clb y
    JOIN nguoi_dung nd ON y.user_id = nd.user_id ORDER BY y.thoi_gian DESC`
  );
  res.json(rows);
};

const duyetYeuCauTaoCLB = async (req, res) => {
  const { trang_thai, ly_do } = req.body;
  const { id } = req.params;

  await db.query('UPDATE yeu_cau_tao_clb SET trang_thai = ? WHERE yeu_cau_id = ?', [trang_thai, id]);

  if (trang_thai === 'da_duyet') {
    const [yc] = await db.query('SELECT * FROM yeu_cau_tao_clb WHERE yeu_cau_id = ?', [id]);
    if (yc.length) {
      await db.query(
        "INSERT INTO clb (ten_clb, mo_ta, chu_nhiem_id, ngay_thanh_lap, trang_thai) VALUES (?,?,?,CURDATE(),'dang_hoat_dong')",
        [yc[0].ten_clb, yc[0].mo_ta, yc[0].user_id]
      );
      await db.query("UPDATE nguoi_dung SET vai_tro='chu_nhiem' WHERE user_id=?", [yc[0].user_id]);
    }
  }
  res.json({ message: 'Cập nhật yêu cầu thành công' });
};

// Duyệt sự kiện
const getSuKienChoDuyet = async (req, res) => {
  const [rows] = await db.query(
    `SELECT sk.*, c.ten_clb, nd.ho_ten as ten_nguoi_tao FROM su_kien sk
    JOIN clb c ON sk.clb_id = c.clb_id JOIN nguoi_dung nd ON sk.nguoi_tao = nd.user_id
    WHERE sk.trang_thai = 'cho_duyet' ORDER BY sk.thoi_gian_bat_dau`
  );
  res.json(rows);
};

const duyetSuKien = async (req, res) => {
  const { trang_thai } = req.body;
  await db.query('UPDATE su_kien SET trang_thai = ? WHERE su_kien_id = ?', [trang_thai, req.params.id]);
  res.json({ message: 'Cập nhật trạng thái sự kiện thành công' });
};

// Thống kê
const getThongKe = async (req, res) => {
  const [[totalCLB]] = await db.query("SELECT COUNT(*) as total FROM clb WHERE trang_thai='dang_hoat_dong'");
  const [[totalUsers]] = await db.query("SELECT COUNT(*) as total FROM nguoi_dung WHERE trang_thai='hoat_dong'");
  const [[totalEvents]] = await db.query("SELECT COUNT(*) as total FROM su_kien");
  const [[totalMembers]] = await db.query("SELECT COUNT(*) as total FROM thanh_vien_clb WHERE trang_thai='da_duyet'");

  const [clbByLinhVuc] = await db.query(
    "SELECT linh_vuc, COUNT(*) as count FROM clb GROUP BY linh_vuc"
  );
  const [memberByCLB] = await db.query(
    `SELECT c.ten_clb, COUNT(tv.tv_id) as so_thanh_vien FROM clb c
    LEFT JOIN thanh_vien_clb tv ON c.clb_id = tv.clb_id AND tv.trang_thai='da_duyet'
    WHERE c.trang_thai='dang_hoat_dong' GROUP BY c.clb_id ORDER BY so_thanh_vien DESC LIMIT 10`
  );
  const [eventByHocKy] = await db.query(
    "SELECT hoc_ky, COUNT(*) as count FROM su_kien GROUP BY hoc_ky"
  );

  res.json({ totalCLB: totalCLB.total, totalUsers: totalUsers.total, totalEvents: totalEvents.total, totalMembers: totalMembers.total, clbByLinhVuc, memberByCLB, eventByHocKy });
};

module.exports = { getAllUsers, toggleUserStatus, updateUserRole, createUser, getYeuCauTaoCLB, duyetYeuCauTaoCLB, getSuKienChoDuyet, duyetSuKien, getThongKe };
