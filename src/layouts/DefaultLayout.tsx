import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);

export default DefaultLayout;
