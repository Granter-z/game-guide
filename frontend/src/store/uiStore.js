import { create } from 'zustand';

const useUiStore = create((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));

export default useUiStore;
