import { Router, type Router as ExpressRouter } from 'express';
import { handleChat } from '../controllers/chat.controller';

const router: ExpressRouter = Router();

router.post('/chat', handleChat);

export default router;
