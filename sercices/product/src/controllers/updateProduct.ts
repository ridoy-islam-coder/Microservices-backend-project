import prisma from '@/prisma';
import { ProductUpdateDTOSchema } from '@/schemas';
import { Request, Response, NextFunction } from 'express';

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // verify if the request body is valid
    const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

        const productId = Array.isArray(req.params.id)
          ? req.params.id[0]
          : req.params.id;

        const product = await prisma.product.findUnique({
        where: {
         id: productId
        },
        });

        if (!product) {
        return res.status(404).json({ message: 'Product not found' });
        }

        // update the product
        const updatedProduct = await prisma.product.update({
        where: {
            id: productId,
        },
        data: parsedBody.data,
        });

        res.status(200).json({ data: updatedProduct });



  } catch (error) {
    next(error);
  }
};

export default  updateProduct