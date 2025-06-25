import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer
      className="
      w-full py-6
      flex flex-col items-center justify-center text-center
      md:flex-row
      text-xs text-muted-foreground
      border-t border-border/50
      gap-y-2 md:gap-x-4 {/* Spacing between items */}
      px-4 {/* Add some horizontal padding for smaller screens if content gets too wide */}
    "
    >
      <p className="shrink-0">
        {" "}
        City Block icon by{" "}
        <a
          href="https://icons8.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Icons8
        </a>
      </p>
      <Separator
        orientation="vertical"
        className="h-4 hidden md:block shrink-0"
      />
      <p className="shrink-0">
        {" "}
        Made by{" "}
        <a
          href="https://pollito.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          Pollito
        </a>{" "}
        with Next.js and ❤️
      </p>
    </footer>
  );
}
