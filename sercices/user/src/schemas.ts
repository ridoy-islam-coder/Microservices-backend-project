
import {z} from "zod";

export const UserSchema = z.object({
 authUserId: z.string(),
 name: z.string(),
 email: z.string().email(),
 address: z.string().optional(),
 phone: z.string().optional(),
   
})

export const UserUpdateSchema =UserSchema.omit({authUserId: true}).partial() 