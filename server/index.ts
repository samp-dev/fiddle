import './common/env';
import Server from './common/express';
import './common/socket';

const port = parseInt(process.env.PORT);
export default Server.listen(port);
