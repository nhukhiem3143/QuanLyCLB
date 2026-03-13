require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool = require('./db');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = (color, symbol, msg) => console.log(`${colors[color]}${symbol} ${msg}${colors.reset}`);

async function testConnection() {
  console.log('\n' + colors.bold + colors.cyan + '═══════════════════════════════════════' + colors.reset);
  console.log(colors.bold + colors.cyan + '   🔍 KIỂM TRA KẾT NỐI DATABASE' + colors.reset);
  console.log(colors.bold + colors.cyan + '═══════════════════════════════════════' + colors.reset + '\n');

  // 1. Thông tin cấu hình
  log('yellow', '📋', `Host     : ${process.env.DB_HOST || 'localhost'}`);
  log('yellow', '📋', `User     : ${process.env.DB_USER || 'root'}`);
  log('yellow', '📋', `Database : ${process.env.DB_NAME || 'quanly_clb'}`);
  console.log();

  let conn;
  try {
    // 2. Lấy kết nối
    log('cyan', '⏳', 'Đang kết nối...');
    conn = await pool.getConnection();
    log('green', '✅', 'Kết nối thành công!\n');

    // 3. Phiên bản MySQL
    const [[version]] = await conn.query('SELECT VERSION() as ver');
    log('green', '🗄 ', `Phiên bản MySQL : ${version.ver}`);

    // 4. Database hiện tại
    const [[db]] = await conn.query('SELECT DATABASE() as db');
    log('green', '📂', `Database đang dùng : ${db.db}`);
    console.log();

    // 5. Kiểm tra từng bảng
    const tables = [
      'nguoi_dung',
      'clb',
      'thanh_vien_clb',
      'su_kien',
      'dang_ky_su_kien',
      'diem_danh',
      'diem_thanh_vien',
      'tai_chinh',
      'thong_bao',
      'thong_bao_nguoi_dung',
      'yeu_cau_tham_gia',
      'yeu_cau_tao_clb',
      'theo_doi_su_kien',
    ];

    log('cyan', '📊', 'Kiểm tra các bảng:\n');
    let allOk = true;

    for (const table of tables) {
      try {
        const [[row]] = await conn.query(`SELECT COUNT(*) as total FROM \`${table}\``);
        log('green', '  ✔', `${table.padEnd(25)} — ${row.total} bản ghi`);
      } catch {
        log('red', '  ✘', `${table.padEnd(25)} — KHÔNG TỒN TẠI hoặc LỖI`);
        allOk = false;
      }
    }

    console.log();

    // 6. Kiểm tra query mẫu
    log('cyan', '🔎', 'Chạy query mẫu...');
    const [users] = await conn.query(
      'SELECT user_id, ten_dang_nhap, vai_tro, trang_thai FROM nguoi_dung LIMIT 5'
    );
    if (users.length > 0) {
      log('green', '✅', `Lấy được ${users.length} người dùng mẫu:`);
      users.forEach(u => {
        log('green', '  →', `[${u.vai_tro}] ${u.ten_dang_nhap} (${u.trang_thai})`);
      });
    } else {
      log('yellow', '⚠ ', 'Bảng nguoi_dung trống, hãy import data.sql');
    }

    console.log();
    if (allOk) {
      log('green', '🎉', colors.bold + 'TẤT CẢ KIỂM TRA THÀNH CÔNG!');
    } else {
      log('yellow', '⚠ ', 'Một số bảng bị thiếu — hãy import lại file data.sql');
    }

  } catch (err) {
    console.log();
    log('red', '❌', 'KẾT NỐI THẤT BẠI!\n');

    if (err.code === 'ECONNREFUSED') {
      log('red', '→', 'MySQL chưa chạy hoặc sai HOST/PORT');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      log('red', '→', 'Sai tên đăng nhập hoặc mật khẩu DB');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      log('red', '→', `Database "${process.env.DB_NAME}" không tồn tại — hãy import data.sql`);
    } else {
      log('red', '→', `${err.code || 'UNKNOWN'}: ${err.message}`);
    }

    log('yellow', '💡', 'Kiểm tra lại file .env và đảm bảo MySQL đang chạy');
  } finally {
    if (conn) conn.release();
    console.log('\n' + colors.cyan + '═══════════════════════════════════════' + colors.reset + '\n');
    process.exit(0);
  }
}

testConnection();
