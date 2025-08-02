import { create } from "zustand";

type AuthState = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setLoggedIn: (value) => set({ isLoggedIn: value }),
}));
