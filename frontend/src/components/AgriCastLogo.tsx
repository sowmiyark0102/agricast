interface Props {
  size?: number;
  variant?: "full" | "icon";
  className?: string;
}

/**
 * Original AgriCast AI mark: rain cloud + circuit/data accent + a sprout
 * rising from layered soil. Rendered inline so it scales cleanly at any
 * size without an extra image request.
 */
export default function AgriCastLogo({ size = 40, variant = "icon", className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="100" cy="100" r="94" fill="#F3F6F1" stroke="#1F5F3F" strokeWidth="5" />

        {/* rain cloud */}
        <path
          d="M58 72 a14 14 0 0 1 26 -7 a11 11 0 0 1 19 8 a10 10 0 0 1 -2 20 h-40 a11 11 0 0 1 -3 -21 z"
          fill="#3E8FD6"
        />
        <line x1="66" y1="100" x2="62" y2="112" stroke="#3E8FD6" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="78" y1="100" x2="74" y2="115" stroke="#3E8FD6" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="90" y1="100" x2="87" y2="110" stroke="#3E8FD6" strokeWidth="4.5" strokeLinecap="round" />

        {/* circuit / data accent */}
        <circle cx="128" cy="66" r="3.2" fill="#E8A93C" />
        <line x1="128" y1="66" x2="140" y2="66" stroke="#E8A93C" strokeWidth="2.4" />
        <circle cx="143" cy="66" r="2.6" fill="#E8A93C" />
        <line x1="143" y1="66" x2="143" y2="78" stroke="#E8A93C" strokeWidth="2.4" />
        <circle cx="143" cy="81" r="2.4" fill="#E8A93C" />

        {/* layered soil */}
        <path d="M40 150 Q70 140 100 150 T160 150" fill="none" stroke="#8B5E34" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <path d="M40 162 Q70 154 100 162 T160 162" fill="none" stroke="#8B5E34" strokeWidth="4" strokeLinecap="round" opacity="0.35" />

        {/* sprout */}
        <path d="M100 150 C 100 128 84 116 66 112 C 70 132 84 146 100 150 Z" fill="#3FA35E" />
        <path d="M100 150 C 100 122 118 108 138 104 C 133 128 118 144 100 150 Z" fill="#1F5F3F" />
        <line x1="100" y1="150" x2="100" y2="118" stroke="#14402B" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {variant === "full" && (
        <span className="leading-tight">
          <span className="block font-serif font-bold text-agri-forest" style={{ fontSize: size * 0.42 }}>
            AGRICAST <span className="text-agri-green">AI</span>
          </span>
        </span>
      )}
    </div>
  );
}
