interface LigonCatProps {
  className?: string;
  size?: number;
}

export function LigonCat({ className = "", size = 200 }: LigonCatProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cat head (circle) */}
      <circle cx="100" cy="100" r="60" fill="#22C55E" />
      
      {/* Left ear (triangle) */}
      <path
        d="M 60 60 L 50 20 L 80 50 Z"
        fill="#22C55E"
      />
      
      {/* Right ear (triangle) */}
      <path
        d="M 140 60 L 120 50 L 150 20 Z"
        fill="#22C55E"
      />
      
      {/* Inner left ear (triangle) */}
      <path
        d="M 63 55 L 58 30 L 75 52 Z"
        fill="#86EFAC"
      />
      
      {/* Inner right ear (triangle) */}
      <path
        d="M 137 55 L 125 52 L 142 30 Z"
        fill="#86EFAC"
      />
      
      {/* Left eye (semicircle) */}
      <path
        d="M 70 90 A 12 12 0 0 1 90 90 Z"
        fill="#1E293B"
      />
      
      {/* Right eye (semicircle) */}
      <path
        d="M 110 90 A 12 12 0 0 1 130 90 Z"
        fill="#1E293B"
      />
      
      {/* Nose (small triangle) */}
      <path
        d="M 100 105 L 95 115 L 105 115 Z"
        fill="#1E293B"
      />
      
      {/* Left whiskers */}
      <line x1="45" y1="95" x2="70" y2="95" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="105" x2="70" y2="102" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      
      {/* Right whiskers */}
      <line x1="130" y1="95" x2="155" y2="95" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      <line x1="130" y1="102" x2="155" y2="105" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      
      {/* Mouth (small curve) */}
      <path
        d="M 95 115 Q 100 120 105 115"
        stroke="#1E293B"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}