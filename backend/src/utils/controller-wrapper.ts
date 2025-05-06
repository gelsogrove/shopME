import { RequestHandler } from 'express';
import { ControllerFunction } from '../types/express';

/**
 * Wrapper per convertire una funzione controller in un RequestHandler
 * Evita di usare "as unknown as RequestHandler"
 */
export function wrapController(controllerFn: ControllerFunction): RequestHandler {
  return (req, res, next) => {
    return Promise.resolve(controllerFn(req, res, next)).catch(next);
  };
} 