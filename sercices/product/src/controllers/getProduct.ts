import prisma from '@/prisma';
import { Request, Response, NextFunction } from 'express';

const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement pagination
    // TODO: Implement filtering

    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });

    return res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export default getProducts;