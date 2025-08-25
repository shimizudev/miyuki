"use client";

import { SidebarNavigation } from "../base/nav";
import { ThemeProvider } from "./theme-provider";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "../ui/tooltip";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const pathName = usePathname().replace("/", "");

  const activeNav = pathName === "" ? "home" : pathName;
  const isInfoPage = pathName.includes("anime") || pathName.includes("manga");

  // TailwindCSS needs declaration of what to be rendered if conditional rendering
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _possibilities = [
    "flex-1 overflow-auto p-6 md:p-8",
    "flex-1 overflow-auto",
  ];

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen">
        {!isInfoPage && <SidebarNavigation activeNav={activeNav} />}
        <main
          className={`flex-1 overflow-auto ${!isInfoPage ? "p-6 md:p-8" : ""}`}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </main>
      </div>
    </ThemeProvider>
  );
};
