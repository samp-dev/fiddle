import fs from 'async-file';
import execa from 'execa';

import './common/env';
import Server from './common/express';
import './common/socket';
import l from './common/logger';

// TODO: Find a better solution to fix the docker frontend build
(async () => {
  if (!(await fs.exists('./ui/build/index.html'))) {
    l.info('[FRONTEND]', 'No frontend build found. Creating an optimized production build...');

    try {
      await execa('yarn', ['build'], {
        cwd: './ui/',
        env: { SKIP_PREFLIGHT_CHECK: 'true' },
      });

      l.info('[FRONTEND]', 'Frontend was built successfully.');
    } catch (ex) {
      l.error('[FRONTEND]', 'Could not create an optimized production build.', ex);
    }
  }
})();

const port = parseInt(process.env.PORT);
export default Server.listen(port);
