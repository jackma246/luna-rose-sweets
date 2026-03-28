export default function Logo({
  className = "",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Square background with rounded corners */}
      <rect x="2" y="2" width="116" height="116" rx="16" fill="#FFF8F3" stroke="#3C1F14" strokeWidth="2.5" />

      {/* Rose petals - stylized */}
      <path
        d="M60 28C60 28 72 38 72 48C72 54 67 58 60 58C53 58 48 54 48 48C48 38 60 28 60 28Z"
        fill="#E8B4B8"
      />
      <path
        d="M44 50C44 50 48 40 56 38C52 46 50 52 52 58C46 56 42 54 44 50Z"
        fill="#D4A0A6"
        opacity="0.8"
      />
      <path
        d="M76 50C76 50 72 40 64 38C68 46 70 52 68 58C74 56 78 54 76 50Z"
        fill="#D4A0A6"
        opacity="0.8"
      />

      {/* Crescent moon */}
      <path
        d="M38 30C42 26 48 24 54 24C48 28 44 34 44 42C44 46 45 48 46 50C40 46 36 38 38 30Z"
        fill="#C9956B"
        opacity="0.7"
      />

      {/* Small star */}
      <circle cx="82" cy="30" r="3" fill="#C9956B" />
      <circle cx="78" cy="24" r="1.5" fill="#C9956B" opacity="0.6" />

      {/* LUNA */}
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="16"
        fontWeight="700"
        fill="#3C1F14"
        letterSpacing="3"
      >
        LUNA
      </text>
      {/* ROSE */}
      <text
        x="60"
        y="93"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="11"
        fontWeight="400"
        fill="#C9956B"
        letterSpacing="5"
      >
        ROSE
      </text>
      {/* SWEETS */}
      <text
        x="60"
        y="106"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="8"
        fontWeight="400"
        fill="#3C1F14"
        letterSpacing="4"
      >
        SWEETS
      </text>

      {/* Decorative line */}
      <line x1="30" y1="68" x2="90" y2="68" stroke="#C9A882" strokeWidth="0.75" />
    </svg>
  );
}
