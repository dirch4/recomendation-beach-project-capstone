import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import defaultAvatar from '../../assets/profile1.jpg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // State untuk mengontrol visibilitas modal konfirmasi logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // Fungsi untuk membuka/menutup menu mobile
  const toggleMenu = () => setIsOpen(!isOpen);

  // Fungsi yang dipanggil saat tombol "Sign Out" di-klik
  // Ini akan menampilkan modal konfirmasi terlebih dahulu
  const handleSignOutClick = () => {
    setShowLogoutConfirm(true); // Tampilkan modal konfirmasi
    setIsOpen(false); // Pastikan menu mobile tertutup saat modal muncul
  };

  // Fungsi yang dipanggil jika pengguna mengkonfirmasi logout
  const proceedLogout = () => {
    logout(); // Panggil fungsi logout dari AuthContext
    navigate('/'); // Arahkan ke halaman beranda atau login setelah logout
    setShowLogoutConfirm(false); // Sembunyikan modal setelah selesai
  };

  // Fungsi yang dipanggil jika pengguna membatalkan logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false); // Sembunyikan modal
  };

  // Gunakan gambar profil pengguna jika ada, jika tidak, gunakan default
  const profileImage = user?.profilePic || defaultAvatar;

  // Efek samping untuk mendeteksi klik di luar menu mobile untuk menutupnya
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Jika menuRef ada dan klik tidak di dalam menuRef
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false); // Tutup menu
      }
    };

    // Tambahkan event listener saat menu terbuka
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Hapus event listener saat komponen unmount atau isOpen berubah menjadi false
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Efek ini akan berjalan ulang setiap kali isOpen berubah

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#dcefff] shadow-md">
      <nav role="navigation" className="text-sky-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <h1 className="text-3xl font-bold text-sky-800">
              <span className="italic text-sky-500">biru</span>Laut
            </h1>
          </Link>

          {/* Tombol Toggle Menu untuk Mobile */}
          <div className="lg:hidden">
            <button onClick={toggleMenu} className="focus:outline-none" aria-label='Toggle Menu'>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-white transition-colors duration-300" // Perbaikan: Hapus 'transition' umum
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOutClick} // Memanggil fungsi konfirmasi
                  className="border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-white transition-colors duration-300" // Perbaikan: Hapus 'transition' umum
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-sky-200 bg-sky-800 px-4 py-1 rounded hover:bg-sky-200 hover:text-sky-800 transition-colors duration-300">SignIn</Link> {/* Perbaikan: Hapus 'transition' umum */}
                <Link to="/signup" className="border border-sky-800 text-sky-800 px-4 py-1 rounded hover:bg-sky-800 hover:text-sky-200 transition-colors duration-300">SignUp</Link> {/* Perbaikan: Hapus 'transition' umum */}
              </>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div
            ref={menuRef}
            className="lg:hidden mt-4 flex flex-col items-center gap-4 transition-all duration-300 ease-in-out"
          >
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="w-full text-center border border-sky-800 text-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl transition-colors duration-300" // Perbaikan: Hapus 'transition' umum
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOutClick} // Memanggil fungsi konfirmasi
                  className="w-full text-center border border-sky-800 text-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl transition-colors duration-300" // Perbaikan: Hapus 'transition' umum
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="w-full text-center text-sky-200 bg-sky-800 hover:text-sky-800 hover:bg-sky-200 px-4 py-2 rounded-xl transition-colors duration-300">SignIn</Link> {/* Perbaikan: Hapus 'transition' umum */}
                <Link to="/signup" className="w-full text-center border border-sky-800 px-4 py-2 hover:bg-sky-800 hover:text-white rounded-xl transition-colors duration-300">SignUp</Link> {/* Perbaikan: Hapus 'transition' umum */}
              </>
            )}
          </div>
        )}
      </nav>

      {/* Modal Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[100]"> {/* z-index lebih tinggi dari navbar (z-50) */}
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={proceedLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;