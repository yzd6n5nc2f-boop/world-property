import { mockListings } from "@/data/mock-listings";
import { ListingDetail } from "@/features/listing/listing-detail";

type ListingRouteProps = {
  params: { id: string };
};

export default function ListingRoute({ params }: ListingRouteProps) {
  return <ListingDetail id={params.id} />;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return mockListings.map((listing) => ({ id: listing.id }));
}
