
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full z-10 top-0 left-0">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer text-blue-600">OpenScholar Hub</h1>
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;