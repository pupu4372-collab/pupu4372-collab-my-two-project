import { ChannelShell } from "@/components/layout/ChannelShell";
import { PetShowNav } from "@/components/community/PetShowNav";
import { PetShowSectionTabs } from "@/components/community/PetShowSectionTabs";
import type { ComponentProps, ReactNode } from "react";

type ChannelShellProps = ComponentProps<typeof ChannelShell>;

interface PetShowShellProps extends ChannelShellProps {
  children: ReactNode;
}

export function PetShowShell({ children, ...shellProps }: PetShowShellProps) {
  return (
    <ChannelShell
      {...shellProps}
      hideBreadcrumbRow
      hideThemeLabel
      compactHero
      topBar={
        <div className="space-y-2">
          <PetShowSectionTabs />
          <PetShowNav />
        </div>
      }
    >
      {children}
    </ChannelShell>
  );
}
