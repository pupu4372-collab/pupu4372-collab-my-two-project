export function PastelDecor() {
  const stars = [
    { top: "8%", left: "12%", size: 14, delay: "0s" },
    { top: "14%", left: "78%", size: 18, delay: "0.8s" },
    { top: "22%", left: "45%", size: 12, delay: "1.2s" },
    { top: "32%", left: "8%", size: 10, delay: "0.4s" },
    { top: "18%", left: "62%", size: 16, delay: "1.6s" },
    { top: "28%", left: "88%", size: 11, delay: "2s" },
    { top: "38%", left: "72%", size: 13, delay: "0.6s" },
    { top: "12%", left: "32%", size: 9, delay: "1.4s" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <svg
          key={i}
          className="star-twinkle absolute text-gold"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L6 21l2.3-7-6-4.6h7.6L12 2z" />
        </svg>
      ))}

      <div
        className="absolute -left-20 top-24 h-64 w-64 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, #F8D4FF 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-16 top-16 h-72 w-72 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, #FFD4EC 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-48 left-1/3 h-48 w-48 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #D4F0FF 0%, transparent 70%)" }}
      />
    </div>
  );
}
