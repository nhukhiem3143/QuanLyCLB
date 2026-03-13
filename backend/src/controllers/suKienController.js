const db = require('../config/db');

const getAll = async (req, res) => {
  const { clb_id, trang_thai, cong_khai } = req.query;
  let sql = `SELECT sk.*, c.ten_clb, nd.ho_ten as ten_nguoi_tao,
    (SELECT COUNT(*) FROM dang_ky_su_kien WHERE su_kien_id = sk.su_kien_id AND trang_thai='da_dang_ky') as so_dang_ky
    FROM su_kien sk JOIN clb c ON sk.clb_id = c.clb_id JOIN nguoi_dung nd ON sk.nguoi_tao = nd.user_id WHERE 1=1`;
  const params = [];

  if (clb_id) { sql += ' AND sk.clb_id = ?'; params.push(clb_id); }
  if (trang_thai) { sql += ' AND sk.trang_thai = ?'; params.push(trang_thai); }
  if (cong_khai === '1') { sql += ' AND sk.cong_khai = 1'; }
  sql += ' ORDER BY sk.thoi_gian_bat_dau DESC';

  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const getById = async (req, res) => {
  const [rows] = await db.query(
    `SELECT sk.*, c.ten_clb, nd.ho_ten as ten_nguoi_tao
    FROM su_kien sk JOIN clb c ON sk.clb_id = c.clb_id JOIN nguoi_dung nd ON sk.nguoi_tao = nd.user_id
    WHERE sk.su_kien_id = ?`, [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
  res.json(rows[0]);
};

const create = async (req, res) => {
  const { clb_id, ten_su_kien, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, hoc_ky, lich_chi_tiet, gioi_han_nguoi, cong_khai, mo_dang_ky } = req.body;
  const isAdmin = req.user.vai_tro === 'admin';

  const [result] = await db.query(
    `INSERT INTO su_kien (clb_id, ten_su_kien, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, nguoi_tao, trang_thai, hoc_ky, lich_chi_tiet, gioi_han_nguoi, cong_khai, mo_dang_ky)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [clb_id, ten_su_kien, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, req.user.user_id,
     isAdmin ? 'da_duyet' : 'cho_duyet', hoc_ky || 'HK1_2025_2026', lich_chi_tiet, gioi_han_nguoi || 0, cong_khai ? 1 : 0, mo_dang_ky ? 1 : 0]
  );
  res.status(201).json({ message: 'Tạo sự kiện thành công', su_kien_id: result.insertId });
};

const update = async (req, res) => {
  const { ten_su_kien, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai, hoc_ky, lich_chi_tiet, gioi_han_nguoi, cong_khai, mo_dang_ky } = req.body;
  await db.query(
    `UPDATE su_kien SET ten_su_kien=?, mo_ta=?, thoi_gian_bat_dau=?, thoi_gian_ket_thuc=?, trang_thai=?, hoc_ky=?, lich_chi_tiet=?, gioi_han_nguoi=?, cong_khai=?, mo_dang_ky=? WHERE su_kien_id=?`,
    [ten_su_kien, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, trang_thai, hoc_ky, lich_chi_tiet, gioi_han_nguoi, cong_khai ? 1 : 0, mo_dang_ky ? 1 : 0, req.params.id]
  );
  res.json({ message: 'Cập nhật thành công' });
};

const remove = async (req, res) => {
  await db.query('DELETE FROM su_kien WHERE su_kien_id = ?', [req.params.id]);
  res.json({ message: 'Xóa sự kiện thành công' });
};

const dangKy = async (req, res) => {
  const { su_kien_id } = req.body;
  const userId = req.user.user_id;

  const [tv] = await db.query(
    `SELECT tv.tv_id FROM thanh_vien_clb tv
    JOIN su_kien sk ON tv.clb_id = sk.clb_id
    WHERE sk.su_kien_id = ? AND tv.user_id = ? AND tv.trang_thai = 'da_duyet'`,
    [su_kien_id, userId]
  );
  if (!tv.length) return res.status(400).json({ message: 'Bạn không phải thành viên CLB này' });

  const [exist] = await db.query(
    "SELECT * FROM dang_ky_su_kien WHERE su_kien_id=? AND tv_id=? AND trang_thai='da_dang_ky'",
    [su_kien_id, tv[0].tv_id]
  );
  if (exist.length) return res.status(409).json({ message: 'Đã đăng ký sự kiện này' });

  await db.query(
    'INSERT INTO dang_ky_su_kien (su_kien_id, tv_id) VALUES (?,?)',
    [su_kien_id, tv[0].tv_id]
  );
  res.status(201).json({ message: 'Đăng ký thành công' });
};

const huyDangKy = async (req, res) => {
  const userId = req.user.user_id;
  const { su_kien_id } = req.params;

  const [tv] = await db.query(
    `SELECT tv.tv_id FROM thanh_vien_clb tv
    JOIN su_kien sk ON tv.clb_id = sk.clb_id
    WHERE sk.su_kien_id = ? AND tv.user_id = ?`,
    [su_kien_id, userId]
  );
  if (!tv.length) return res.status(400).json({ message: 'Không tìm thấy đăng ký' });

  await db.query(
    "UPDATE dang_ky_su_kien SET trang_thai='huy' WHERE su_kien_id=? AND tv_id=?",
    [su_kien_id, tv[0].tv_id]
  );
  res.json({ message: 'Hủy đăng ký thành công' });
};

const diemDanh = async (req, res) => {
  const { su_kien_id, tv_id, thoi_gian_vao, thoi_gian_ra, diem_tich_luy } = req.body;

  const [exist] = await db.query(
    'SELECT * FROM diem_danh WHERE su_kien_id=? AND tv_id=?', [su_kien_id, tv_id]
  );
  if (exist.length) {
    await db.query(
      'UPDATE diem_danh SET thoi_gian_ra=?, diem_tich_luy=? WHERE su_kien_id=? AND tv_id=?',
      [thoi_gian_ra, diem_tich_luy, su_kien_id, tv_id]
    );
  } else {
    await db.query(
      'INSERT INTO diem_danh (su_kien_id, tv_id, thoi_gian_vao, thoi_gian_ra, diem_tich_luy) VALUES (?,?,?,?,?)',
      [su_kien_id, tv_id, thoi_gian_vao || new Date(), thoi_gian_ra, diem_tich_luy || 0]
    );
    await db.query(
      'UPDATE dang_ky_su_kien SET da_diem_danh=1 WHERE su_kien_id=? AND tv_id=?',
      [su_kien_id, tv_id]
    );
  }

  // Cập nhật tổng điểm
  await db.query(
    `UPDATE diem_thanh_vien dtv SET tong_diem = (
      SELECT COALESCE(SUM(dd.diem_tich_luy),0) FROM diem_danh dd WHERE dd.tv_id = dtv.tv_id
    ), xep_loai = CASE
      WHEN tong_diem >= 80 THEN 'A' WHEN tong_diem >= 60 THEN 'B'
      WHEN tong_diem >= 40 THEN 'C' ELSE 'D' END
    WHERE dtv.tv_id = ?`, [tv_id]
  );

  res.json({ message: 'Điểm danh thành công' });
};

const getDangKySuKien = async (req, res) => {
  const [rows] = await db.query(
    `SELECT dk.*, tv.user_id, nd.ho_ten, nd.email,
    dd.diem_tich_luy, dd.thoi_gian_vao
    FROM dang_ky_su_kien dk
    JOIN thanh_vien_clb tv ON dk.tv_id = tv.tv_id
    JOIN nguoi_dung nd ON tv.user_id = nd.user_id
    LEFT JOIN diem_danh dd ON dd.su_kien_id = dk.su_kien_id AND dd.tv_id = dk.tv_id
    WHERE dk.su_kien_id = ? AND dk.trang_thai = 'da_dang_ky'`,
    [req.params.id]
  );
  res.json(rows);
};

const theoDoi = async (req, res) => {
  const { su_kien_id } = req.body;
  const userId = req.user.user_id;
  try {
    await db.query('INSERT INTO theo_doi_su_kien (su_kien_id, sinh_vien_id) VALUES (?,?)', [su_kien_id, userId]);
    res.json({ message: 'Đã theo dõi sự kiện' });
  } catch {
    res.status(409).json({ message: 'Đã theo dõi sự kiện này rồi' });
  }
};

module.exports = { getAll, getById, create, update, remove, dangKy, huyDangKy, diemDanh, getDangKySuKien, theoDoi };
