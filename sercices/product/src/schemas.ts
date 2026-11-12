import { status } from "@prisma/client";
import {z} from "zod";

export const ProductCreateDTOSchema = z.object({
  id: z.string().min(3).max(10),
  name: z.string().min(3).max(250),
  description: z.string().max(1000).optional(),
  price: z.number().optional().default(0),
  sku: z.string().optional().default(""),
  status: z.nativeEnum(status).default(status.DRAFT),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const ProductUpdateDTOSchema = ProductCreateDTOSchema.omit({
  sku: true,
}).partial();