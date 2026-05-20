import { create } from "zustand";

type NotificationState = {
  message: string | null;
  show: (message: string, durationMs?: number) => void;
  hide: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    message: null,
    show: (message, durationMs = 4000) => {
      if (timeoutId) clearTimeout(timeoutId);
      set({ message });
      timeoutId = setTimeout(() => set({ message: null }), durationMs);
    },
    hide: () => {
      if (timeoutId) clearTimeout(timeoutId);
      set({ message: null });
    },
  };
});
