export default function MeridianMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 42" aria-hidden="true">
      <path
        d="M6 31V6L24 21L42 6V31"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <circle cx="24" cy="35.5" r="3.8" fill="currentColor" />
    </svg>
  );
}
