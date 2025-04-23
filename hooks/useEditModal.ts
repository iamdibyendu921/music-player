import { create } from "zustand";

interface EditModalState {
  isOpen: boolean;
  song: any | null;
  onOpen: (song: any) => void;
  onClose: () => void;
}

const useEditModal = create<EditModalState>((set) => ({
  isOpen: false,
  song: null,
  onOpen: (song) => set({ isOpen: true, song }),
  onClose: () => set({ isOpen: false, song: null }),
}));

export default useEditModal;
