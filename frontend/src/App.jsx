import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/common/Layout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminClubs from './pages/admin/Clubs';
import AdminClubRequests from './pages/admin/ClubRequests';
import AdminEvents from './pages/admin/Events';
import AdminStats from './pages/admin/Stats';

// User pages
import ClubList from './pages/user/ClubList';
import ClubDetail from './pages/user/ClubDetail';
import EventList from './pages/user/EventList';
import MyEvents from './pages/user/MyEvents';
import MyScore from './pages/user/MyScore';
import MyRequests from './pages/user/MyRequests';
import Profile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';

// Chu nhiem pages
import CnDashboard from './pages/chunhiem/Dashboard';
import CnMembers from './pages/chunhiem/Members';
import CnEvents from './pages/chunhiem/Events';
import CnFinance from './pages/chunhiem/Finance';
import CnNotifications from './pages/chunhiem/Notifications';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.vai_tro)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  const defaultRoute = () => {
    if (!user) return '/login';
    if (user.vai_tro === 'admin') return '/admin/dashboard';
    if (user.vai_tro === 'chu_nhiem') return '/cn/dashboard';
    return '/clubs';
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={defaultRoute()} />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={defaultRoute()} />} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="clubs" element={<AdminClubs />} />
        <Route path="club-requests" element={<AdminClubRequests />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="stats" element={<AdminStats />} />
      </Route>

      {/* Chu nhiem */}
      <Route path="/cn" element={<PrivateRoute roles={['chu_nhiem']}><Layout /></PrivateRoute>}>
        <Route path="dashboard" element={<CnDashboard />} />
        <Route path="members" element={<CnMembers />} />
        <Route path="events" element={<CnEvents />} />
        <Route path="finance" element={<CnFinance />} />
        <Route path="notifications" element={<CnNotifications />} />
      </Route>

      {/* User (thanh_vien + sinh_vien) */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to={defaultRoute()} replace />} />
        <Route path="clubs" element={<ClubList />} />
        <Route path="clubs/:id" element={<ClubDetail />} />
        <Route path="events" element={<EventList />} />
        <Route path="my-events" element={<MyEvents />} />
        <Route path="my-score" element={<MyScore />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={defaultRoute()} />} />
    </Routes>
  );
}
