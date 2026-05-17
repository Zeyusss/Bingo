require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import express from 'express';
import "./jobs/product-crone.job"
import "./jobs/abandoned-cart.job"
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rateLimiter';
import router from './routes/product.routes';
import cartRouter from './routes/cart.routes';
import wishlistRouter from './routes/wishlist.routes';
import abandonedCartRouter from './routes/abandonedCart.routes';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger-output.json');


const app = express();

app.use(cors({
  origin:["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true ,
}),
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(globalRateLimiter);

app.use(createLoggingMiddleware('product-service'));


app.get('/', (req, res) => {
    res.send({ 'message': 'Product Service is running'});
});




app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});

// Routes
app.use('/api', router);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/abandoned-cart', abandonedCartRouter); 


app.use(createErrorLoggingMiddleware('product-service'));
app.use(errorMiddleware)

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
    console.log(`Product Service is running at http://localhost:${port}/api`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
    console.log(`Swagger JSON is available at http://localhost:${port}/docs-json`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});