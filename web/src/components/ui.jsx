export function Btn({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:brightness-110 active:brightness-95",
    secondary: "bg-[var(--grey-soft)] text-[var(--ink)] hover:bg-[var(--line)]",
    danger: "bg-[var(--red)] text-white hover:brightness-110",
    ghost: "bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--grey-soft)]",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-[var(--shadow-sm)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10.5px] font-semibold uppercase tracking-wide text-[var(--muted)] mb-1.5">
      {children}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3.5 py-2.5 text-sm text-[var(--ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent)]";

export function Input(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}
export function Select(props) {
  return <select {...props} className={`${inputCls} ${props.className || ""}`} />;
}
export function Textarea(props) {
  return <textarea {...props} className={`${inputCls} resize-y ${props.className || ""}`} />;
}

const BADGE_STYLES = {
  done: "bg-[var(--green-soft)] text-[var(--green)]",
  prog: "bg-[var(--amber-soft)] text-[var(--amber)]",
  not: "bg-[var(--grey-soft)] text-[var(--muted)]",
  high: "bg-[var(--red-soft)] text-[var(--red)]",
  med: "bg-[var(--blue-soft)] text-[var(--blue)]",
  low: "bg-[var(--grey-soft)] text-[var(--muted)]",
  bug: "bg-[var(--red-soft)] text-[var(--red)]",
  ui: "bg-[var(--blue-soft)] text-[var(--blue)]",
  func: "bg-[var(--green-soft)] text-[var(--green)]",
  ver: "bg-[var(--purple-soft)] text-[var(--purple)]",
};
export function Badge({ tone = "not", children, className = "", onClick }) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-transform ${onClick ? "hover:scale-[1.03] active:scale-[0.97]" : ""} ${BADGE_STYLES[tone] || BADGE_STYLES.not} ${className}`}
    >
      {children}
    </Comp>
  );
}

export function EmptyState({ children }) {
  return <div className="text-sm text-[var(--muted)] py-6 text-center">{children}</div>;
}

export function Hint({ children }) {
  return <p className="text-xs text-[var(--muted)] mb-3">{children}</p>;
}
