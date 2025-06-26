import Header from '../components/Header/Header';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="user-layout">
    <Header />
    <main>{children}</main>
  </div>
);

export default UserLayout;
