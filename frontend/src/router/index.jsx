import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import LoadingPage from '../components/ui/LoadingPage';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/store/Home'));
const Shop = lazy(() => import('../pages/store/Shop'));
const ProductDetail = lazy(() => import('../pages/store/ProductDetail'));
const Cart = lazy(() => import('../pages/store/Cart'));
const Checkout = lazy(() => import('../pages/store/Checkout'));
const OrderSuccess = lazy(() => import('../pages/store/OrderSuccess'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const AccountDashboard = lazy(() => import('../pages/account/AccountDashboard'));
const AccountOrders = lazy(() => import('../pages/account/AccountOrders'));
const AccountAddresses = lazy(() => import('../pages/account/AccountAddresses'));
const AccountWishlist = lazy(() => import('../pages/account/AccountWishlist'));
const AccountPassword = lazy(() => import('../pages/account/AccountPassword'));
const About = lazy(() => import('../pages/static/About'));
const Contact = lazy(() => import('../pages/static/Contact'));
const FAQ = lazy(() => import('../pages/static/FAQ'));
const Privacy = lazy(() => import('../pages/static/Privacy'));
const Terms = lazy(() => import('../pages/static/Terms'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('../pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('../pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('../pages/admin/AdminCoupons'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminApiIntegration = lazy(() => import('../pages/admin/AdminApiIntegration'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

// Route guards
const ProtectedRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'admin' && user.role !== 'superadmin') return <Navigate to="/" replace />;
  return <Outlet />;
};

const GuestRoute = () => {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingPage />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // Main storefront
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><Home /></SuspenseWrapper> },
      { path: 'shop', element: <SuspenseWrapper><Shop /></SuspenseWrapper> },
      { path: 'shop/:slug', element: <SuspenseWrapper><ProductDetail /></SuspenseWrapper> },
      { path: 'cart', element: <SuspenseWrapper><Cart /></SuspenseWrapper> },
      { path: 'about', element: <SuspenseWrapper><About /></SuspenseWrapper> },
      { path: 'contact', element: <SuspenseWrapper><Contact /></SuspenseWrapper> },
      { path: 'faq', element: <SuspenseWrapper><FAQ /></SuspenseWrapper> },
      { path: 'privacy', element: <SuspenseWrapper><Privacy /></SuspenseWrapper> },
      { path: 'terms', element: <SuspenseWrapper><Terms /></SuspenseWrapper> },

      // Protected customer routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <SuspenseWrapper><Checkout /></SuspenseWrapper> },
          { path: 'order-success/:id', element: <SuspenseWrapper><OrderSuccess /></SuspenseWrapper> },
          { path: 'account', element: <SuspenseWrapper><AccountDashboard /></SuspenseWrapper> },
          { path: 'account/orders', element: <SuspenseWrapper><AccountOrders /></SuspenseWrapper> },
          { path: 'account/addresses', element: <SuspenseWrapper><AccountAddresses /></SuspenseWrapper> },
          { path: 'account/wishlist', element: <SuspenseWrapper><AccountWishlist /></SuspenseWrapper> },
          { path: 'account/password', element: <SuspenseWrapper><AccountPassword /></SuspenseWrapper> },
        ],
      },
    ],
  },
  // Auth routes
  {
    path: '/auth',
    element: <GuestRoute />,
    children: [
      { path: 'login', element: <SuspenseWrapper><Login /></SuspenseWrapper> },
      { path: 'register', element: <SuspenseWrapper><Register /></SuspenseWrapper> },
      { path: 'forgot-password', element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper> },
      { path: 'reset-password/:token', element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper> },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper> },
          { path: 'products', element: <SuspenseWrapper><AdminProducts /></SuspenseWrapper> },
          { path: 'products/new', element: <SuspenseWrapper><AdminProductForm /></SuspenseWrapper> },
          { path: 'products/:id/edit', element: <SuspenseWrapper><AdminProductForm /></SuspenseWrapper> },
          { path: 'categories', element: <SuspenseWrapper><AdminCategories /></SuspenseWrapper> },
          { path: 'orders', element: <SuspenseWrapper><AdminOrders /></SuspenseWrapper> },
          { path: 'orders/:id', element: <SuspenseWrapper><AdminOrderDetail /></SuspenseWrapper> },
          { path: 'customers', element: <SuspenseWrapper><AdminCustomers /></SuspenseWrapper> },
          { path: 'coupons', element: <SuspenseWrapper><AdminCoupons /></SuspenseWrapper> },
          { path: 'reviews', element: <SuspenseWrapper><AdminReviews /></SuspenseWrapper> },
          { path: 'api-integration', element: <SuspenseWrapper><AdminApiIntegration /></SuspenseWrapper> },
          { path: 'settings', element: <SuspenseWrapper><AdminSettings /></SuspenseWrapper> },
        ],
      },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
