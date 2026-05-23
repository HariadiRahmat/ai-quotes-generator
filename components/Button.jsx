// Reusable button with subtle, refined variants + smooth hover.
export default function Button({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
  className = "",
  title,
}) {
  const variants = {
    primary:
      "bg-ink text-paper hover:bg-black shadow-soft hover:shadow-lift",
    secondary:
      "bg-white text-ink border border-line hover:border-ink/30 hover:shadow-soft",
    ghost:
      "bg-transparent text-muted hover:text-ink hover:bg-whisper",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-full px-5 py-2.5 text-sm font-medium tracking-tight",
        "transition-all duration-300 ease-out",
        "active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
