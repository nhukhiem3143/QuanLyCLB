const db = require('../config/db');

const getByClb = async (req, res) => {
  const { loai } = req.query;
  let sql = `SELECT tc.*, nd.ho_ten as ten_nguoi_tao FROM tai_chinh tc
    JOIN nguoi_dung nd ON tc.nguoi_tao = nd.user_id WHERE tc.clb_id = ?`;
  const params = [req.params.clb_id];
  if (loai) { sql += ' AND tc.loai = ?'; params.push(loai); }
  sql += ' ORDER BY tc.thoi_gian DESC';
  const [rows] = await db.query(sql, params);

  const [[tongThu]] = await db.query("SELECT COALESCE(SUM(so_tien),0) as total FROM tai_chinh WHERE clb_id=? AND loai='thu'", [req.params.clb_id]);
  const [[tongChi]] = await db.query("SELECT COALESCE(SUM(so_tien),0) as total FROM tai_chinh WHERE clb_id=? AND loai='chi'", [req.params.clb_id]);

  res.json({ records: rows, tongThu: tongThu.total, tongChi: tongChi.total, soDu: tongThu.total - tongChi.total });
};

const create = async (req, res) => {
  const { clb_id, so_tien, loai, mo_ta } = req.body;
  await db.query(
    'INSERT INTO tai_chinh (clb_id, so_tien, loai, mo_ta, nguoi_tao) VALUES (?,?,?,?,?)',
    [clb_id, so_tien, loai, mo_ta, req.user.user_id]
  );
  res.status(201).json({ message: 'Thêm giao dịch thành công' });
};

const remove = async (req, res) => {
  await db.query('DELETE FROM tai_chinh WHERE tai_chinh_id = ?', [req.params.id]);
  res.json({ message: 'Xóa thành công' });
};

module.exports = { getByClb, create, remove };
