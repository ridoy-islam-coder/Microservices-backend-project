import prisma from '@/prisma';
import { EmailVerificationSchema } from '@/schemas';
import axios from 'axios';
import { Response, Request, NextFunction } from 'express';

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body
    const parsedBody = EmailVerificationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.issues });
    }

    // check if the user with email exists
    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: parsedBody.data.code,
      },
    });

    if (!verificationCode) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    // if the code has expired
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // mark the verification code as verified
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { verifieAt: new Date() },
    });

    // send success email
    await axios.post(`${process.env.EMAIL_SERVICE}/emails/send`, {
      to: user.email,
      subject: 'Email Verified',
      text: 'Your email has been verified successfully',
      source: 'verify-email',
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};


export default verifyEmail;
