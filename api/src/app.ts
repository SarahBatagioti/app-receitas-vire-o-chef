import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

export { app };
