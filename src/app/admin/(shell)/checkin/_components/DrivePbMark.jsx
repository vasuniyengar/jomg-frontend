export default function DrivePbMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      style={{ color: "var(--primary-text)", flexShrink: 0 }}
      aria-hidden
    >
      <ellipse
        cx="10"
        cy="10"
        rx="9"
        ry="9"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="7" y="4" width="6" height="10" rx="3" fill="currentColor" />
      <line
        x1="13"
        y1="12"
        x2="18"
        y2="18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
