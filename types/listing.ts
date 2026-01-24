export type ListingMode = "buy" | "rent" | "stay";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "condo"
  | "cabin"
  | "loft"
  | "townhouse";

export type HostType = "agent" | "owner";

export type ListingPrice = {
  salePrice?: number;
  rentPerMonth?: number;
  nightRate?: number;
};

export interface Listing {
  id: string;
  mode: ListingMode;
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  price: ListingPrice;
  currency: string;
  beds: number;
  baths: number;
  areaSqm: number;
  propertyType: PropertyType;
  images: string[];
  amenities: string[];
  hostType: HostType;
  createdAt: string;
}

export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type ListingQuery = {
  mode: ListingMode;
  text?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes?: PropertyType[];
  bounds?: Bounds;
  startDate?: string;
  endDate?: string;
};
