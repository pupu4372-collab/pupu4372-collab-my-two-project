import { ChannelShell } from "@/components/layout/ChannelShell";
import { PetShowNav } from "@/components/community/PetShowNav";
import type { ComponentProps, ReactNode } from "react";

type ChannelShellProps = ComponentProps<typeof ChannelShell>;

interface PetShowShellProps extends ChannelShellProps {
  children: ReactNode;
}

export function PetShowShell({ children, ...shellProps }: PetShowShellProps) {
  return (
    <ChannelShell {...shellProps} topBar={<PetShowNav />}>
      {children}
    </ChannelShell>
  );
}
