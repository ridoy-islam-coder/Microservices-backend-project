import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { addToCard, getMyCard } from './controllers';
import  './events/onKeyExpires';




dotenv.config();

const app = express();
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});
app.use('/api',limiter);

app.use(express.json());
app.use(morgan('dev'));



app.post('/card/add-to-card',addToCard)
app.get('/card/me',getMyCard)

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'api gateway is running' });
});

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});




const PORT = process.env.PORT || 4006;

app.listen(PORT, () => {
    console.log(`card service is running on port ${PORT}`);
});
