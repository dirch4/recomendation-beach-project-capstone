import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 left-0 w-full z-50 bg-[#F2F9FF] text-sky-800 px-6 py-4 shadow-md ">
      <div className="container mx-auto flex items-center justify-between ">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
            <h1 className="text-3xl font-bold text-sky-800"><span className='italic text-sky-500'>biru</span>Laut</h1>
        </Link>

        {/* Hamburger (mobile only) */}
        <div className="lg:hidden">
          <Link onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Link>
        </div>


        {/* Auth Buttons (desktop) */}
        <div className="hidden lg:flex space-x-4">
          <Link to="/signin" className="text-sky-200 bg-sky-800 px-4 py-1 rounded hover:bg-sky-200 hover:text-sky-800 transition">SignIn</Link>
          <Link to="/signup" className="border border-[#00859D] px-4 py-1 rounded hover:bg-white hover:text-blue-600 transition">SignUp</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 space-y-2 text-center sm:w-24">
          <Link 
            to="/signin"
            className="block w-full text-sky-200 bg-sky-800 hover:text-sky-800 hover:bg-sky-200 px-4 py-2 rounded-xl"
          >
            SignIn
          </Link>
          <Link 
            to="/signup"
            className="block w-full border border-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-blue-200 transition rounded-xl"
          >
            SignUp
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;