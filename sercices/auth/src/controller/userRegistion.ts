import { Response, Request, NextFunction } from 'express';
import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { USER_SERVICE } from '@/config';
import { email } from 'zod';

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const parsedBody = UserCreateSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        errors: parsedBody.error.issues
      });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      parsedBody.data.password,
      salt
    );

    // create the auth user
    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
        password: hashedPassword
      },
      select:{
        id:true,
        email:true,
        name:true,
        role:true,
        status:true,
        verified:true

      }
    });

 console.log('user create',user)

 //create the user
 await axios.post(`${USER_SERVICE}/users`,{
    authUserId:user.id,
    name:user.name,
    email:user.email,
 })


//TODO


 return res.status(201).json(user)

  } catch (error) {
    next(error);
  }
};


export default userRegistration