const db = require('../config/db');

const getAll = async (req, res) => {
  const { linh_vuc, trang_thai } = req.query;
  let sql = `SELECT c.*, nd.ho_ten as ten_chu_nhiem,
    (SELECT COUNT(*) FROM thanh_vien_clb WHERE clb_id = c.clb_id AND trang_thai = 'da_duyet') as so_thanh_vien
    FROM clb c LEFT JOIN nguoi_dung nd ON c.chu_nhiem_id = nd.user_id WHERE 1=1`;
  const params = [];

  if (linh_vuc) { sql += ' AND c.linh_vuc = ?'; params.push(linh_vuc); }
  if (trang_thai) { sql += ' AND c.trang_thai = ?'; params.push(trang_thai); }
  else if (req.user?.vai_tro !== 'admin') {
    sql += " AND c.trang_thai = 'dang_hoat_dong'";
  }

  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const getById = async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.*, nd.ho_ten as ten_chu_nhiem,
    (SELECT COUNT(*) FROM thanh_vien_clb WHERE clb_id = c.clb_id AND trang_thai = 'da_duyet') as so_thanh_vien
    FROM clb c LEFT JOIN nguoi_dung nd ON c.chu_nhiem_id = nd.user_id
    WHERE c.clb_id = ?`, [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy CLB' });
  res.json(rows[0]);
};

const create = async (req, res) => {
  const { ten_clb, mo_ta, linh_vuc, muc_tieu, noi_quy, dieu_kien_tuyen } = req.body;
  const [result] = await db.query(
    'INSERT INTO clb (ten_clb, mo_ta, linh_vuc, muc_tieu, noi_quy, dieu_kien_tuyen, chu_nhiem_id, ngay_thanh_lap, trang_thai) VALUES (?,?,?,?,?,?,?,CURDATE(),?)',
    [ten_clb, mo_ta, linh_vuc || 'Khac', muc_tieu, noi_quy, dieu_kien_tuyen, req.user.user_id, 'dang_hoat_dong']
  );
  res.status(201).json({ message: 'Tạo CLB thành công', clb_id: result.insertId });
};

const update = async (req, res) => {
  const { ten_clb, mo_ta, linh_vuc, muc_tieu, noi_quy, dieu_kien_tuyen, trang_thai, chu_nhiem_id } = req.body;
  const { id } = req.params;

  const [clb] = await db.query('SELECT * FROM clb WHERE clb_id = ?', [id]);
  if (!clb.length) return res.status(404).json({ message: 'Không tìm thấy CLB' });

  const isAdmin = req.user.vai_tro === 'admin';
  const isChuNhiem = clb[0].chu_nhiem_id === req.user.user_id;
  if (!isAdmin && !isChuNhiem) return res.status(403).json({ message: 'Không có quyền' });

  await db.query(
    `UPDATE clb SET ten_clb=?, mo_ta=?, linh_vuc=?, muc_tieu=?, noi_quy=?, dieu_kien_tuyen=?
    ${isAdmin ? ', trang_thai=?, chu_nhiem_id=?' : ''} WHERE clb_id=?`,
    isAdmin
      ? [ten_clb, mo_ta, linh_vuc, muc_tieu, noi_quy, dieu_kien_tuyen, trang_thai, chu_nhiem_id, id]
      : [ten_clb, mo_ta, linh_vuc, muc_tieu, noi_quy, dieu_kien_tuyen, id]
  );
  res.json({ message: 'Cập nhật thành công' });
};

const remove = async (req, res) => {
  await db.query('DELETE FROM clb WHERE clb_id = ?', [req.params.id]);
  res.json({ message: 'Xóa CLB thành công' });
};

const getThanhVien = async (req, res) => {
  const [rows] = await db.query(
    `SELECT tv.*, nd.ho_ten, nd.email, nd.so_dien_thoai, nd.ten_dang_nhap
    FROM thanh_vien_clb tv JOIN nguoi_dung nd ON tv.user_id = nd.user_id
    WHERE tv.clb_id = ? ORDER BY tv.trang_thai, tv.ngay_tham_gia`,
    [req.params.id]
  );
  res.json(rows);
};

const duyetThanhVien = async (req, res) => {
  const { tv_id, trang_thai } = req.body;
  await db.query('UPDATE thanh_vien_clb SET trang_thai = ? WHERE tv_id = ?', [trang_thai, tv_id]);

  if (trang_thai === 'da_duyet') {
    // Cập nhật vai trò user thành thanh_vien
    const [tv] = await db.query('SELECT user_id FROM thanh_vien_clb WHERE tv_id = ?', [tv_id]);
    if (tv.length) {
      const [u] = await db.query("SELECT vai_tro FROM nguoi_dung WHERE user_id = ?", [tv[0].user_id]);
      if (u[0]?.vai_tro === 'sinh_vien') {
        await db.query("UPDATE nguoi_dung SET vai_tro='thanh_vien' WHERE user_id=?", [tv[0].user_id]);
      }
    }
  }
  res.json({ message: 'Cập nhật thành công' });
};

const xoaThanhVien = async (req, res) => {
  await db.query("UPDATE thanh_vien_clb SET trang_thai='bi_xoa' WHERE tv_id=?", [req.params.tv_id]);
  res.json({ message: 'Đã xóa thành viên' });
};

module.exports = { getAll, getById, create, update, remove, getThanhVien, duyetThanhVien, xoaThanhVien };
