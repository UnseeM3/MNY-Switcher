import { useRef, useState } from "react";

type TooltipSide = "top" | "bottom";

type TooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: TooltipSide;
  delayMs?: number;
};

export function Tooltip({ label, children, side = "bottom", delayMs = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(): void {
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  }

  function hide(): void {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  const position =
    side === "top"
      ? "bottom-full mb-1.5 left-1/2 -translate-x-1/2"
      : "top-full mt-1.5 left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseDown={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`animate-tooltip pointer-events-none absolute z-50 whitespace-nowrap bg-fg px-2 py-1 text-[10px] font-medium text-base shadow-lg ${position}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
