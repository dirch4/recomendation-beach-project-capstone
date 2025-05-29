// src/auth/SignIn.jsx

import React, { useState } from 'react';
import heroLogin from "../assets/heroLogin.png";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import AuthContext Anda

const SigninForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Dapatkan fungsi login dari AuthContext

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError('Email and password are required!');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/user/login', {
      email,
      password
    });

    // Pastikan Anda mendapatkan token dari response.data.user.token
    const receivedToken = response.data.user?.token; // Menggunakan optional chaining untuk keamanan

    if (receivedToken) { // <-- Sekarang cek receivedToken
      localStorage.setItem('token', receivedToken);
      login(receivedToken); // Panggil fungsi login dari AuthContext

      // Opsional: Simpan juga data user ke localStorage jika Anda membutuhkannya secara persisten
      // Atau, lebih baik biarkan AuthContext mengelola decoded user
      // localStorage.setItem('user', JSON.stringify(response.data.user)); 

      navigate('/'); // Arahkan ke halaman utama setelah login sukses
    } else {
      // Kasus ini seharusnya tidak lagi terjadi jika backend selalu mengembalikan token di data.user.token
      setError('Login failed: Token not found in response.'); // Ubah pesan error agar lebih akurat
      // navigate('/') // Mungkin lebih baik tidak navigasi jika token tidak ada
    }

  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed. Please try again.';
    setError(msg);
  }
};

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-b from-[#dcefff] to-white">

      {/* Gambar - sisi kiri */}
      <div className="w-full md:w-1/2 h-64 md:h-auto">
        <img src={heroLogin} alt="Login Visual" className="object-cover w-full h-full" />
      </div>

      {/* Form - sisi kanan */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-sky-50 p-6">
        <div className="w-full max-w-sm bg-transparent rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center text-[#00859D] mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-600 text-sm px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sky-800 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sky-800 text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00859D] text-white py-2 rounded-md hover:bg-sky-700 transition"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-sky-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;