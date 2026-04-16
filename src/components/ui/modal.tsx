"use client";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-[999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-emerald-200 p-9 w-[360px] shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
