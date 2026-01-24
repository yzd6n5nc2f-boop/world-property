import type { Listing, ListingMode, PropertyType } from "@/types/listing";

const cities = [
  { city: "London", country: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { city: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
  { city: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { city: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { city: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241 },
  { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { city: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { city: "Auckland", country: "New Zealand", lat: -36.8509, lng: 174.7645 },
  { city: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194 },
  { city: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { city: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { city: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978 }
];

const propertyTypes: PropertyType[] = [
  "apartment",
  "house",
  "villa",
  "condo",
  "cabin",
  "loft",
  "townhouse"
];

const amenities = [
  "Wi-Fi",
  "Air conditioning",
  "Workspace",
  "Gym",
  "Pool",
  "Parking",
  "Balcony",
  "Pet friendly",
  "Concierge",
  "Laundry"
];

const currencies = ["GBP", "EUR", "USD", "CAD", "JPY", "AUD", "SGD", "AED", "BRL", "MXN"];

function buildImages(seed: string) {
  return [0, 1, 2].map((index) => `https://picsum.photos/seed/${seed}-${index}/1200/800`);
}

function pickAmenities(index: number) {
  const first = amenities[index % amenities.length];
  const second = amenities[(index + 3) % amenities.length];
  const third = amenities[(index + 6) % amenities.length];
  return [first, second, third];
}

function offsetLatLng(lat: number, lng: number, offset: number) {
  const jitter = (offset % 5) * 0.01 + 0.005;
  return {
    lat: lat + (offset % 2 === 0 ? jitter : -jitter),
    lng: lng + (offset % 3 === 0 ? jitter : -jitter)
  };
}

function priceFor(mode: ListingMode, index: number) {
  if (mode === "buy") {
    return { salePrice: 180000 + index * 45000 };
  }

  if (mode === "rent") {
    return { rentPerMonth: 900 + index * 140 };
  }

  return { nightRate: 85 + index * 12 };
}

function currencyFor(index: number) {
  return currencies[index % currencies.length];
}

export const mockListings: Listing[] = cities.flatMap((place, cityIndex) => {
  const modes: ListingMode[] = ["buy", "rent", "stay"];
  return modes.map((mode, modeIndex) => {
    const globalIndex = cityIndex * modes.length + modeIndex;
    const coords = offsetLatLng(place.lat, place.lng, globalIndex + 1);
    const propertyType = propertyTypes[globalIndex % propertyTypes.length];
    const beds = 1 + (globalIndex % 5);
    const baths = 1 + (globalIndex % 3);
    const areaSqm = 45 + beds * 18 + modeIndex * 10;
    const titleMode = mode === "stay" ? "Stay" : mode === "rent" ? "Rent" : "Buy";

    return {
      id: `${place.city.toLowerCase().replace(/\s+/g, "-")}-${mode}`,
      mode,
      title: `${beds}-bed ${propertyType} for ${titleMode} in ${place.city}`,
      description:
        "A thoughtfully designed home base with natural light, efficient layout, and easy access to transit, culture, and neighbourhood favourites. Ideal for globally minded movers.",
      country: place.country,
      city: place.city,
      address: `${12 + modeIndex} ${place.city} Central District`,
      lat: coords.lat,
      lng: coords.lng,
      price: priceFor(mode, globalIndex + 1),
      currency: currencyFor(globalIndex),
      beds,
      baths,
      areaSqm,
      propertyType,
      images: buildImages(`${place.city}-${mode}`),
      amenities: pickAmenities(globalIndex),
      hostType: modeIndex % 2 === 0 ? "agent" : "owner",
      createdAt: new Date(Date.UTC(2024, (globalIndex % 12), 1)).toISOString()
    } satisfies Listing;
  });
});

export const featuredCities = cities.slice(0, 6);
export const featuredListings = mockListings.slice(0, 8);
