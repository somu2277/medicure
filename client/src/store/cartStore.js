import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (product, qty = 1) => {
        set((state) => {
          const existItem = state.cartItems.find((x) => x._id === product._id);
          if (existItem) {
            return {
              cartItems: state.cartItems.map((x) =>
                x._id === existItem._id ? { ...existItem, qty: existItem.qty + qty } : x
              ),
            };
          } else {
            return { cartItems: [...state.cartItems, { ...product, qty }] };
          }
        });
      },
      
      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((x) => x._id !== id),
        }));
      },
      
      updateQuantity: (id, qty) => {
        set((state) => ({
          cartItems: state.cartItems.map((x) => 
            x._id === id ? { ...x, qty: Math.max(1, qty) } : x
          ),
        }));
      },
      
      clearCart: () => set({ cartItems: [] }),
      
      getCartTotal: () => {
        const { cartItems } = get();
        const mrpTotal = cartItems.reduce((acc, item) => acc + item.mrp * item.qty, 0);
        const subtotal = cartItems.reduce((acc, item) => acc + item.sellingPrice * item.qty, 0);
        const discount = mrpTotal - subtotal;
        const requiresPrescription = cartItems.some(item => item.prescriptionRequired);
        
        return { mrpTotal, subtotal, discount, requiresPrescription };
      }
    }),
    {
      name: 'medicare-cart',
    }
  )
);

export default useCartStore;
