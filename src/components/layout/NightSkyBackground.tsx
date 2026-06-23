import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";

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
  ["4%", "44%", "1px", "0.3s"],
  ["11%", "56%", "1px", "1.8s"],
  ["16%", "9%", "1px", "2.4s"],
  ["21%", "38%", "2px", "0.7s"],
  ["29%", "61%", "1px", "1.3s"],
  ["32%", "15%", "1px", "2.9s"],
  ["37%", "31%", "2px", "0.1s"],
  ["45%", "67%", "1px", "1.6s"],
  ["48%", "42%", "1px", "2.5s"],
  ["57%", "29%", "2px", "0.6s"],
  ["63%", "7%", "1px", "1.9s"],
  ["66%", "46%", "1px", "2.8s"],
  ["73%", "53%", "2px", "0.4s"],
  ["76%", "10%", "1px", "1.2s"],
  ["84%", "61%", "1px", "2.1s"],
  ["88%", "27%", "2px", "0.9s"],
  ["96%", "49%", "1px", "1.5s"],
  ["6%", "70%", "2px", "2.6s"],
  ["14%", "91%", "1px", "0.8s"],
  ["18%", "50%", "1px", "1.7s"],
  ["25%", "6%", "2px", "0.2s"],
  ["31%", "79%", "1px", "2.2s"],
  ["36%", "96%", "1px", "1.1s"],
  ["42%", "6%", "1px", "2.7s"],
  ["50%", "92%", "2px", "0.5s"],
  ["59%", "39%", "1px", "1.4s"],
  ["64%", "92%", "1px", "2.4s"],
  ["72%", "78%", "1px", "0.6s"],
  ["81%", "91%", "2px", "1.8s"],
  ["86%", "8%", "1px", "0.1s"],
  ["90%", "55%", "1px", "2.9s"],
  ["97%", "88%", "2px", "0.7s"],
  ["3%", "24%", "1px", "1.6s"],
  ["27%", "93%", "2px", "2.3s"],
  ["53%", "55%", "1px", "0.9s"],
  ["74%", "39%", "1px", "2.0s"],
] as const;

export function NightSkyBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#121a5c]">
      <div className="pointer-events-none fixed inset-0 z-0">
        {stars.map(([left, top, size, delay]) => (
          <span
            key={`${left}-${top}`}
            className="star-twinkle absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"
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
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,215,255,0.16),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(115,145,255,0.18),transparent_26%)]" />
      <div className="relative z-10 min-h-screen">
        {children}
        <AppFooter />
      </div>
    </div>
  );
}
