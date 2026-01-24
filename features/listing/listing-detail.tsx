"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  FileCheck2,
  Heart,
  MessageSquare,
  MapPin,
  Scale,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type { Listing } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getListingById } from "@/lib/api/listings";
import { convert, mockFxRates } from "@/lib/fx/mock-rates";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { usePurchaseFlowStore } from "@/lib/stores/purchase-flow-store";
import { useSavedStore } from "@/lib/stores/saved-store";
import { formatArea, formatDualPrice, formatNumber } from "@/lib/utils/format";
import type { OfferStub } from "@/src/domain/offer/offer.types";
import { recordAuditEventStub } from "@/src/services/audit/audit.service";
import { legalAiClientStub } from "@/src/services/legal-ai/legalAi.client";
import { LEGAL_WORKFLOW_STEPS } from "@/src/workflows/legal/legalWorkflow.steps";
import type { LegalWorkflowEventStub } from "@/src/workflows/legal/legalWorkflow.events";
import { transitionLegalWorkflowStub } from "@/src/workflows/legal/legalWorkflow.machine";

type ListingDetailProps = {
  id: string;
};

type LegalStep = {
  title: string;
  detail: string;
};

const legalTimeline: LegalStep[] = [
  { title: "Offer", detail: "Align on price, conditions, and timelines." },
  { title: "Due diligence", detail: "Verify title, zoning, and key documents." },
  { title: "Contracts", detail: "Review the draft contract and legal pack." },
  { title: "Completion", detail: "Sign, transfer funds, and register ownership." }
];

const countryChecklists: Record<string, string[]> = {
  "United Kingdom": [
    "Confirm proof of funds and mortgage readiness",
    "Instruct a solicitor and request the draft contract",
    "Review searches: title, local authority, environmental"
  ],
  Portugal: [
    "Apply for a fiscal number (NIF)",
    "Request the land registry certificate (Certidão Permanente)",
    "Check licensing and habitation certificate"
  ],
  "United Arab Emirates": [
    "Confirm freehold eligibility in the target area",
    "Review developer escrow and completion status",
    "Plan for transfer fees and trustee office steps"
  ],
  "United States": [
    "Clarify state-specific closing process and escrow",
    "Review title insurance commitment",
    "Prepare wiring instructions and identity verification"
  ]
};

function checklistForCountry(country: string) {
  return (
    countryChecklists[country] ?? [
      "Verify who can buy and any foreign ownership limits",
      "Request the title report, zoning confirmation, and recent tax receipts",
      "Confirm closing costs, transfer taxes, and registration steps"
    ]
  );
}

function legalFeeEstimate(price: number) {
  const diligence = price * 0.012;
  const legal = price * 0.009;
  const taxes = price * 0.018;
  return {
    diligence,
    legal,
    taxes,
    total: diligence + legal + taxes
  };
}

export function ListingDetail({ id }: ListingDetailProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [consultationSummary, setConsultationSummary] = useState<string | null>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  const { savedListingIds, hydrate: hydrateSaved, toggleListing } = useSavedStore();
  const { displayCurrency, showLocalCurrency, hydrate: hydratePreferences } = usePreferencesStore();
  const {
    selectedSupportMode,
    setSupportMode,
    workflowStage,
    setWorkflowStage,
    checklist: workflowChecklist,
    setChecklist,
    messages,
    addMessage,
    drawerOpen,
    setDrawerOpen,
    activeOffer,
    setActiveOffer,
    hydrate: hydratePurchaseFlow,
    resetFlow
  } = usePurchaseFlowStore();

  useEffect(() => {
    void hydrateSaved();
    hydratePreferences();
    hydratePurchaseFlow();
  }, [hydratePreferences, hydratePurchaseFlow, hydrateSaved]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getListingById(id).then((result) => {
      if (!active) return;
      setListing(result ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const isSaved = listing ? savedListingIds.includes(listing.id) : false;

  const convertedValue = listing
    ? convert(listing.price.salePrice, listing.currency, displayCurrency, mockFxRates)
    : undefined;

  const dualPrice = listing
    ? formatDualPrice(listing.price.salePrice, listing.currency, displayCurrency, convertedValue, showLocalCurrency)
    : null;

  const feeEstimate = listing ? legalFeeEstimate(listing.price.salePrice) : null;

  const checklist = useMemo(() => (listing ? checklistForCountry(listing.country) : []), [listing]);

  const supportModes = [
    {
      id: "human",
      label: "Human agent",
      description: "Schedule viewings and negotiate with a dedicated agent."
    },
    {
      id: "ai",
      label: "AI agent (fast-track)",
      description: "AI coordinator accelerates documents and legal steps."
    }
  ] as const;

  const stepsIndex = LEGAL_WORKFLOW_STEPS.findIndex((step) => step.stage === workflowStage);

  const createOffer = (): OfferStub | null => {
    if (!listing) return null;
    const offer: OfferStub = {
      id: `offer-${listing.id}-${Date.now()}`,
      propertyId: listing.id,
      amountMinor: Math.round(listing.price.salePrice * 100),
      currencyCode: listing.currency,
      status: "created"
    };
    const caseId = `case-${listing.id}-${Date.now()}`;
    setActiveOffer(offer, caseId);
    setWorkflowStage("OfferCreated");
    setChecklist(checklist);
    addMessage({
      id: `message-${Date.now()}`,
      author: "system",
      content: "Offer created. Legal workflow scaffold initialized.",
      createdAt: new Date().toISOString()
    });
    void recordAuditEventStub({
      id: `audit-${Date.now()}`,
      type: "offer.created",
      occurredAtIso: new Date().toISOString(),
      metadata: { listingId: listing.id, offerId: offer.id }
    });
    return offer;
  };

  const advanceWorkflow = (targetStage: LegalWorkflowEventStub["targetStage"]) => {
    const nextState = transitionLegalWorkflowStub(
      { caseId: activeOffer?.id ?? "case", stage: workflowStage },
      {
        type: targetStage,
        caseId: activeOffer?.id ?? "case",
        targetStage
      }
    );
    setWorkflowStage(nextState.stage);
    void recordAuditEventStub({
      id: `audit-${Date.now()}`,
      type: "legal.workflow.transition",
      occurredAtIso: new Date().toISOString(),
      metadata: { stage: nextState.stage }
    });
  };

  const handleOfferSubmit = () => {
    createOffer();
  };

  const startAiWorkflow = async () => {
    if (!listing) return;
    const offer = activeOffer ?? createOffer();
    setDrawerOpen(true);
    setWorkflowLoading(true);
    advanceWorkflow("AIConsultation");
    const response = await legalAiClientStub.consult({
      caseId: offer?.id ?? `case-${listing.id}`,
      stage: "AIConsultation",
      countryCode: listing.country,
      contextSummary: `${listing.title} in ${listing.city}`
    });
    setConsultationSummary(response.readinessSummary);
    setClarifyingQuestions(response.clarifyingQuestions);
    addMessage({
      id: `message-${Date.now()}`,
      author: "ai",
      content: response.readinessSummary,
      createdAt: new Date().toISOString()
    });
    setWorkflowLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      </div>
    );
  }

  if (!listing || !dualPrice || !feeEstimate) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-semibold">Listing not found</h1>
        <p className="text-muted-foreground">The listing may have moved or is no longer available locally.</p>
        <Button asChild>
          <Link href="/search">Back to search</Link>
        </Button>
      </div>
    );
  }

  const timelineIndex = 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">BUY</Badge>
          <Badge variant="secondary">{listing.propertyType}</Badge>
          <Badge variant="outline">{listing.hostType}</Badge>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{listing.title}</h1>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.address}, {listing.city}, {listing.country}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-semibold text-primary">{dualPrice.local}</p>
              {dualPrice.converted && <p className="text-xs text-muted-foreground">{dualPrice.converted}</p>}
            </div>
            <Button variant={isSaved ? "default" : "outline"} className="gap-2" onClick={() => void toggleListing(listing.id)}>
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save listing"}
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {listing.images.map((image, index) => (
          <div
            key={image}
            className={`overflow-hidden rounded-2xl border border-border/60 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          >
            <img src={image} alt={`${listing.title} photo ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Everything you need to know at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <BedDouble className="h-4 w-4 text-primary" />
                  {listing.beds} beds
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bath className="h-4 w-4 text-primary" />
                  {listing.baths} baths
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {formatArea(listing.areaSqm)}
                </div>
              </div>
              <Separator />
              <p className="text-muted-foreground">{listing.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="rounded-lg px-3 py-1">
                  {amenity}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Legal readiness
              </CardTitle>
              <CardDescription>
                A guided buyer journey tailored to {listing.country}. This differentiator keeps legal clarity front and centre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {legalTimeline.map((step, index) => {
                  const active = index === timelineIndex;
                  const complete = index < timelineIndex;
                  return (
                    <div key={step.title} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                            complete ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border"
                          }`}
                        >
                          {complete ? "✓" : index + 1}
                        </div>
                        {index < legalTimeline.length - 1 && <div className="mt-1 h-full w-px bg-border" aria-hidden />}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">Country checklist</p>
                <p className="text-xs text-muted-foreground">Mocked guidance based on {listing.country}.</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/30 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Make an offer
              </CardTitle>
              <CardDescription>Move from interest to intent with structured support options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Submit offer</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit offer</DialogTitle>
                    <DialogDescription>
                      Offers are mocked. Submit to create a legal workflow case and unlock AI legal coordination.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                    Suggested opening offer: align on price, included fixtures, and timing for the legal pack.
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Close</Button>
                    <Button onClick={handleOfferSubmit}>Submit offer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Choose support</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {supportModes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSupportMode(mode.id)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        selectedSupportMode === mode.id ? "border-primary/50 bg-primary/5 text-foreground" : "border-border/70 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-foreground">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedSupportMode === "human" ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <FileCheck2 className="h-4 w-4" />
                    Schedule viewing
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message agent
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Message the listing agent</DialogTitle>
                        <DialogDescription>Send a quick note to coordinate viewings or ask questions.</DialogDescription>
                      </DialogHeader>
                      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                        Messaging is mocked for now. We’ll route this to a local agent marketplace later.
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Close</Button>
                        <Button>Send message</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full gap-2" onClick={() => void startAiWorkflow()} disabled={workflowLoading}>
                    <Sparkles className="h-4 w-4" />
                    {workflowLoading ? "Launching AI workflow…" : "Start AI Purchase Workflow"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    AI coordinator clarifies objectives, requests documents, and tracks the legal timeline.
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">Next: align on offer terms, then request the legal pack early.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Estimated buyer costs (mock)
              </CardTitle>
              <CardDescription>Indicative ranges for planning purposes only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Due diligence</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.diligence, listing.currency, displayCurrency, convert(feeEstimate.diligence, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Legal fees</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.legal, listing.currency, displayCurrency, convert(feeEstimate.legal, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Taxes & registration</span>
                <span className="font-semibold">{formatDualPrice(feeEstimate.taxes, listing.currency, displayCurrency, convert(feeEstimate.taxes, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between font-semibold">
                <span>Total estimate</span>
                <span className="text-primary">{formatDualPrice(feeEstimate.total, listing.currency, displayCurrency, convert(feeEstimate.total, listing.currency, displayCurrency, mockFxRates), showLocalCurrency).local}</span>
              </div>
              <p className="text-xs text-muted-foreground">These placeholders reinforce the legal journey concept; connect real fee engines later.</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="space-y-1 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Listing ID</p>
              <p>{listing.id}</p>
              <p>Published {format(new Date(listing.createdAt), "dd MMM yyyy")}</p>
              <p>{formatNumber(Math.round(Math.abs(listing.lat * listing.lng)))} buyer views this month (mock)</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="flex flex-col gap-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>AI Purchase Workflow</SheetTitle>
            <SheetDescription>Offer → AI Consult → Legal Pack → Due Diligence → Contracts → Completion</SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Workflow progress</p>
              <div className="mt-3 space-y-3">
                {LEGAL_WORKFLOW_STEPS.map((step, index) => {
                  const complete = index < stepsIndex;
                  const active = index === stepsIndex;
                  return (
                    <div key={step.stage} className="flex items-start gap-3 text-sm">
                      <div
                        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                          complete ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border"
                        }`}
                      >
                        {complete ? "✓" : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{step.stage}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">AI Legal Solicitor</CardTitle>
                <CardDescription>Mocked coordination with human oversight.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Document requests</p>
                  <ul className="space-y-1">
                    <li>• Proof of funds (recent statement or bank letter)</li>
                    <li>• Buyer identity verification</li>
                    <li>• Draft contract and title documents</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Key legal risks (mock)</p>
                  <ul className="space-y-1">
                    <li>• Confirm ownership rights for foreign buyers.</li>
                    <li>• Review any zoning or leasehold limitations.</li>
                    <li>• Validate title history and outstanding liens.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Country checklist</p>
                  <ul className="space-y-1">
                    {workflowChecklist.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">AI summary</p>
                  <p>{consultationSummary ?? "Run the AI consultation to populate a readiness summary."}</p>
                </div>
                {clarifyingQuestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Clarifying questions</p>
                    <ul className="space-y-1">
                      {clarifyingQuestions.map((question) => (
                        <li key={question}>• {question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => advanceWorkflow("LegalPackRequested")}>
                Request legal pack
              </Button>
              <Button variant="outline" onClick={() => addMessage({ id: `message-${Date.now()}`, author: "buyer", content: "Proof of funds uploaded (mock).", createdAt: new Date().toISOString() })}>
                Upload proof of funds
              </Button>
              <Button variant="outline" onClick={() => addMessage({ id: `message-${Date.now()}`, author: "ai", content: "Buyer summary generated with objectives, timeline, and financing overview.", createdAt: new Date().toISOString() })}>
                Generate buyer summary
              </Button>
              <Button variant="secondary" onClick={resetFlow}>
                Reset workflow
              </Button>
            </div>

            {messages.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                <p className="text-sm font-semibold text-foreground">Workflow log</p>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {messages.map((message) => (
                    <li key={message.id}>
                      <span className="font-semibold text-foreground">{message.author.toUpperCase()}</span> — {message.content}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  );
}
