import {Request, Response,NextFunction} from "express";
import { PrismaClient } from "@prisma/client";

import { InventorySchema } from "@/schemas";


const prisma = new PrismaClient();


const createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = InventorySchema.safeParse(req.body);

        // validate the request body against the schema
        if (!validatedData.success) {
            return res.status(400).json({ error: validatedData.error.issues });
        }

        //create a new inventory record in the database

        const inventory = await prisma.inventory.create({
            data: { ...validatedData.data }
        });
        res.status(201).json(inventory);
    } catch (error) {
        next(error);
    }
}