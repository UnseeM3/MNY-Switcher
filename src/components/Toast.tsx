import { useNotificationStore } from "../stores/notification";

export function Toast() {
  const message = useNotificationStore((state) => state.message);
  const hide = useNotificationStore((state) => state.hide);

  if (!message) return null;

  return (
    <div
      onClick={hide}
      className="pointer-events-auto fixed bottom-3 left-1/2 z-30 -translate-x-1/2 cursor-pointer bg-accent px-4 py-2 text-xs font-medium text-black shadow-xl"
    >
      {message}
    </div>
  );
}
