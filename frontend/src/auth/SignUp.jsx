import React, { useState } from 'react';
import heroLogin from "../assets/heroLogin.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignupForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required!');
      setSuccess('');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setSuccess('');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      setSuccess('');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/user/register", {
        username,
        email,
        password,
        confirmPassword
      });

      setError('');
      setSuccess('Registration successful! Redirecting to login...');
      console.log("User registered:", response.data);

      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (e) {
      const msg = e.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Form section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-sky-50 p-6">
        <div className="w-full max-w-sm bg-transparent rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center text-[#00859D] mb-6">
            Sign Up
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-600 text-sm px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 text-sm px-4 py-2 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sky-800 text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Your Username"
                className="w-full px-4 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sky-800 text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-md transition ${
                isLoading ? 'bg-sky-400 cursor-not-allowed' : 'bg-[#00859D] hover:bg-sky-700'
              } text-white`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/signin" className="text-sky-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Image section */}
      <div className="w-full md:w-1/2 h-64 md:h-auto">
        <img src={heroLogin} alt="Hero" className="object-cover w-full h-full" />
      </div>
    </div>
  );
};

export default SignupForm;
