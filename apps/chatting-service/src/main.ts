import * as dotenv from 'dotenv';
dotenv.config();

import  cookieParser from 'cookie-parser';
import express from "express";
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message.consumer';
import checkInternalToken from '@packages/middleware/check-internal-token';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import router from './routes/chat.routes';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(checkInternalToken);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

// routes
app.use("/api",router)

app.use(errorMiddleware)

const port = process.env.PORT || 6006;

const server = app.listen(port, () => {
  console.log(`Chatting Service Listening at http://localhost:${port}/api`);
});

//websocket server
createWebSocketServer(server);

//start kafka consum
startConsumer().catch((error:any)=>{
  console.log(error);
})


server.on("error", console.error);
