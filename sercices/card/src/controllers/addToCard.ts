
import { CART_TTL } from '@/config';
import redis from '@/redis';
import { CartItemSchema } from '@/schemas';
import { Response, Request, NextFunction } from 'express';
import { v4 as uuid} from 'uuid'


const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate request body
    const parsedBody = CartItemSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

    let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;



    // check if cart session id is present in the request header and ex
if (cartSessionId) {
  const exists = await redis.exists(`sessions:${cartSessionId}`);
  console.log("Session Exists: ", exists);

  if (!exists) {
    cartSessionId = null;
  }
}

// if cart session id is not present, create a new one

if (!cartSessionId) {
  cartSessionId = uuid();
  console.log('New Session ID: ', cartSessionId);

  // set the cart session id in the redis store
  await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);

  // set the cart session id in the response header
  res.setHeader('x-cart-session-id', cartSessionId);
}

// add item to the cart
await redis.hset(`cart:${cartSessionId}`, parsedBody.data.productId, JSON.stringify({
  inventoryId: parsedBody.data.inventoryId,
  quantity: parsedBody.data.quantity,
}));


  } catch (error) {
    next(error);
  }
};

export default addToCart