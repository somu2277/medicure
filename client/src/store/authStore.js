import { create } from 'zustand';

// Try to load user info from localStorage if it exists
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const tokenFromStorage = localStorage.getItem('token')
  ? localStorage.getItem('token')
  : null;

const useAuthStore = create((set) => ({
  userInfo: userInfoFromStorage,
  token: tokenFromStorage,

  setCredentials: (data, token) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    localStorage.setItem('token', token);
    set({ userInfo: data, token: token });
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    set({ userInfo: null, token: null });
  },
}));

export default useAuthStore;
