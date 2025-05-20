import React, { useState } from 'react';
import heroLogin from "../assets/heroLogin.png"
import { Link} from 'react-router-dom';

const SigninForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    
    const handleSubmit = (e) => {
      e.preventDefault();
    
      if (!email || !password) {
        setError('Email and password are required!');
        return;
      }
    
      setError('');
      console.log('Sign In data:', { email, password });
      
    };
  
    return (
      <div className="flex flex-col md:flex-row h-screen">

        {/* Gambar - sisi kiri */}
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img src={heroLogin} alt="" className="object-cover w-full h-full" />
        </div>


        {/* Form - sisi kanan */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-sky-50 p-6">
          <div className="w-full max-w-sm bg-transparent rounded-xl p-6">
            <h2 className="text-3xl font-bold text-center text-[#00859D] mb-6">
              Sign In
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-600 text-sm px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sky-800 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
          
              <div>
                <label className="block text-sky-800 text-sm font-medium mb-1">
                  Password
                </label>
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
