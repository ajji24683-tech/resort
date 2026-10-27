import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const CustomerLayout = () => {
  return (
    <div className="customer-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
