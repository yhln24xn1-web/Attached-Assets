import { z } from "zod";

export const siteInputSchema = z.object({
  lotWidth: z.number().min(3).max(20),
  lotDepth: z.number().min(5).max(60),
  floors: z.number().int().min(1).max(5),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(20),
  budget: z.number().min(100).max(50_000),
  setbacks: z
    .object({
      front: z.number().min(0),
      rear: z.number().min(0),
      left: z.number().min(0),
      right: z.number().min(0),
    })
    .optional(),
  buildingType: z.enum(["townhouse", "villa", "office"]).optional().default("townhouse"),
  architectureStyle: z.string().optional(),
  interiorStyle: z.string().optional(),
});

export type SiteInput = z.infer<typeof siteInputSchema>;
