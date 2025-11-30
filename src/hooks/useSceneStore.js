import { create } from 'zustand'

export const useSceneStore = create((set) => ({
  // State untuk Sistem 1 (Scroll-Scrubbing)
  currentScale: 'atom', // Scene awal
  setCurrentScale: (scale) => set({ currentScale: scale }),

  // State untuk AI Panel
  isAIPanelOpen: false,
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  
  // State untuk 'fake' scroll
  totalScrollHeight: '700vh',
  
  /*
    HAPUS 'currentSceneIndex' dan 'setScene'.
    Kita tidak membutuhkannya sama sekali karena kita
    memakai useScrollNavigation.js (Sistem 1).
  */
  scaleExp: -9.52,
  setScaleExp: (exp) => set({ scaleExp: exp }),
}))