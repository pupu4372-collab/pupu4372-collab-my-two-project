import { HomeGateway } from "@/components/home/HomeGateway";
import { SplashGate } from "@/components/splash/SplashGate";

export default function HomePage() {
  return (
    <SplashGate>
      <HomeGateway />
    </SplashGate>
  );
}
