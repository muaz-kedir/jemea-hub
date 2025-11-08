interface HumsjLogoProps {
  className?: string;
  size?: number;
}

export const HumsjLogo = ({ className = "", size = 48 }: HumsjLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Minaret */}
      <rect x="110" y="90" width="30" height="260" fill="#1A9BA8" />
      <circle cx="125" cy="85" r="15" fill="#1A9BA8" />
      <rect x="115" y="70" width="20" height="20" fill="#1A9BA8" />
      
      {/* Mosque Dome */}
      <path
        d="M 170 140 Q 250 80 330 140 L 330 210 L 170 210 Z"
        fill="none"
        stroke="#1A9BA8"
        strokeWidth="25"
      />
      
      {/* Crescent and Star */}
      <g transform="translate(245, 70)">
        <path
          d="M 0 0 Q -15 -10 -20 0 Q -15 10 0 0 Q 5 -15 0 -25 Q -5 -15 0 0"
          fill="#1A9BA8"
        />
        <path
          d="M 5 -5 L 8 -8 L 6 -5 L 9 -5 L 6 -3 L 7 0 L 5 -2 L 3 0 L 4 -3 L 1 -5 L 4 -5 Z"
          fill="#1A9BA8"
        />
      </g>
      
      {/* HUMSJ Text */}
      <text
        x="250"
        y="280"
        fontSize="100"
        fontWeight="bold"
        fill="#1A9BA8"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        HUMSJ
      </text>
      
      {/* Book/Quran Symbol */}
      <path
        d="M 170 310 Q 250 290 330 310 L 330 350 Q 250 370 170 350 Z"
        fill="none"
        stroke="#1A9BA8"
        strokeWidth="8"
      />
      <path
        d="M 250 295 L 250 365"
        stroke="#1A9BA8"
        strokeWidth="4"
      />
      
      {/* Hand */}
      <path
        d="M 340 320 Q 360 315 370 325 Q 375 335 365 345 Q 355 350 345 345"
        fill="none"
        stroke="#1A9BA8"
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* University Text */}
      <text
        x="250"
        y="395"
        fontSize="28"
        fontWeight="600"
        fill="#1A9BA8"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        HARAMAYA UNIVERSITY
      </text>
      
      {/* Subtitle */}
      <text
        x="250"
        y="425"
        fontSize="20"
        fill="#666"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        MUSLIM STUDENTS JEMA'A
      </text>
    </svg>
  );
};
