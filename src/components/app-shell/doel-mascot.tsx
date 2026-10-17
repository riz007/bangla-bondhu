export function DoelMascot({ className = "", size = 120 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 160 140"
      width={size}
      height={(size * 140) / 160}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="#1d2b2a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* branch */}
        <path d="M6 118c40-6 96-6 148 4" fill="none" stroke="#a0673a" strokeWidth="7" />
        <path d="M120 120c6-10 16-14 26-12-4 10-14 14-26 12z" fill="#3d7a38" />
        {/* tail */}
        <path d="M34 78L6 46l10-4 30 28z" fill="#1d2b2a" />
        <path d="M14 48l26 26" fill="none" stroke="#fffdf7" strokeWidth="3" />
        {/* body */}
        <path
          d="M40 80c0-26 22-44 50-44 22 0 38 14 40 32 2 22-16 40-44 42-28 2-46-10-46-30z"
          fill="#1d2b2a"
        />
        {/* white belly */}
        <path d="M60 96c10 12 34 16 54 2 6-6 10-14 12-22-14 14-44 22-66 20z" fill="#fffdf7" />
        {/* white wing bar */}
        <path d="M58 70c12 4 26 4 36 0" fill="none" stroke="#fffdf7" strokeWidth="6" />
        {/* head */}
        <circle cx="112" cy="46" r="22" fill="#1d2b2a" />
        <path d="M132 46l18 4-18 6z" fill="#f3a712" />
        <circle cx="118" cy="42" r="5" fill="#fffdf7" stroke="none" />
        <circle cx="119.5" cy="42" r="2.5" fill="#1d2b2a" stroke="none" />
        {/* feet */}
        <path d="M80 110v10M94 110v10" fill="none" />
        {/* mango-coloured satchel strap: the explorer */}
        <path d="M98 30c-10 22-24 40-44 50" fill="none" stroke="#f3a712" strokeWidth="5" />
      </g>
    </svg>
  );
}
