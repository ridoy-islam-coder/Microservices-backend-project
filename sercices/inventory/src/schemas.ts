import {z} from "zod";
import { ActionType } from "../generated/prisma";

export const InventorySchema = z.object({
    productId: z.string(), 
    sku: z.string(),
    quantity: z.number().int().optional().default(0),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export const InventoryUpdateDTOSchema = z.object({
    actionType: z.nativeEnum(ActionType),
    quantity: z.number().int(),
    updatedAt: z.date().default(() => new Date()),
});