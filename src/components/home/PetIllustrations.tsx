export function PuppyOnMoon() {
  return (
    <div className="pointer-events-none absolute left-4 top-28 hidden sm:block md:left-10 lg:left-16">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
        <path
          d="M60 95C35 95 18 78 18 58C18 38 35 22 60 22C85 22 102 38 102 58C102 78 85 95 60 95Z"
          fill="#FFD966"
          opacity="0.9"
        />
        <path
          d="M18 58C18 38 35 22 60 22C60 22 40 45 18 58Z"
          fill="#F5C842"
          opacity="0.5"
        />
        <ellipse cx="52" cy="48" rx="22" ry="20" fill="#F4C896" />
        <ellipse cx="68" cy="52" rx="18" ry="17" fill="#E8B87A" />
        <circle cx="46" cy="46" r="3" fill="#3D2A4A" />
        <circle cx="58" cy="48" r="3" fill="#3D2A4A" />
        <ellipse cx="52" cy="54" rx="4" ry="3" fill="#C98B5A" />
        <path d="M38 42 L32 36 M72 44 L78 38" stroke="#C98B5A" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="52" cy="62" rx="14" ry="10" fill="#F4C896" />
      </svg>
      <svg
        className="absolute -right-2 top-0 star-twinkle text-gold"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
    </div>
  );
}

export function KittenCorner() {
  return (
    <div className="pointer-events-none absolute bottom-56 right-4 hidden sm:block md:right-10 lg:right-16">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden>
        <ellipse cx="50" cy="58" rx="28" ry="24" fill="#F4A87A" />
        <path d="M30 38 L26 22 L38 34 Z" fill="#F4A87A" />
        <path d="M70 38 L74 22 L62 34 Z" fill="#F4A87A" />
        <circle cx="40" cy="54" r="3" fill="#3D2A4A" />
        <circle cx="60" cy="54" r="3" fill="#3D2A4A" />
        <path d="M44 62 Q50 66 56 62" stroke="#C97A50" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M48 68 L50 72 L52 68" stroke="#E8926A" strokeWidth="1.5" fill="none" />
        <path d="M22 70 Q35 78 50 76 Q65 78 78 70" stroke="#E8926A" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  );
}
