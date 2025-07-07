import { errorMiddleware } from '@packages/error-handler/error-middleware';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/product.routes';
// import swaggerUi from 'swagger-ui-express';
// const swaggerDocument = require('./swagger-output.json');


const app = express();

app.use(cors({
  origin:["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true ,
}),
);
app.use(express.json());
app.use(cookieParser());

// Root route
app.get('/', (req, res) => {
    res.send({ 'message': 'Product Service is running'});
});




// app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocument))
// app.get("/docs-json", (req, res) => {
//     res.json(swaggerDocument);
// });

// Routes
app.use('/api', router); 

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