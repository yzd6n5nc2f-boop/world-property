"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AuthRoute() {
  const { user, hydrate, signIn, signOut } = useAuthStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !name) return;
    await signIn(email, name);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-primary/30 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Authentication
          </CardTitle>
          <CardDescription>Sign in creates or updates your user profile in the backend database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm">
                <p className="font-semibold">Signed in as</p>
                <p>{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@example.com" />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}
          <Separator />
          <p className="text-xs text-muted-foreground">
            Session state is cached locally in <code>wp_auth_stub</code> while account data is stored in SQLite.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            What comes next
          </CardTitle>
          <CardDescription>Ready-to-replace seams for real auth providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Plug in Azure AD B2C, Auth0, or Supabase later.</p>
          <p>• Current implementation stores users in SQLite via <code>/api/auth/sign-in</code>.</p>
          <p>• The UI state already hydrates globally through the header.</p>
        </CardContent>
      </Card>
    </div>
  );
}
