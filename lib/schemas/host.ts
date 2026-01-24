import { z } from "zod";
import { hostTypeSchema, propertyTypeSchema } from "@/lib/schemas/listing";

const photoUrlSchema = z.string().url({ message: "Enter a valid URL" });

export const hostListingSchema = z.object({
  hostType: hostTypeSchema,
  title: z.string().min(5),
  description: z.string().min(20),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  beds: z.number().min(0),
  baths: z.number().min(0),
  areaSqm: z.number().positive(),
  propertyType: propertyTypeSchema,
  salePrice: z.number().positive({ message: "Sale price is required" }),
  currency: z.string().length(3).default("GBP"),
  amenities: z.array(z.string()).min(1),
  images: z.array(photoUrlSchema).min(1)
});

export type HostListingFormValues = z.infer<typeof hostListingSchema>;
