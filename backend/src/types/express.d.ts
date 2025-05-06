import { NextFunction, Request, Response } from 'express';

export type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | void;

export type Controller = {
  [key: string]: ControllerFunction;
}; 