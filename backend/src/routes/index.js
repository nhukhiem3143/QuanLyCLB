const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const clbCtrl = require('../controllers/clbController');
const skCtrl = require('../controllers/suKienController');
const adminCtrl = require('../controllers/adminController');
const tcCtrl = require('../controllers/taiChinhController');
const tbCtrl = require('../controllers/thongBaoController');
const ycCtrl = require('../controllers/yeuCauController');

// Auth
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.get('/auth/profile', auth, authCtrl.getProfile);
router.put('/auth/profile', auth, authCtrl.updateProfile);

// CLB
router.get('/clubs', auth, clbCtrl.getAll);
router.get('/clubs/:id', auth, clbCtrl.getById);
router.post('/clubs', auth, requireRole('admin'), clbCtrl.create);
router.put('/clubs/:id', auth, requireRole('admin', 'chu_nhiem'), clbCtrl.update);
router.delete('/clubs/:id', auth, requireRole('admin'), clbCtrl.remove);
router.get('/clubs/:id/members', auth, clbCtrl.getThanhVien);
router.put('/clubs/members/approve', auth, requireRole('admin', 'chu_nhiem'), clbCtrl.duyetThanhVien);
router.delete('/clubs/members/:tv_id', auth, requireRole('admin', 'chu_nhiem'), clbCtrl.xoaThanhVien);

// Sự kiện
router.get('/events', auth, skCtrl.getAll);
router.get('/events/:id', auth, skCtrl.getById);
router.post('/events', auth, requireRole('admin', 'chu_nhiem'), skCtrl.create);
router.put('/events/:id', auth, requireRole('admin', 'chu_nhiem'), skCtrl.update);
router.delete('/events/:id', auth, requireRole('admin', 'chu_nhiem'), skCtrl.remove);
router.post('/events/register', auth, skCtrl.dangKy);
router.delete('/events/:su_kien_id/unregister', auth, skCtrl.huyDangKy);
router.get('/events/:id/participants', auth, skCtrl.getDangKySuKien);
router.post('/events/attendance', auth, requireRole('admin', 'chu_nhiem'), skCtrl.diemDanh);
router.post('/events/follow', auth, skCtrl.theoDoi);

// Tài chính
router.get('/finance/:clb_id', auth, tcCtrl.getByClb);
router.post('/finance', auth, requireRole('admin', 'chu_nhiem'), tcCtrl.create);
router.delete('/finance/:id', auth, requireRole('admin', 'chu_nhiem'), tcCtrl.remove);

// Thông báo
router.get('/notifications', auth, tbCtrl.getMyNotifications);
router.get('/notifications/unread-count', auth, tbCtrl.countUnread);
router.put('/notifications/:id/read', auth, tbCtrl.markRead);
router.put('/notifications/read-all', auth, tbCtrl.markAllRead);
router.post('/notifications', auth, requireRole('admin', 'chu_nhiem'), tbCtrl.send);

// Yêu cầu
router.post('/join-requests', auth, ycCtrl.guiYeuCau);
router.get('/join-requests/my', auth, ycCtrl.getMyYeuCau);
router.get('/join-requests/club/:clb_id', auth, requireRole('admin', 'chu_nhiem'), ycCtrl.getYeuCauCLB);
router.put('/join-requests/:id', auth, requireRole('admin', 'chu_nhiem'), ycCtrl.duyetYeuCau);
router.post('/create-club-requests', auth, ycCtrl.guiYeuCauTaoCLB);
router.get('/my-score', auth, ycCtrl.getDiem);
router.get('/my-events', auth, ycCtrl.getLichSuDangKy);

// Admin
router.get('/admin/users', auth, requireRole('admin'), adminCtrl.getAllUsers);
router.post('/admin/users', auth, requireRole('admin'), adminCtrl.createUser);
router.put('/admin/users/:id/status', auth, requireRole('admin'), adminCtrl.toggleUserStatus);
router.put('/admin/users/:id/role', auth, requireRole('admin'), adminCtrl.updateUserRole);
router.get('/admin/club-requests', auth, requireRole('admin'), adminCtrl.getYeuCauTaoCLB);
router.put('/admin/club-requests/:id', auth, requireRole('admin'), adminCtrl.duyetYeuCauTaoCLB);
router.get('/admin/pending-events', auth, requireRole('admin'), adminCtrl.getSuKienChoDuyet);
router.put('/admin/events/:id/approve', auth, requireRole('admin'), adminCtrl.duyetSuKien);
router.get('/admin/stats', auth, requireRole('admin'), adminCtrl.getThongKe);

module.exports = router;
