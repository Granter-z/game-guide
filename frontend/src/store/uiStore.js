import { create } from 'zustand';

const readDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

const useUiStore = create((set) => ({
  mobileNavOpen: false,
  /** 与 Tailwind `md` 一致：>=768px 为桌面端 */
  isDesktop: readDesktop(),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setIsDesktop: (isDesktop) => set({ isDesktop }),
}));

export default useUiStore;
