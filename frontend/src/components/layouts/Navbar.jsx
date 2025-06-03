import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import defaultAvatar from '../../assets/profile1.jpg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const profileImage = user?.profilePic || defaultAvatar;

  // Detect click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#dcefff] shadow-md">
      <nav role="navigation" className="text-sky-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <h1 className="text-3xl font-bold text-sky-800">
              <span className="italic text-sky-500">biru</span>Laut
            </h1>
          </Link>

          <div className="lg:hidden">
            <button onClick={toggleMenu} className="focus:outline-none" aria-label='Toggle Menu'>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-white transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-sky-200 bg-sky-800 px-4 py-1 rounded hover:bg-sky-200 hover:text-sky-800 transition">SignIn</Link>
                <Link to="/signup" className="border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-sky-200 transition">SignUp</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="lg:hidden mt-4 flex flex-col items-center gap-4 transition-all duration-300 ease-in-out"
          >
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="w-full text-center border border-sky-800 text-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center border border-sky-800 text-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="w-full text-center text-sky-200 bg-sky-800 hover:text-sky-800 hover:bg-sky-200 px-4 py-2 rounded-xl">SignIn</Link>
                <Link to="/signup" className="w-full text-center border border-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl">SignUp</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
