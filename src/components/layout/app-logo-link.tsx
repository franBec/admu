import Link from "next/link";
import Image from "next/image";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface AppLogoLinkProps {
  title?: string;
  logoSrc?: string;
  className?: string;
}

export function AppLogoLink({
  title = "Admu",
  logoSrc,
  className,
}: AppLogoLinkProps) {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center h-full",
        "text-xl font-semibold text-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        isCollapsed ? "justify-center px-0" : "px-4 py-2 gap-3",
        className
      )}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={title}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <Home className="h-8 w-8 text-primary" />
      )}
      {title && !isCollapsed && (
        <span className="text-xl font-bold whitespace-nowrap">{title}</span>
      )}
    </Link>
  );
}
