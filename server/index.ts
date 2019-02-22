import './common/env';
import Server from './common/server';

const port = parseInt(process.env.PORT);
export default new Server()
  .listen(port);
