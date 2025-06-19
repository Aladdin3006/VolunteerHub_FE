const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="user-layout">
    <main>{children}</main>
  </div>
);

export default UserLayout;
