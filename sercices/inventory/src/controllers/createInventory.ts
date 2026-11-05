import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { InventorySchema } from "@/schemas";



const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = InventorySchema.safeParse(req.body);

        if (!validatedData.success) {
            return res.status(400).json({ error: validatedData.error.issues });
        }

        const inventory = await prisma.inventory.create({
            data: { 
                ...validatedData.data, 
            histories: {
                create: {
                    actionType: "IN",
                    quantityChanged: validatedData.data.quantity,
                    LastQuantity: 0,
                    newQuantity: validatedData.data.quantity,
                },
            
            }
        },
        select: {
            id: true,
            quantity: true,
            
            },  

        });

        return res.status(201).json(inventory);
    } catch (error) {
        next(error);
    }
};

export default createInventory;