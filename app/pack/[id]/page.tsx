import { mockListings } from "@/data/mock-listings";
import { PackPageClient } from "@/components/pack/pack-page-client";

type PackPageProps = {
  params: { id: string };
};

export default function PackPage({ params }: PackPageProps) {
  return <PackPageClient listingId={params.id} />;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return mockListings.map((listing) => ({ id: listing.id }));
}
