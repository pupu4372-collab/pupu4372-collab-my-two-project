import { NotFoundView } from "@/components/errors/NotFoundView";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function LocaleNotFoundPage() {
  return (
    <div className="min-h-screen bg-dream-sky">
      <AppTopNav />
      <NotFoundView />
      <MobileBottomNav />
    </div>
  );
}
