import  cookieParser  from 'cookie-parser';
import express from 'express';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import checkInternalToken from '@packages/middleware/check-internal-token';
import router from './routes/recommendation.route';


const app = express();
app.use(express.json({limit:"1mb"}))
app.use(express.urlencoded({limit:"1mb",extended:true}))
app.use(cookieParser())

app.use(checkInternalToken);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

// routes
app.use("/api",router);

app.use(errorMiddleware)

const port = process.env.PORT || 6007;
const server = app.listen(port, () => {
  console.log(`Recommendation-service Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
