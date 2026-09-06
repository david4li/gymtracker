"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { XIcon } from "@/components/ui/icons";

function Overlay({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} aria-hidden />;
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10">
              <XIcon width={18} height={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

/** Bottom sheet: slides up from the bottom, used for the exercise switcher. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8 shadow-xl dark:bg-zinc-900">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-black/10 dark:bg-white/15" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10">
            <XIcon width={18} height={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
