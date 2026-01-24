import { CreateListingWizard } from "@/features/host/create-listing-wizard";

export default function HostRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create a listing</h1>
        <p className="text-muted-foreground">
          This wizard publishes locally for the MVP. Listings appear in search results on this device.
        </p>
      </header>
      <CreateListingWizard />
    </div>
  );
}
