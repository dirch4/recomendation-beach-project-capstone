import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from '../components/pages/Homepage';
import Signin from '../auth/SignIn';
import Signup from '../auth/SignUp';
import Search from '../components/pages/Searchpage';
import Navbar from '../components/layouts/Navbar';
import DetailPage from '../components/pages/Detailpage';

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
    element: <Signin />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/search',
    element: <Layout><Search /></Layout>,
  },
  {
    path: '/detail/:placeId',
    element: <Layout><DetailPage /></Layout>,
  }
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;
