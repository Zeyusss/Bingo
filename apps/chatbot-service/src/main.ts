// src/main.ts
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { handleChat } from './controllers/chat.controller';

config(); // Load environment variables

const app = express();
const port = process.env.PORT || 8081;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send({ message: '🟢 Chatbot is live!' });
});

app.post('/api/chat', handleChat);

app.listen(port, () => {
  console.log(`✅ Chatbot service running on http://localhost:${port}`);
});
