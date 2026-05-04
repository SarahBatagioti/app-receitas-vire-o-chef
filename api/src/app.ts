import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';

const app = express();

app.use(cors());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(express.json());
app.use('/api', router);
app.use(errorHandler);

export { app };
