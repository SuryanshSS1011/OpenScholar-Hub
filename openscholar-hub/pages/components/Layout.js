import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>© 2025 OpenScholar Hub. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Layout;