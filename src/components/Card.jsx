export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-neutral-800 shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}
