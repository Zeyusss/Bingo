// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import { createLoggingMiddleware, createErrorLoggingMiddleware } from '@packages/middleware/logging.middleware';
import checkInternalToken from '@packages/middleware/check-internal-token';
import cookieParser  from 'cookie-parser';

import express from 'express';
import router from './routes/admin.route';
import sliderRouter from './routes/slider.route';


const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Add logging middleware
app.use(createLoggingMiddleware('admin-service'));

app.use(checkInternalToken);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});

// routes
app.use("/api", router)
app.use("/api/sliders", sliderRouter)

// Add error logging middleware before error handler
app.use(createErrorLoggingMiddleware('admin-service'));
app.use(errorMiddleware);

const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
