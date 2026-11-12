import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { createProduct, getProductById, getProducts, updateProduct } from './controllers';




dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});


app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:8001', 'http://127.0.0.1:8001'];
  const origin=req.headers.origin || '';


  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
      next();
  }else {
    res.status(403).json({ error: 'Forbidden' });
  }
  

}); 



//api routes
app.get('/products/:id',getProductById)
app.put('/products/:id',updateProduct)
app.get('/products', getProducts)
app.post('/products',createProduct)







// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 4001;
const serviceName = process.env.SERVICE_NAME || 'product-service';


app.listen(PORT, () => {
    console.log(`${serviceName} is running on port ${PORT}`);
});

