import { create } from 'zustand';

<<<<<<< HEAD
const readDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

const useUiStore = create((set) => ({
  mobileNavOpen: false,
  /** 与 Tailwind `md` 一致：>=768px 为桌面端 */
  isDesktop: readDesktop(),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setIsDesktop: (isDesktop) => set({ isDesktop }),
=======
const useUiStore = create((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
>>>>>>> a7d1111ec8da3cb7aa4e429aea4cedac9adef574
}));

export default useUiStore;
