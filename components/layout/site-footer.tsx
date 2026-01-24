import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container flex flex-col gap-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} World Property. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/about">About</Link>
          <Link href="/legal">Buy Journey</Link>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
            Map data © OpenStreetMap contributors
          </a>
        </div>
      </div>
    </footer>
  );
}
