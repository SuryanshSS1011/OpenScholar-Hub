import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10 top-0 left-0">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer text-blue-600">OpenScholar Hub</h1>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Links for Desktop */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link href="/">
              <span className="text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer">Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard">
              <span className="text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <span className="text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer">Profile</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Dropdown Menu for Mobile */}
      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-md rounded-lg mx-4 mt-2"
        >
          <li className="border-b border-gray-200">
            <Link href="/">
              <span className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer py-2 px-4">Home</span>
            </Link>
          </li>
          <li className="border-b border-gray-200">
            <Link href="/dashboard">
              <span className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer py-2 px-4">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/profile">
              <span className="block text-gray-600 hover:text-blue-600 transition-colors duration-300 cursor-pointer py-2 px-4">Profile</span>
            </Link>
          </li>
        </motion.ul>
      )}
    </nav>
  );
};

export default Navbar;