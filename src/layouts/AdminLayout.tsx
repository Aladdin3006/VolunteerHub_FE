import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="admin-layout">
    <AdminSidebar />
    <main>{children}</main>
  </div>
);

export default AdminLayout;
