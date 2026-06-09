import { HomeGateway } from "@/components/home/HomeGateway";

const stars = [
  ["7%", "13%", "1px", "0s"],
  ["13%", "29%", "2px", "1.2s"],
  ["19%", "66%", "1px", "2.1s"],
  ["27%", "18%", "2px", "0.5s"],
  ["34%", "47%", "1px", "1.7s"],
  ["43%", "24%", "2px", "2.8s"],
  ["52%", "11%", "2px", "0.9s"],
  ["61%", "58%", "1px", "1.5s"],
  ["70%", "21%", "2px", "2.3s"],
  ["82%", "35%", "1px", "0.4s"],
  ["91%", "16%", "2px", "1.9s"],
  ["9%", "82%", "1px", "2.6s"],
  ["24%", "76%", "2px", "0.8s"],
  ["39%", "88%", "1px", "1.4s"],
  ["55%", "73%", "2px", "2.2s"],
  ["68%", "84%", "1px", "0.2s"],
  ["79%", "68%", "2px", "1.1s"],
  ["93%", "79%", "1px", "2.7s"],
] as const;

export default function HomePreviewPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_16%,rgba(181,116,255,0.28),transparent_30%),linear-gradient(180deg,#1d1524_0%,#3b1d50_38%,#7a4592_100%)]">
      <div className="pointer-events-none fixed inset-0 z-0">
        {stars.map(([left, top, size, delay]) => (
          <span
            key={`${left}-${top}`}
            className="star-twinkle absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{
              left,
              top,
              width: size,
              height: size,
              animationDelay: delay,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,215,255,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(225,245,240,0.1),transparent_22%)]" />
      <div className="relative z-10">
        <HomeGateway previewTheme="night" />
      </div>
    </div>
  );
}
