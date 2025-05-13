import winston from 'winston';

// Determiniamo se dobbiamo abilitare i log in test in base alla variabile di ambiente
const enableTestLogs = process.env.TEST_LOGS === 'true';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' || enableTestLogs ? 'debug' : 'info',
  silent: process.env.NODE_ENV === 'test' && !enableTestLogs, // Abilita i log nei test solo se la variabile è impostata
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Esponiamo una funzione per abilitare i log nei test
export const enableLogsForTests = () => {
  if (process.env.NODE_ENV === 'test') {
    logger.silent = false;
    logger.level = 'debug';
    logger.info('Test logs enabled');
  }
};

export default logger;
