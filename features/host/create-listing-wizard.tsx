"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, Home, MapPinned, Sparkles, UploadCloud } from "lucide-react";
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
import { imageAiClientStub } from "@/src/services/image-ai/imageAi.client";

const propertyTypes = propertyTypeSchema.options;

const steps = [
  { id: 0, title: "Basics", icon: Home },
  { id: 1, title: "Location", icon: MapPinned },
  { id: 2, title: "Details", icon: Home },
  { id: 3, title: "Pricing", icon: Sparkles },
  { id: 4, title: "Photos", icon: UploadCloud },
  { id: 5, title: "Publish", icon: CheckCircle2 }
] as const;

const defaultValues: HostListingFormValues = {
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
  salePrice: 350000,
  currency: "GBP",
  amenities: ["Wi-Fi"],
  images: ["https://picsum.photos/seed/new-listing-0/1200/800"]
};

function buildListing(values: HostListingFormValues): Listing {
  const slugSource = `${values.city}-${values.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: `${slugSource}-${Date.now()}`,
    title: values.title,
    description: values.description,
    country: values.country,
    city: values.city,
    address: values.address,
    lat: values.lat,
    lng: values.lng,
    price: { salePrice: values.salePrice },
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
  const [photoGallery, setPhotoGallery] = useState(
    defaultValues.images.map((url, index) => ({
      id: `seed-${index}`,
      url,
      enhancedUrl: "",
      status: "ready" as "ready" | "enhancing" | "enhanced"
    }))
  );
  const [enhancing, setEnhancing] = useState(false);

  const form = useForm<HostListingFormValues>({
    resolver: zodResolver(hostListingSchema),
    defaultValues,
    mode: "onBlur"
  });

  const values = form.watch();

  const pricePreview = useMemo(() => {
    if (values.salePrice) return formatCurrency(values.salePrice, values.currency);
    return "Add pricing";
  }, [values.currency, values.salePrice]);

  useEffect(() => {
    const nextImages = photoGallery.map((photo) => photo.enhancedUrl || photo.url);
    form.setValue("images", nextImages, { shouldValidate: true });
  }, [form, photoGallery]);

  const goNext = async () => {
    const fieldsByStep: Record<number, Array<keyof HostListingFormValues>> = {
      0: ["hostType", "title", "description", "currency"],
      1: ["country", "city", "address", "lat", "lng"],
      2: ["beds", "baths", "areaSqm", "propertyType", "amenities"],
      3: ["salePrice"],
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

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const next = files.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      enhancedUrl: "",
      status: "ready" as const
    }));
    setPhotoGallery((prev) => [...prev, ...next]);
    event.target.value = "";
  };

  const enhancePhotos = async () => {
    if (!photoGallery.length) return;
    setEnhancing(true);
    setPhotoGallery((prev) => prev.map((photo) => ({ ...photo, status: "enhancing" })));
    const enhanced = await Promise.all(
      photoGallery.map((photo) =>
        imageAiClientStub.enhance({
          imageUrl: photo.url,
          profile: "clarity"
        })
      )
    );
    setPhotoGallery((prev) =>
      prev.map((photo, index) => ({
        ...photo,
        enhancedUrl: enhanced[index]?.enhancedUrl ?? photo.enhancedUrl,
        status: "enhanced"
      }))
    );
    setEnhancing(false);
  };

  const downloadPack = (listing: Listing) => {
    const payload = {
      id: listing.id,
      title: listing.title,
      location: `${listing.city}, ${listing.country}`,
      price: listing.price.salePrice,
      currency: listing.currency,
      createdAt: listing.createdAt
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `investor-pack-${listing.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (published) {
    return (
      <Card className="border-primary/30 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Listing published
          </CardTitle>
          <CardDescription>Your listing is now available in buyer search results on this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Buy listing</p>
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
            <Button asChild variant="outline">
              <a href={`/pack/${published.id}`}>Generate investor pack</a>
            </Button>
            <Button variant="secondary" onClick={() => downloadPack(published)}>
              Download pack JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPublished(null);
                form.reset(defaultValues);
                setPhotoGallery(
                  defaultValues.images.map((url, index) => ({
                    id: `seed-${index}`,
                    url,
                    enhancedUrl: "",
                    status: "ready" as const
                  }))
                );
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
          <CardDescription>Publish a buyer-ready listing with clear legal signals.</CardDescription>
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
              <CardTitle>Buyer basics</CardTitle>
              <CardDescription>Frame the listing for serious buyers and their advisors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host-type">Seller type</Label>
                  <Select value={values.hostType} onValueChange={(value) => form.setValue("hostType", value as HostListingFormValues["hostType"], { shouldValidate: true })}>
                    <SelectTrigger id="host-type">
                      <SelectValue placeholder="Select seller type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-destructive">{form.formState.errors.hostType?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Listing currency</Label>
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
                <Input id="title" placeholder="Renovated apartment with legal pack ready" {...form.register("title")} />
                <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Highlight documentation readiness, condition, and key buyer details." {...form.register("description")} />
                <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Pin the exact location buyers and solicitors will reference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="United Kingdom" {...form.register("country")} />
                  <p className="text-xs text-destructive">{form.formState.errors.country?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="London" {...form.register("city")} />
                  <p className="text-xs text-destructive">{form.formState.errors.city?.message}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="12 Riverbank Lane" {...form.register("address")} />
                  <p className="text-xs text-destructive">{form.formState.errors.address?.message}</p>
                </div>
              </div>
              <PinMap
                lat={values.lat}
                lng={values.lng}
                onChange={({ lat, lng }) => {
                  form.setValue("lat", lat, { shouldValidate: true });
                  form.setValue("lng", lng, { shouldValidate: true });
                }}
              />
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Provide the facts buyers compare first.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" type="number" min={0} {...form.register("beds", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.beds?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" type="number" min={0} {...form.register("baths", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.baths?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaSqm">Area (sqm)</Label>
                <Input id="areaSqm" type="number" min={1} {...form.register("areaSqm", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.areaSqm?.message}</p>
              </div>
              <div className="space-y-2">
                <Label>Property type</Label>
                <Select value={values.propertyType} onValueChange={(value) => form.setValue("propertyType", value as HostListingFormValues["propertyType"], { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
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
                <p className="text-xs text-destructive">{form.formState.errors.amenities?.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set a clear sale price. Buyers will see conversions automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale price</Label>
                <Input id="salePrice" type="number" min={1} {...form.register("salePrice", { valueAsNumber: true })} />
                <p className="text-xs text-destructive">{form.formState.errors.salePrice?.message}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Price preview</p>
                <p className="text-xl font-semibold text-primary">{pricePreview}</p>
                <p className="text-xs text-muted-foreground">Conversions are shown to buyers based on their display currency preference.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Capture, preview, and enhance photos with a mocked AI pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-capture">Capture photos (mobile-friendly)</Label>
                <Input id="photo-capture" type="file" accept="image/*" capture="environment" multiple onChange={handleCapture} />
                <p className="text-xs text-muted-foreground">
                  Use your phone camera for quick captures or upload existing images for enhancement.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" className="gap-2" onClick={enhancePhotos} disabled={enhancing || !photoGallery.length}>
                  <Sparkles className="h-4 w-4" />
                  {enhancing ? "Enhancing…" : "Enhance with AI"}
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  AI enhancement is mocked and swaps in premium placeholders.
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {photoGallery.map((photo) => (
                  <div key={photo.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <img src={photo.enhancedUrl || photo.url} alt="Listing preview" className="h-40 w-full object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                      <span>{photo.enhancedUrl ? "Enhanced" : "Original"}</span>
                      <span className="text-primary">
                        {photo.status === "enhancing" ? "Processing" : photo.status === "enhanced" ? "AI Ready" : "Ready"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-destructive">{form.formState.errors.images?.message}</p>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
              <CardDescription>Review your listing and publish it locally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{values.title || "Add a title"}</p>
              <p>
                {values.city || "City"}, {values.country || "Country"}
              </p>
              <p className="text-primary">{pricePreview}</p>
              <p>Publishing stores this listing in LocalStorage for this device only.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext}>
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
