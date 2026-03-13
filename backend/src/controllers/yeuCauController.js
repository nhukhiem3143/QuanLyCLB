const db = require('../config/db');

const guiYeuCau = async (req, res) => {
  const { clb_id } = req.body;
  const userId = req.user.user_id;

  const [exist] = await db.query(
    "SELECT * FROM yeu_cau_tham_gia WHERE user_id=? AND clb_id=? AND trang_thai='cho_duyet'",
    [userId, clb_id]
  );
  if (exist.length) return res.status(409).json({ message: 'Đã gửi yêu cầu, đang chờ duyệt' });

  const [member] = await db.query(
    "SELECT * FROM thanh_vien_clb WHERE user_id=? AND clb_id=? AND trang_thai='da_duyet'",
    [userId, clb_id]
  );
  if (member.length) return res.status(409).json({ message: 'Bạn đã là thành viên CLB này' });

  await db.query('INSERT INTO yeu_cau_tham_gia (user_id, clb_id) VALUES (?,?)', [userId, clb_id]);
  res.status(201).json({ message: 'Gửi yêu cầu thành công' });
};

const getYeuCauCLB = async (req, res) => {
  const [rows] = await db.query(
    `SELECT y.*, nd.ho_ten, nd.email, nd.so_dien_thoai FROM yeu_cau_tham_gia y
    JOIN nguoi_dung nd ON y.user_id = nd.user_id WHERE y.clb_id = ? ORDER BY y.thoi_gian DESC`,
    [req.params.clb_id]
  );
  res.json(rows);
};

const duyetYeuCau = async (req, res) => {
  const { trang_thai } = req.body;
  const { id } = req.params;

  const [yc] = await db.query('SELECT * FROM yeu_cau_tham_gia WHERE yc_id = ?', [id]);
  if (!yc.length) return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });

  await db.query('UPDATE yeu_cau_tham_gia SET trang_thai = ? WHERE yc_id = ?', [trang_thai, id]);

  if (trang_thai === 'da_duyet') {
    await db.query(
      "INSERT INTO thanh_vien_clb (user_id, clb_id, ngay_tham_gia, trang_thai) VALUES (?,?,CURDATE(),'da_duyet')",
      [yc[0].user_id, yc[0].clb_id]
    );
    // Khởi tạo điểm
    const [tv] = await db.query('SELECT tv_id FROM thanh_vien_clb WHERE user_id=? AND clb_id=?', [yc[0].user_id, yc[0].clb_id]);
    if (tv.length) {
      await db.query('INSERT IGNORE INTO diem_thanh_vien (tv_id, tong_diem) VALUES (?,0)', [tv[0].tv_id]);
    }
    await db.query("UPDATE nguoi_dung SET vai_tro='thanh_vien' WHERE user_id=? AND vai_tro='sinh_vien'", [yc[0].user_id]);
  }
  res.json({ message: 'Cập nhật yêu cầu thành công' });
};

const getMyYeuCau = async (req, res) => {
  const [rows] = await db.query(
    `SELECT y.*, c.ten_clb FROM yeu_cau_tham_gia y JOIN clb c ON y.clb_id = c.clb_id
    WHERE y.user_id = ? ORDER BY y.thoi_gian DESC`,
    [req.user.user_id]
  );
  res.json(rows);
};

const guiYeuCauTaoCLB = async (req, res) => {
  const { ten_clb, mo_ta } = req.body;
  await db.query(
    'INSERT INTO yeu_cau_tao_clb (user_id, ten_clb, mo_ta) VALUES (?,?,?)',
    [req.user.user_id, ten_clb, mo_ta]
  );
  res.status(201).json({ message: 'Gửi yêu cầu tạo CLB thành công' });
};

const getDiem = async (req, res) => {
  const userId = req.user.user_id;
  const [rows] = await db.query(
    `SELECT dtv.*, c.ten_clb, tv.vai_tro FROM diem_thanh_vien dtv
    JOIN thanh_vien_clb tv ON dtv.tv_id = tv.tv_id
    JOIN clb c ON tv.clb_id = c.clb_id
    WHERE tv.user_id = ?`, [userId]
  );
  res.json(rows);
};

const getLichSuDangKy = async (req, res) => {
  const userId = req.user.user_id;
  const [rows] = await db.query(
    `SELECT dk.*, sk.ten_su_kien, sk.thoi_gian_bat_dau, sk.thoi_gian_ket_thuc,
    c.ten_clb, dd.diem_tich_luy, dd.thoi_gian_vao
    FROM dang_ky_su_kien dk
    JOIN thanh_vien_clb tv ON dk.tv_id = tv.tv_id
    JOIN su_kien sk ON dk.su_kien_id = sk.su_kien_id
    JOIN clb c ON sk.clb_id = c.clb_id
    LEFT JOIN diem_danh dd ON dd.su_kien_id = dk.su_kien_id AND dd.tv_id = dk.tv_id
    WHERE tv.user_id = ? ORDER BY sk.thoi_gian_bat_dau DESC`, [userId]
  );
  res.json(rows);
};

module.exports = { guiYeuCau, getYeuCauCLB, duyetYeuCau, getMyYeuCau, guiYeuCauTaoCLB, getDiem, getLichSuDangKy };
