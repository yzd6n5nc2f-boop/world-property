import { z } from "zod";

export const hostTypeSchema = z.enum(["agent", "owner"]);
export const propertyTypeSchema = z.enum([
  "apartment",
  "house",
  "villa",
  "condo",
  "cabin",
  "loft",
  "townhouse"
]);

export const listingSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  description: z.string().min(20),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  price: z.object({
    salePrice: z.number().positive()
  }),
  currency: z.string().length(3),
  beds: z.number().min(0),
  baths: z.number().min(0),
  areaSqm: z.number().positive(),
  propertyType: propertyTypeSchema,
  images: z.array(z.string().url()).min(1),
  amenities: z.array(z.string()).min(1),
  hostType: hostTypeSchema,
  createdAt: z.string()
});

export const searchFilterSchema = z.object({
  text: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minBeds: z.number().int().nonnegative().optional(),
  propertyTypes: z.array(propertyTypeSchema).optional()
});

export type ListingInput = z.infer<typeof listingSchema>;
export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
