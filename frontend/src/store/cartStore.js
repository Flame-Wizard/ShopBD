import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { product: {...}, qty, variant, _id }
      loading: false,

      // Compute totals
      get subtotal() {
        return get().items.reduce((sum, item) => {
          const price = item.product?.salePrice || item.product?.price || 0;
          return sum + price * item.qty;
        }, 0);
      },

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      syncWithServer: async () => {
        try {
          const { data } = await api.get('/cart');
          set({ items: data.cart.items });
        } catch {}
      },

      addItem: async (productId, qty = 1, variant = '') => {
        set({ loading: true });
        try {
          const { data } = await api.post('/cart', { product: productId, qty, variant });
          set({ items: data.cart.items, loading: false });
          toast.success('Added to cart!');
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
      },

      updateItem: async (itemId, qty) => {
        try {
          const { data } = await api.put(`/cart/${itemId}`, { qty });
          set({ items: data.cart.items });
        } catch (err) {
          toast.error('Failed to update cart');
        }
      },

      removeItem: async (itemId) => {
        try {
          const { data } = await api.delete(`/cart/${itemId}`);
          set({ items: data.cart.items });
          toast.success('Item removed');
        } catch {}
      },

      clearCart: async () => {
        try {
          await api.delete('/cart/clear');
          set({ items: [] });
        } catch {
          set({ items: [] });
        }
      },

      // Optimistic local add (for non-logged-in users)
      addLocalItem: (product, qty = 1, variant = '') => {
        const items = [...get().items];
        const existing = items.find((i) => i.product._id === product._id && i.variant === variant);
        if (existing) {
          existing.qty += qty;
        } else {
          items.push({ product, qty, variant, _id: `local-${Date.now()}` });
        }
        set({ items });
        toast.success('Added to cart!');
      },

      removeLocalItem: (productId, variant = '') => {
        set({ items: get().items.filter((i) => !(i.product._id === productId && i.variant === variant)) });
      },
    }),
    {
      name: 'shopbd-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
