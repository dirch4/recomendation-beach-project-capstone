import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-[#F2F9FF] text-sky-800 px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <h1 className="text-3xl font-bold text-sky-800">
            <span className="italic text-sky-500">biru</span>Laut
          </h1>
        </Link>

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-4">
          {isAuthenticated ? (
            <Link to="/profile" className="flex text-sm bg-gray-200 rounded-full focus:ring-4 focus:ring-gray-300">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="/images/default-avatar.jpg"
                alt="User avatar"
              />
            </Link>
          ) : (
            <>
              <Link to="/signin" className="text-sky-200 bg-sky-800 px-4 py-1 rounded hover:bg-sky-200 hover:text-sky-800 transition">SignIn</Link>
              <Link to="/signup" className="border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-sky-200 transition">SignUp</Link>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden mt-4 flex flex-col items-center gap-4 transition-all duration-300 ease-in-out">
          {isAuthenticated ? (
            <Link to="/profile" className="w-full text-center border border-sky-800 text-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-sky-200 rounded-xl">
              Profile
            </Link>
          ) : (
            <>
              <Link to="/signin" className="w-full text-center text-sky-200 bg-sky-800 hover:text-sky-800 hover:bg-sky-200 px-4 py-2 rounded-xl">SignIn</Link>
              <Link to="/signup" className="w-full text-center border border-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-blue-200 rounded-xl">SignUp</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
