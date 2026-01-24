"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";
import { Globe2, Heart, Menu, Scale, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores/auth-store";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { supportedCurrencies } from "@/lib/fx/mock-rates";
import { cn } from "@/lib/utils/cn";

const navLinks: Array<{ href: Route; label: string }> = [
  { href: "/search", label: "Search" },
  { href: "/legal", label: "Buy Journey" },
  { href: "/host", label: "List Property" },
  { href: "/saved", label: "Saved" }
];

function CurrencySelector({ className }: { className?: string }) {
  const { displayCurrency, hydrate, setDisplayCurrency } = usePreferencesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className={cn("min-w-[128px]", className)}>
      <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {supportedCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NavItems({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <nav className={cn("flex items-center gap-1.5", className)}>
      {navLinks.map((link) => (
        <Button key={link.href} asChild variant="ghost" size="sm" className="px-3 text-sm" onClick={onNavigate}>
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const { user, hydrate, signOut } = useAuthStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="container flex h-[76px] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Globe2 className="h-5 w-5 text-primary" />
          </span>
          <span className="flex flex-col leading-tight">
            <span>World Property</span>
            <span className="text-xs font-medium text-muted-foreground">Investor-grade buying</span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <NavItems />
          <Separator orientation="vertical" className="mx-1.5 h-6" />
          <CurrencySelector className="mr-1" />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="px-4">
              <Link href="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" />
                  World Property
                </SheetTitle>
                <SheetDescription>Buy property anywhere with legal clarity.</SheetDescription>
              </SheetHeader>
              <CurrencySelector />
              <NavItems className="flex-col items-start" onNavigate={() => undefined} />
              <Separator />
              <div className="flex flex-col gap-2">
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <Link href="/saved">
                    <Heart className="h-4 w-4" />
                    Saved
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <Link href="/legal">
                    <Scale className="h-4 w-4" />
                    Buy journey
                  </Link>
                </Button>
                {user ? (
                  <Button variant="outline" className="justify-start gap-2" onClick={() => void signOut()}>
                    <UserCircle2 className="h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button asChild className="justify-start gap-2">
                    <Link href="/auth">
                      <UserCircle2 className="h-4 w-4" />
                      Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
