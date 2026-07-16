import { Btn } from "./ui.jsx";

export default function ConfirmModal({ title, body, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] p-6 w-full max-w-sm">
        <h3 className="font-bold text-base mb-2">{title}</h3>
        {body && <p className="text-sm text-[var(--muted)] mb-5">{body}</p>}
        <div className="flex gap-2 justify-end">
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
