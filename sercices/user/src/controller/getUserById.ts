import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';
import { User } from '@prisma/client';

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const filed = req.query.filed as string;
        let user:User |null = null;
       
        if (filed =='authUserId') {
            user = await prisma.user.findUnique({where: {authUserId: id },});
        }else{
           user =  await prisma.user.findUnique({ where: { id } });
        }



       
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    } catch (error) {
        next(error);
    }
};

export default getUserById;