

import { Response, Request, NextFunction } from 'express';
import prisma from '@/prisma';
import { userLoginSchema } from '@/schemas';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginAttempt } from '@prisma/client';



type LoginHistory = {
  userId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      userAgent: info.userAgent ?? '',
      ipAddress: info.ipAddress ?? '',
      attempt: info.attempt,
    }
  });
};



const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

// user  histore create

    const ipAddress =req.headers['x-forwarded-for'] as string || req.ip || '';

    const userAgent = req.headers['user-agent'] || '';


    // Validate the request body
    const parsedBody = userLoginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        errors: parsedBody.error.issues
      });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!user) {

   await createLoginHistory(
   
    {
       userId:'Gust',
      userAgent,
      ipAddress,
      attempt:'FAILED',
    }

   )

      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      parsedBody.data.password,
      user.password
    );

    if (!isMatch) {

  
   await createLoginHistory(
   
    {
       userId:user.id,
      userAgent,
      ipAddress,
      attempt:'FAILED',
    }

   )


      
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Check if the user is verified
    if (!user.verified) {

     await createLoginHistory(
   
    {
       userId:user.id,
      userAgent,
      ipAddress,
      attempt:'FAILED',
    }

   )


      return res.status(400).json({
        message: 'User not verified'
      });
    }

    // Check if the account is active
    if (user.status !== 'ACTIVE') {
    
      await createLoginHistory(
   
    {
       userId:user.id,
      userAgent,
      ipAddress,
      attempt:'FAILED',
    }

   )

      return res.status(400).json({
        message: `Your account is ${user.status.toLocaleLowerCase()}`
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET ?? 'my_secret_key',
      {
        expiresIn: '2h'
      }
    );


       await createLoginHistory(
   
    {
       userId:user.id,
      userAgent,
      ipAddress,
      attempt:'SUCCESS',
    }

   )



    return res.status(200).json({
      accessToken,
    });



  } catch (error) {
    next(error);
  }
};

export default userLogin