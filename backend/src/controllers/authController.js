const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const login = async (req, res) => {
  const { ten_dang_nhap, mat_khau } = req.body;
  if (!ten_dang_nhap || !mat_khau)
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });

  const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = ?', [ten_dang_nhap]);
  if (!rows.length) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

  const user = rows[0];
  if (user.trang_thai === 'khoa')
    return res.status(403).json({ message: 'Tài khoản đã bị khóa' });

  const valid = await bcrypt.compare(mat_khau, user.mat_khau);
  if (!valid) return res.status(401).json({ message: 'Mật khẩu không đúng' });

  const token = jwt.sign(
    { user_id: user.user_id, vai_tro: user.vai_tro },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const { mat_khau: _, ...userInfo } = user;
  res.json({ token, user: userInfo });
};

const register = async (req, res) => {
  const { ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai } = req.body;
  if (!ten_dang_nhap || !mat_khau || !ho_ten || !email)
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });

  const [exist] = await db.query(
    'SELECT user_id FROM nguoi_dung WHERE ten_dang_nhap = ? OR email = ?',
    [ten_dang_nhap, email]
  );
  if (exist.length) return res.status(409).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });

  const hashed = await bcrypt.hash(mat_khau, 10);
  await db.query(
    'INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, email, so_dien_thoai, vai_tro) VALUES (?,?,?,?,?,?)',
    [ten_dang_nhap, hashed, ho_ten, email, so_dien_thoai || null, 'sinh_vien']
  );
  res.status(201).json({ message: 'Đăng ký thành công' });
};

const getProfile = async (req, res) => {
  const [rows] = await db.query(
    'SELECT user_id, ten_dang_nhap, ho_ten, email, so_dien_thoai, vai_tro, trang_thai FROM nguoi_dung WHERE user_id = ?',
    [req.user.user_id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json(rows[0]);
};

const updateProfile = async (req, res) => {
  const { ho_ten, email, so_dien_thoai, mat_khau_cu, mat_khau_moi } = req.body;
  const userId = req.user.user_id;

  const [rows] = await db.query('SELECT * FROM nguoi_dung WHERE user_id = ?', [userId]);
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

  if (mat_khau_moi) {
    const valid = await bcrypt.compare(mat_khau_cu, rows[0].mat_khau);
    if (!valid) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    const hashed = await bcrypt.hash(mat_khau_moi, 10);
    await db.query('UPDATE nguoi_dung SET ho_ten=?, email=?, so_dien_thoai=?, mat_khau=? WHERE user_id=?',
      [ho_ten, email, so_dien_thoai, hashed, userId]);
  } else {
    await db.query('UPDATE nguoi_dung SET ho_ten=?, email=?, so_dien_thoai=? WHERE user_id=?',
      [ho_ten, email, so_dien_thoai, userId]);
  }
  res.json({ message: 'Cập nhật thành công' });
};

module.exports = { login, register, getProfile, updateProfile };
