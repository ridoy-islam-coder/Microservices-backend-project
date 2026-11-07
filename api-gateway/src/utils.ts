
import { Express,Request,Response } from 'express';
import config from './config.json';
import axios from 'axios';




export const createHandler = (hostname: string, path: string, method: string) => {

 return async (req:Request, res:Response) => {
  try {
        let url = `${hostname}${path}`;
     
       req.params && Object.keys(req.params).forEach(param => {
        url = url.replace(`:${param}`, String(req.params[param]));
       });



       const {data}=await axios({
        method,
        url,
        data: req.body,
        headers:{
           origin:'http://localhost:8001',
        }
       });

       res.json(data)
  } catch (error) {
    if (error instanceof axios.AxiosError) {
     return res.status(error.response?.status || 500).json({ error: error.message });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
 }
}


export const configerRoutes = (app: Express) => {

 Object.entries(config.services).forEach(([_name,service]) => {
   
  const hostname = service.url;
   service.routes.forEach(route => {
     const method = route.methods.forEach((method) => {
      const heldler = createHandler(hostname, route.path, method);


        app[method](`/api${route.path}`, heldler);
       





         })
    




   });


 });
};
