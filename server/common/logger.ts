import pino from 'pino';

// @ts-ignore
const l = pino({
  level: process.env.LOG_LEVEL,
  name: process.env.APP_ID,
  prettyPrint: {
    colorize: true,
    translateTime: 'HH:MM:ss'
  }
});

export default l;
