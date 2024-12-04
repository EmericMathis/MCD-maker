import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: prefersDark,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));