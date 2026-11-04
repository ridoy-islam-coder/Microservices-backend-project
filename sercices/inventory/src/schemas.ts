import {z} from "zod";

export const InventorySchema = z.object({
    productId: z.string(), 
    sku: z.string(),
    quantity: z.number().int().positive().optional().default(0),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});
