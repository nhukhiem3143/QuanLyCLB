const db = require('../config/db');

const getMyNotifications = async (req, res) => {
  const userId = req.user.user_id;
  const [rows] = await db.query(
    `SELECT tb.*, tbn.da_doc, tbn.thoi_gian_doc, nd.ho_ten as ten_nguoi_gui,
    c.ten_clb
    FROM thong_bao tb
    JOIN thong_bao_nguoi_dung tbn ON tb.thong_bao_id = tbn.thong_bao_id
    LEFT JOIN nguoi_dung nd ON tb.nguoi_gui = nd.user_id
    LEFT JOIN clb c ON tb.clb_id = c.clb_id
    WHERE tbn.user_id = ? ORDER BY tb.thoi_gian DESC`,
    [userId]
  );
  res.json(rows);
};

const markRead = async (req, res) => {
  await db.query(
    'UPDATE thong_bao_nguoi_dung SET da_doc=1, thoi_gian_doc=NOW() WHERE thong_bao_id=? AND user_id=?',
    [req.params.id, req.user.user_id]
  );
  res.json({ message: 'Đã đánh dấu đọc' });
};

const markAllRead = async (req, res) => {
  await db.query(
    'UPDATE thong_bao_nguoi_dung SET da_doc=1, thoi_gian_doc=NOW() WHERE user_id=?',
    [req.user.user_id]
  );
  res.json({ message: 'Đã đọc tất cả' });
};

const send = async (req, res) => {
  const { clb_id, tieu_de, noi_dung, gui_nhom, gui_cho } = req.body;
  const nguoi_gui = req.user.user_id;

  const [result] = await db.query(
    'INSERT INTO thong_bao (gui_cho, clb_id, tieu_de, noi_dung, nguoi_gui, gui_nhom) VALUES (?,?,?,?,?,?)',
    [gui_cho || null, clb_id || null, tieu_de, noi_dung, nguoi_gui, gui_nhom || null]
  );
  const tbId = result.insertId;

  // Gửi cho tất cả thành viên CLB
  if (clb_id) {
    let sql = `SELECT tv.user_id FROM thanh_vien_clb tv WHERE tv.clb_id = ? AND tv.trang_thai = 'da_duyet'`;
    const params = [clb_id];
    const [members] = await db.query(sql, params);
    for (const m of members) {
      await db.query(
        'INSERT IGNORE INTO thong_bao_nguoi_dung (thong_bao_id, user_id) VALUES (?,?)',
        [tbId, m.user_id]
      );
    }
  } else if (gui_cho) {
    await db.query(
      'INSERT INTO thong_bao_nguoi_dung (thong_bao_id, user_id) VALUES (?,?)',
      [tbId, gui_cho]
    );
  }

  res.status(201).json({ message: 'Gửi thông báo thành công' });
};

const countUnread = async (req, res) => {
  const [[row]] = await db.query(
    'SELECT COUNT(*) as count FROM thong_bao_nguoi_dung WHERE user_id=? AND da_doc=0',
    [req.user.user_id]
  );
  res.json({ count: row.count });
};

module.exports = { getMyNotifications, markRead, markAllRead, send, countUnread };
