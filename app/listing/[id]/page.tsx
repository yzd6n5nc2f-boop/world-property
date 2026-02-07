import { ListingDetail } from "@/features/listing/listing-detail";

type ListingRouteProps = {
  params: { id: string };
};

export default function ListingRoute({ params }: ListingRouteProps) {
  return <ListingDetail id={params.id} />;
}
