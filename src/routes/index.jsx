import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from '../components/pages/Homepage';
import Signin from '../auth/SignIn';
import Signup from '../auth/SignUp';
import Search from '../components/pages/Searchpage';
import Navbar from '../components/layouts/Navbar';

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Homepage /></Layout>,
  },
  {
    path: '/signin',
    element: <Layout><Signin /></Layout>,
  },
  {
    path: '/signup',
    element: <Layout><Signup /></Layout>,
  },
  {
    path: '/search',
    element: <Layout><Search /></Layout>,
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;
