import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Import routes
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import blogRoutes from './routes/blog.routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/api', (_, res) => {
  res.send({ message: 'Welcome to blog-service!' });
});

// 404 fallback
app.use('*', (_, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`🚀 Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
