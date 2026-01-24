"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Home, Landmark, MapPinned, Sparkles, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Listing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PinMap } from "@/components/map/pin-map";
import { createListing } from "@/lib/api/listings";
import { hostListingSchema, type HostListingFormValues } from "@/lib/schemas/host";
import { propertyTypeSchema } from "@/lib/schemas/listing";
import { formatCurrency } from "@/lib/utils/format";

const propertyTypes = propertyTypeSchema.options;

const steps = [
  { id: 0, title: "Mode", icon: Landmark },
  { id: 1, title: "Location", icon: MapPinned },
  { id: 2, title: "Details", icon: Home },
  { id: 3, title: "Pricing", icon: Sparkles },
  { id: 4, title: "Photos", icon: UploadCloud },
  { id: 5, title: "Publish", icon: CheckCircle2 }
] as const;

const defaultValues: HostListingFormValues = {
  mode: "buy",
  hostType: "agent",
  title: "",
  description: "",
  country: "",
  city: "",
  address: "",
  lat: 51.5072,
  lng: -0.1276,
  beds: 2,
  baths: 1,
  areaSqm: 80,
  propertyType: "apartment",
  salePrice: undefined,
  rentPerMonth: undefined,
  nightRate: undefined,
  currency: "GBP",
  amenities: ["Wi-Fi"],
  images: ["https://picsum.photos/seed/new-listing-0/1200/800"]
};

function buildListing(values: HostListingFormValues): Listing {
  const price =
    values.mode === "buy"
      ? { salePrice: values.salePrice }
      : values.mode === "rent"
        ? { rentPerMonth: values.rentPerMonth }
        : { nightRate: values.nightRate };

  const slugSource = `${values.city}-${values.mode}-${values.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: `${slugSource}-${Date.now()}`,
    mode: values.mode,
    title: values.title,
    description: values.description,
    country: values.country,
    city: values.city,
    address: values.address,
    lat: values.lat,
    lng: values.lng,
    price,
    currency: values.currency,
    beds: values.beds,
    baths: values.baths,
    areaSqm: values.areaSqm,
    propertyType: values.propertyType,
    images: values.images,
    amenities: values.amenities,
    hostType: values.hostType,
    createdAt: new Date().toISOString()
  };
}

export function CreateListingWizard() {
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState<Listing | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<HostListingFormValues>({
    resolver: zodResolver(hostListingSchema),
    defaultValues,
    mode: "onBlur"
  });

  const values = form.watch();
  const modeLabel = values.mode === "stay" ? "Stay" : values.mode === "rent" ? "Rent" : "Buy";

  const pricePreview = useMemo(() => {
    if (values.mode === "buy" && values.salePrice) return formatCurrency(values.salePrice, values.currency);
    if (values.mode === "rent" && values.rentPerMonth) return `${formatCurrency(values.rentPerMonth, values.currency)} / month`;
    if (values.mode === "stay" && values.nightRate) return `${formatCurrency(values.nightRate, values.currency)} / night`;
    return "Add pricing";
  }, [values.currency, values.mode, values.nightRate, values.rentPerMonth, values.salePrice]);

  const goNext = async () => {
    const fieldsByStep: Record<number, Array<keyof HostListingFormValues>> = {
      0: ["mode", "hostType", "title", "description"],
      1: ["country", "city", "address", "lat", "lng"],
      2: ["beds", "baths", "areaSqm", "propertyType", "amenities"],
      3: ["currency", "salePrice", "rentPerMonth", "nightRate"],
      4: ["images"],
      5: []
    };

    const valid = await form.trigger(fieldsByStep[step], { shouldFocus: true });
    if (!valid) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const onPublish = form.handleSubmit(async (data) => {
    setSubmitting(true);
    const listing = buildListing(data);
    await createListing(listing);
    setPublished(listing);
    setSubmitting(false);
    setStep(steps.length - 1);
  });

  if (published) {
    return (
      <Card className="border-primary/30 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Listing published
          </CardTitle>
          <CardDescription>Your listing is now available in search results on this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">{modeLabel} listing</p>
            <p className="text-lg font-semibold">{published.title}</p>
            <p className="text-sm text-muted-foreground">
              {published.city}, {published.country}
            </p>
            <p className="mt-2 text-base font-semibold text-primary">{pricePreview}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={`/listing/${published.id}`}>View listing</a>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPublished(null);
                form.reset(defaultValues);
                setStep(0);
              }}
            >
              Create another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Listing builder</CardTitle>
          <CardDescription>Complete each step to publish locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((item) => {
            const Icon = item.icon;
            const active = item.id === step;
            const complete = item.id < step;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  active ? "border-primary/60 bg-primary/5" : "border-border/60 hover:border-primary/40"
                } ${complete ? "text-primary" : "text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.title}</span>
                {complete && <CheckCircle2 className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={onPublish}>
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your mode</CardTitle>
              <CardDescription>Decide whether this is a buy, rent, or stay listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                {["buy", "rent", "stay"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => form.setValue("mode", mode as HostListingFormValues["mode"], { shouldValidate: true })}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      values.mode === mode ? "border-primary/60 bg-primary/5 shadow-sm" : "border-border/70 hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold capitalize">{mode}</p>
                    <p className="text-xs text-muted-foreground">{mode === "stay" ? "Short stay" : "Longer term"}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host-type">Host type</Label>
                  <Select value={values.hostType} onValueChange={(value) => form.setValue("hostType", value as HostListingFormValues["hostType"], { shouldValidate: true })}>
                    <SelectTrigger id="host-type">
                      <SelectValue placeholder="Select host type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-destructive">{form.formState.errors.hostType?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    maxLength={3}
                    value={values.currency}
                    onChange={(event) => form.setValue("currency", event.target.value.toUpperCase(), { shouldValidate: true })}
                  />
                  <p className="text-xs text-destructive">{form.formState.errors.currency?.message}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Modern loft near the river" {...form.register("title")} />
                <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Share the highlights, vibe, and nearby gems." {...form.register("description")} />
                <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pin the location</CardTitle>
              <CardDescription>Click the map or drag the marker to adjust the pin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Portugal" {...form.register("country")} />
                  <p className="text-xs text-destructive">{form.formState.errors.country?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Lisbon" {...form.register("city")} />
                  <p className="text-xs text-destructive">{form.formState.errors.city?.message}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="12 Riverfront Avenue" {...form.register("address")} />
                <p className="text-xs text-destructive">{form.formState.errors.address?.message}</p>
              </div>
              <PinMap
                lat={values.lat}
                lng={values.lng}
                onChange={({ lat, lng }) => {
                  form.setValue("lat", lat, { shouldValidate: true });
                  form.setValue("lng", lng, { shouldValidate: true });
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" inputMode="decimal" value={values.lat} onChange={(event) => form.setValue("lat", Number(event.target.value), { shouldValidate: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" inputMode="decimal" value={values.lng} onChange={(event) => form.setValue("lng", Number(event.target.value), { shouldValidate: true })} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Property details</CardTitle>
              <CardDescription>Capture the essentials guests and buyers care about.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="beds">Beds</Label>
                <Input id="beds" type="number" min={0} {...form.register("beds", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.beds?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">Baths</Label>
                <Input id="baths" type="number" min={0} {...form.register("baths", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.baths?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (sqm)</Label>
                <Input id="area" type="number" min={10} {...form.register("areaSqm", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.areaSqm?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property type</Label>
                <Select value={values.propertyType} onValueChange={(value) => form.setValue("propertyType", value as HostListingFormValues["propertyType"], { shouldValidate: true })}>
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-destructive">{form.formState.errors.propertyType?.message}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="amenities">Amenities (comma separated)</Label>
                <Input
                  id="amenities"
                  value={values.amenities.join(", ")}
                  onChange={(event) =>
                    form.setValue(
                      "amenities",
                      event.target.value
                        .split(",")
                        .map((entry) => entry.trim())
                        .filter(Boolean),
                      { shouldValidate: true }
                    )
                  }
                />
                <p className="text-xs text-destructive">{form.formState.errors.amenities?.message as string | undefined}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set the headline price for this listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {values.mode === "buy" && (
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale price</Label>
                  <Input id="salePrice" type="number" min={50000} {...form.register("salePrice", { valueAsNumber: true })} />
                  <p className="text-xs text-destructive">{form.formState.errors.salePrice?.message}</p>
                </div>
              )}
              {values.mode === "rent" && (
                <div className="space-y-2">
                  <Label htmlFor="rentPerMonth">Monthly rent</Label>
                  <Input id="rentPerMonth" type="number" min={400} {...form.register("rentPerMonth", { valueAsNumber: true })} />
                  <p className="text-xs text-destructive">{form.formState.errors.rentPerMonth?.message}</p>
                </div>
              )}
              {values.mode === "stay" && (
                <div className="space-y-2">
                  <Label htmlFor="nightRate">Nightly rate</Label>
                  <Input id="nightRate" type="number" min={40} {...form.register("nightRate", { valueAsNumber: true })} />
                  <p className="text-xs text-destructive">{form.formState.errors.nightRate?.message}</p>
                </div>
              )}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="text-muted-foreground">Price preview</p>
                <p className="text-lg font-semibold text-primary">{pricePreview}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Provide image URLs for your listing gallery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {values.images.map((image, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`image-${index}`}>Photo {index + 1}</Label>
                  <Input
                    id={`image-${index}`}
                    value={image}
                    onChange={(event) => {
                      const next = [...values.images];
                      next[index] = event.target.value;
                      form.setValue("images", next, { shouldValidate: true });
                    }}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => form.setValue("images", [...values.images, ""], { shouldValidate: true })}>
                  Add photo
                </Button>
                {values.images.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => form.setValue("images", values.images.slice(0, -1), { shouldValidate: true })}
                  >
                    Remove last
                  </Button>
                )}
              </div>
              <p className="text-xs text-destructive">{form.formState.errors.images?.message as string | undefined}</p>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle>Ready to publish</CardTitle>
              <CardDescription>Confirm the summary below, then publish.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="text-muted-foreground">{modeLabel} listing</p>
                <p className="text-lg font-semibold">{values.title || "Untitled listing"}</p>
                <p className="text-muted-foreground">
                  {values.city || "City"}, {values.country || "Country"}
                </p>
                <p className="mt-2 text-base font-semibold text-primary">{pricePreview}</p>
                <p className="mt-1 text-muted-foreground">
                  {values.beds} beds · {values.baths} baths · {values.areaSqm} sqm
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Publishing stores the listing locally via the <code>wp_listings_user</code> key. This is a mock workflow for the MVP.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext} disabled={submitting}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish listing"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
