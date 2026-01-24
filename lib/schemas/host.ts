import { z } from "zod";
import { hostTypeSchema, listingModeSchema, propertyTypeSchema } from "@/lib/schemas/listing";

const photoUrlSchema = z.string().url({ message: "Enter a valid URL" });

export const hostListingSchema = z
  .object({
    mode: listingModeSchema,
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
    salePrice: z.number().positive().optional(),
    rentPerMonth: z.number().positive().optional(),
    nightRate: z.number().positive().optional(),
    currency: z.string().length(3).default("GBP"),
    amenities: z.array(z.string()).min(1),
    images: z.array(photoUrlSchema).min(1)
  })
  .superRefine((value, ctx) => {
    if (value.mode === "buy" && !value.salePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sale price is required for buy listings",
        path: ["salePrice"]
      });
    }

    if (value.mode === "rent" && !value.rentPerMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly rent is required for rent listings",
        path: ["rentPerMonth"]
      });
    }

    if (value.mode === "stay" && !value.nightRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nightly rate is required for stay listings",
        path: ["nightRate"]
      });
    }
  });

export type HostListingFormValues = z.infer<typeof hostListingSchema>;
