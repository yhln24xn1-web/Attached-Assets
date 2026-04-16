import { z } from "zod";

export const roomSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  label: z.string().optional(),
});

export const stairSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  riserMm: z.number().optional(),
  treadMm: z.number().optional(),
  direction: z.enum(["up", "down"]).optional(),
});

export const floorDetailSchema = z.object({
  floorIndex: z.number().int().min(0),
  label: z.string().optional(),
  heightM: z.number().positive().optional(),
  rooms: z.array(roomSchema),
  stairs: z.array(stairSchema).optional().default([]),
  boundary: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),
});

export const projectLayoutSchema = z.object({
  projectId: z.string(),
  floors: z.array(floorDetailSchema),
  version: z.string().optional().default("1.0"),
  generatedAt: z.string().optional(),
});

export type Room = z.infer<typeof roomSchema>;
export type Stair = z.infer<typeof stairSchema>;
export type FloorDetail = z.infer<typeof floorDetailSchema>;
export type ProjectLayout = z.infer<typeof projectLayoutSchema>;
