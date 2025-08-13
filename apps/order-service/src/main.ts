
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import  cookieParser  from 'cookie-parser';
import express from 'express';
import cors from "cors"
import bodyParser from "body-parser";
import router from './routes/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();
app.use(
  cors({
    origin : ["http://localhost:3000"],
    allowedHeaders:["Authorization","Content-Type"],
    credentials:true,
  })
)
app.post("/api/create-order", bodyParser.raw({type:"application/json"}), (req,res,next)=>{
  (req as any).rawBody = req.body;
  next();
},
createOrder
)
app.use(express.json());
app.use(cookieParser())


app.use(createLoggingMiddleware('order-service'));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

// routes
app.use("/api",router);



app.use(createErrorLoggingMiddleware('order-service'));
app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Order ServiceListening at http://localhost:${port}/api`);
  

});
server.on('error', console.error);
