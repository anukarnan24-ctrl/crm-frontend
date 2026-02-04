export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-black px-4 py-2 text-white hover:bg-black/90 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}