import * as winston from 'winston';

// Determiniamo se dobbiamo abilitare i log in test in base alla variabile di ambiente
const enableTestLogs = process.env.TEST_LOGS === 'true';

// Verifica se siamo in ambiente di test e se dobbiamo silenziare i log
const isTest = process.env.NODE_ENV === 'test';
const shouldSilenceTestLogs = isTest && !enableTestLogs;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' || enableTestLogs ? 'debug' : 'info',
  silent: shouldSilenceTestLogs, // I log sono silenziati nei test a meno che non siano esplicitamente abilitati
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
    new winston.transports.File({
      filename: '/tmp/shopme-server.log',
      level: 'debug',
    }),
  ],
});

// Esponiamo una funzione per abilitare i log nei test
export const enableLogsForTests = () => {
  if (isTest) {
    if (enableTestLogs) {
      logger.silent = false;
      logger.level = 'debug';
      logger.info('Test logs enabled');
    } else {
      // Se i log non sono esplicitamente abilitati, li mantieniamo silenziati
      logger.silent = true;
    }
  }
};

export default logger;
