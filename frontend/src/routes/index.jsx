// frontend/src/routes/index.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import Homepage from '../components/pages/Homepage';
import Signin from '../auth/SignIn';
import Signup from '../auth/SignUp';
import Search from '../components/pages/Searchpage';
import Navbar from '../components/layouts/Navbar';
import DetailPage from '../components/pages/Detailpage';
import ProfilePage from '../components/pages/Profilepage';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/layouts/Footer';

const Layout = ({ children }) => (
  <div className='flex flex-col min-h-screen'>
    <Navbar />
    <main className="pt-16 flex-1">{children}</main>
    <Footer />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Homepage /></Layout>,
  },
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/search',
    element: <Layout><Search /></Layout>,
  },
  {
    path: '/detail/:placeId',
    element: <Layout><DetailPage /></Layout>,
  },
]);

const AppRoutes = () => (
  <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={router} />
  </AuthProvider>
);

export default AppRoutes;
