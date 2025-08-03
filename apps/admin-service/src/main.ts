// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import cookieParser  from 'cookie-parser';

import express from 'express';
import router from './routes/admin.route';


const app = express();
app.use(express.json());
app.use(cookieParser());

// Add logging middleware
app.use(createLoggingMiddleware('admin-service'));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});

// routes
app.use("/api",router)

// Add error logging middleware before error handler
app.use(createErrorLoggingMiddleware('admin-service'));
app.use(errorMiddleware);

const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
