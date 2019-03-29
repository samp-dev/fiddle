import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import l from '../logger';
import routes from '../../routes';
import socketio from 'socket.io';

const app = express();

export default class ExpressServer {
  public server: http.Server;
  public io: socketio.Server;

  constructor() {
    const root = path.normalize(__dirname + '/../../..');
    app.set('appPath', root + 'client');
    app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '1MB' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT || '1MB' }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(helmet());

    // /AdjectiveAdjectiveAnimal regex
    app.use(/^\/(?=(.*[A-Z]){3,})(?=(.*[a-z]){3,})[^\W|_|\d]+$/, express.static(`${root}/ui/build/index.html`));
    app.use(express.static(`${root}/ui/build/`));

    routes(app);

    this.server = http.createServer(app);
    this.io = socketio(this.server);
  }

  listen(p: string | number = process.env.PORT): Application {
    const welcome = port => () => l.info('[BACKEND]', `up and running @ ${os.hostname()} on port ${port}`);
    this.server.listen(p, welcome(p));
    return app;
  }
}
