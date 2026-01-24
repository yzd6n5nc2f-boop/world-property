"use client";

import { useMemo, useState } from "react";
import { ArrowRight, FileCheck2, Globe2, Scale, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const journeySteps = [
  {
    title: "1. Define your buying brief",
    text: "Set your target cities, budget in your preferred currency, and the legal risk tolerance you’re comfortable with."
  },
  {
    title: "2. Compare buyer-ready listings",
    text: "Every card shows local pricing and a converted view so you can compare apples-to-apples before diving deeper."
  },
  {
    title: "3. Request the legal pack early",
    text: "We scaffold the key documents and checks so you can validate the deal before you fall in love with it."
  },
  {
    title: "4. Close with confidence",
    text: "Follow a guided timeline from offer to completion with country-specific checkpoints that reduce surprises."
  }
] as const;

const countryOptions = [
  "United Kingdom",
  "Portugal",
  "United Arab Emirates",
  "United States",
  "France",
  "Singapore"
] as const;

const checklists: Record<(typeof countryOptions)[number], string[]> = {
  "United Kingdom": [
    "Confirm proof of funds and appoint a solicitor",
    "Review title register, searches, and lease terms",
    "Align on exchange timelines and completion funds"
  ],
  Portugal: [
    "Secure a NIF and Portuguese bank account",
    "Review land registry certificate and habitation licence",
    "Validate condominium rules and outstanding debts"
  ],
  "United Arab Emirates": [
    "Confirm freehold zone eligibility",
    "Review developer escrow and service charges",
    "Plan trustee office transfer and registration fees"
  ],
  "United States": [
    "Understand state-specific escrow and closing norms",
    "Review title insurance commitment and disclosures",
    "Verify wiring instructions and identity requirements"
  ],
  France: [
    "Engage a notaire and review the compromis de vente",
    "Check diagnostics techniques and planning rules",
    "Plan for cooling-off periods and transfer taxes"
  ],
  Singapore: [
    "Confirm eligibility and any additional buyer stamp duties",
    "Review title, tenure, and MCST obligations",
    "Align on completion statement and funds timeline"
  ]
};

export default function LegalRoute() {
  const [country, setCountry] = useState<(typeof countryOptions)[number]>("United Kingdom");

  const activeChecklist = useMemo(() => checklists[country], [country]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Buy Journey</p>
        <h1 className="text-3xl font-semibold tracking-tight">A clearer path to buying abroad</h1>
        <p className="max-w-3xl text-muted-foreground">
          World Property differentiates by making the legal workflow visible. We don’t just show listings — we guide buyers through the documents, decisions, and checkpoints that protect the purchase.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="gap-2">
            <a href="/search">
              Search properties
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href="/host">
              List a property
              <Globe2 className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Human agent route
            </CardTitle>
            <CardDescription>Traditional appointments and local expertise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Schedule viewings, negotiate offer terms, and coordinate with a dedicated agent.</p>
            <p>• Best for buyers who want hands-on local guidance and in-person walkthroughs.</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI fast-track route
            </CardTitle>
            <CardDescription>Workflow-led coordination for speed and clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• AI coordinator gathers objectives, requests documents, and keeps you on a unified checklist.</p>
            <p>• Best for investors who want structured progress without waiting on back-and-forth.</p>
            <p className="text-xs text-muted-foreground">
              AI assists coordination only; solicitors and partners review and approve before completion.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {journeySteps.map((step) => (
          <Card key={step.title} className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{step.text}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Country-specific checklist (mock)
            </CardTitle>
            <CardDescription>Select a country to preview the buyer guidance scaffold.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs space-y-2">
              <p className="text-sm font-medium">Country selector</p>
              <Select value={country} onValueChange={(value) => setCountry(value as (typeof countryOptions)[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">What buyers need to confirm</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {activeChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              This is intentionally scaffolded. The product value is making these steps explicit, then deepening them with real legal partners and documents.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                What makes this product different
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Legal steps are part of the primary UX, not hidden in a help centre.</p>
              <p>• Currency clarity reduces hesitation when buying across borders.</p>
              <p>• Listings are framed around readiness: documents, steps, and buyer confidence.</p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Next scaffolds to add</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Document request workflows per country.</p>
              <p>• Fee estimators connected to real calculators.</p>
              <p>• Legal partner marketplace and verified packs.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
