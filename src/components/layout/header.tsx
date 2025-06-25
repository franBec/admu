import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/layout/nav-user";
import { ModeToggle } from "@/components/dark-mode/mode-toogle";

export function Header() {
  const currentUser = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        <NavUser user={currentUser} />
      </div>
    </header>
  );
}
