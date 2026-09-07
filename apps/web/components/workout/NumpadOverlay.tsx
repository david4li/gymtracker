"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];

export function NumpadOverlay({
  label,
  initialValue,
  onClose,
  onSubmit,
}: {
  label: string;
  initialValue: number;
  onClose: () => void;
  onSubmit: (value: number) => void;
}) {
  const [text, setText] = useState(String(initialValue));

  function press(key: string) {
    if (key === "del") {
      setText((t) => t.slice(0, -1));
      return;
    }
    if (key === "." && text.includes(".")) return;
    setText((t) => (t === "0" ? key : t + key));
  }

  return (
    <Modal open onClose={onClose} title={`Set ${label}`}>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-black/5 py-4 text-center text-3xl font-bold tabular-nums dark:bg-white/10">{text || "0"}</div>
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className="h-14 rounded-xl bg-black/5 text-lg font-semibold active:bg-black/10 dark:bg-white/10 dark:active:bg-white/15"
            >
              {key === "del" ? "<-" : key}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => onSubmit(Number(text) || 0)}
        >
          Set
        </Button>
      </div>
    </Modal>
  );
}
