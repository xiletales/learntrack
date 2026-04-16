export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="capTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#1b5e20" />
        </linearGradient>
        <linearGradient id="capBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#388e3c" />
          <stop offset="100%" stopColor="#1b5e20" />
        </linearGradient>
      </defs>
      <polygon points="50,12 90,32 50,48 10,32" fill="url(#capTop)" />
      <line x1="10" y1="32" x2="90" y2="32" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <path d="M28,38 Q28,62 50,68 Q72,62 72,38" fill="url(#capBody)" />
      <line x1="84" y1="32" x2="84" y2="58" stroke="#2d7a2f" strokeWidth="2.5" />
      <circle cx="84" cy="60" r="4" fill="#1b5e20" />
      <line x1="81" y1="60" x2="79" y2="70" stroke="#2d7a2f" strokeWidth="1.5" />
      <line x1="84" y1="60" x2="84" y2="71" stroke="#2d7a2f" strokeWidth="1.5" />
      <line x1="87" y1="60" x2="89" y2="70" stroke="#2d7a2f" strokeWidth="1.5" />
      <polyline points="18,82 34,72 50,76 66,64 82,58" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="18" cy="82" r="3" fill="white" stroke="#2d7a2f" strokeWidth="1.5" />
      <circle cx="34" cy="72" r="3" fill="white" stroke="#2d7a2f" strokeWidth="1.5" />
      <circle cx="50" cy="76" r="3" fill="white" stroke="#2d7a2f" strokeWidth="1.5" />
      <circle cx="66" cy="64" r="3" fill="white" stroke="#2d7a2f" strokeWidth="1.5" />
      <circle cx="82" cy="58" r="3" fill="white" stroke="#2d7a2f" strokeWidth="1.5" />
    </svg>
  );
}
