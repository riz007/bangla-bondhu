"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useT } from "@/features/settings/settings-store";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useT();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border-2 border-ink bg-card p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="font-display text-2xl">
          {title}
        </h2>
        <div className="text-ink-soft">{children}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className={`btn ${destructive ? "bg-coral-ink text-white shadow-[0_4px_0_var(--ink)]" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
