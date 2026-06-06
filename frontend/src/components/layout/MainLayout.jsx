import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

export default function MainLayout() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const token = useAuthStore((s) => s.token);
  const syncWithServer = useCartStore((s) => s.syncWithServer);

  useEffect(() => {
    const storedToken = localStorage.getItem('shopbd_token');
    if (storedToken || token) {
      fetchMe();
      syncWithServer();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
