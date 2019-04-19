import { Application } from 'express';
import downloadRouter from './api/controllers/download/router';
export default function routes(app: Application): void {
  app.use('/api/download/', downloadRouter);
};
