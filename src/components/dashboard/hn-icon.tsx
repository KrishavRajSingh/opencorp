export function HNIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="3" fill="#FF6600" />
      <path
        d="M6 6H9.5L12 10L14.5 6H18L13 13V18H11V13L6 6Z"
        fill="white"
      />
    </svg>
  );
}
