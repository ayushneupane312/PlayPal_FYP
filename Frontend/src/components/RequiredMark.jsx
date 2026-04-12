/** Red asterisk for required field labels — use next to label text. */
export function RequiredMark({ className = '' }) {
  return (
    <span className={`text-red-500 font-semibold ${className}`.trim()} aria-hidden="true">
      *
    </span>
  );
}
