import prisma from '@/prisma';
import { InventoryUpdateDTOSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';

export const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // 1. Parse and validate request body
    const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json(parsedBody.error.issues);
    }

    // 2. Check if the inventory exists
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    // 3. Find the last history
    const lastHistory = await prisma.history.findFirst({
      where: { inventoryId: id },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Calculate the new quantity
    let newQuantity = inventory.quantity;
    if (parsedBody.data.actionType === 'IN') {
      newQuantity += parsedBody.data.quantity;
    } else if (parsedBody.data.actionType === 'OUT') {
      newQuantity -= parsedBody.data.quantity;
    } else {
      return res.status(400).json({ message: 'Invalid action type' });
    }

    // 5. Update the inventory and create history using a transaction
    const updatedInventory = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          histories: {
            create: {
              actionType: parsedBody.data.actionType,
              quantityChanged: parsedBody.data.quantity,
              LastQuantity: lastHistory?.newQuantity ?? 0,
              newQuantity: newQuantity,
            },
          },
        },
        select: {
          id: true, 
          quantity: true,
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedInventory,
    });

  } catch (error) {
    next(error);
  }
};

export default updateInventory