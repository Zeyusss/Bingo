require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

import express from 'express';
import WebSocket from "ws";
import http from "http"
import { consumeKafkaMessages } from './logger-consumer';
const app = express();


app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to logger-service!' });
});
const wsServer = new WebSocket.Server({noServer:true})
export const clients = new Set<WebSocket>();

wsServer.on("connection", (ws)=>{
  console.log("New logger client connected")
  clients.add(ws);

  ws.on("close",()=>{
    console.log("Logger client disconnected");
    clients.delete(ws)
  })
})

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const token = url.searchParams.get("token") || request.headers["x-internal-service-token"];
  if (token !== process.env.INTERNAL_SERVICE_TOKEN) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request);
  });
})

server.listen(process.env.PORT || 6008 , ()=>{
  console.log(`Logger ServiceListening at http://localhost:6008/api`)
})

// start kafka consumer
consumeKafkaMessages()
