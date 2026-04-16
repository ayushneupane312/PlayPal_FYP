/** Khalti-style mark: purple tile with “K” (for UI lists; not an official asset). */
export default function KhaltiLogo({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <rect width="24" height="24" rx="5.5" fill="#5C2D91" />
      <path
        fill="#fff"
        d="M7 6.25h2.35v4.9h.15L14.2 6.25h2.85l-4.55 5.35 4.9 6.15h-2.9l-3.85-4.95h-.4v4.95H7V6.25z"
      />
    </svg>
  );
}
