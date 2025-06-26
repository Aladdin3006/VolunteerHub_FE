import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home/Home';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
// import AdminDashboard from '../pages/admin/Dashboard';
// import ManageUsers from '../pages/admin/ManageUsers';
// import UserProfile from '../pages/user/Profile';
// import MyEvents from '../pages/user/MyEvents';
// import ProtectedRoute from './ProtectedRoute';
// import AdminLayout from '../layouts/AdminLayout';
// import UserLayout from '../layouts/UserLayout';
// import DefaultLayout from '../layouts/DefaultLayout';

const AppRoutes = () => (
  <Routes>
    Public Routes
    {/* <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
    <Route path="/login" element={<DefaultLayout><Login /></DefaultLayout>} />
    <Route path="/register" element={<DefaultLayout><Register /></DefaultLayout>} />
    <Route path="/about-us" element={<DefaultLayout><AboutUs /></DefaultLayout>} />

    {/* User Routes */}
    {/* <Route element={<ProtectedRoute role="user" />}>
      <Route path="/user/profile" element={<UserLayout><UserProfile /></UserLayout>} />
      <Route path="/user/events" element={<UserLayout><MyEvents /></UserLayout>} />
    </Route> */}

    {/* Admin Routes */}
    {/* <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><ManageUsers /></AdminLayout>} />
    </Route> */}
  </Routes>
);

export default AppRoutes;
