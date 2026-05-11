import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes';
import { errorHandler } from './middlewares/error-handler.middleware';
import {
  getAndroidAppLinksStatement,
  getAppleAppSiteAssociation,
} from './utils/app-links';

const app = express();

app.use(cors());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use(express.json());
app.get('/.well-known/assetlinks.json', (request, response) => {
  return response.status(200).json([getAndroidAppLinksStatement()]);
});
app.get(['/apple-app-site-association', '/.well-known/apple-app-site-association'], (request, response) => {
  response.setHeader('Content-Type', 'application/json');
  return response.status(200).send(JSON.stringify(getAppleAppSiteAssociation()));
});
app.use('/api', router);
app.use(errorHandler);

export { app };
