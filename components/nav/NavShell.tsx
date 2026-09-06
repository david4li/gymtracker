import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { BottomNav } from "./BottomNav";

export function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
