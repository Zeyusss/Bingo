// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger-output.json');


const app = express();

app.use(cors({
  origin:["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true ,
}),
);
app.use(express.json());
app.use(cookieParser());

// Add logging middleware
app.use(createLoggingMiddleware('auth-service'));

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});

// Routes
app.use('/api', router); 


app.use(createErrorLoggingMiddleware('auth-service'));
app.use(errorMiddleware)

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth Service is running at http://localhost:${port}/api`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
    console.log(`Swagger JSON is available at http://localhost:${port}/docs-json`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});