import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/layout/nav-user";

export function Header() {
  const currentUser = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    avatar: "https://github.com/shadcn.png", // Replace with a real avatar URL or handle if null
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
      <div className="ml-auto">
        <NavUser user={currentUser} />
      </div>
    </header>
  );
}
