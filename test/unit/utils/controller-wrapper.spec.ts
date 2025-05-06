import chai, { expect } from 'chai';
import { NextFunction, Request, Response } from 'express';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ControllerFunction } from '../../../backend/src/types/express';
import { wrapController } from '../../../backend/src/utils/controller-wrapper';

// Configurare chai per usare sinon-chai
chai.use(sinonChai);

describe('Controller Wrapper', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    next = sinon.spy();
  });

  it('should correctly wrap a controller function that returns a promise', async () => {
    // Arrange
    const controllerFn: ControllerFunction = async (req, res, next) => {
      res.status(200).json({ success: true });
    };
    const wrappedController = wrapController(controllerFn);

    // Act
    await wrappedController(req as Request, res as Response, next as NextFunction);

    // Assert
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ success: true });
    expect(next).to.not.have.been.called;
  });

  it('should correctly wrap a controller function that returns void', () => {
    // Arrange
    const controllerFn: ControllerFunction = (req, res, next) => {
      res.status(200).json({ success: true });
    };
    const wrappedController = wrapController(controllerFn);

    // Act
    wrappedController(req as Request, res as Response, next as NextFunction);

    // Assert
    expect(res.status).to.have.been.calledWith(200);
    expect(res.json).to.have.been.calledWith({ success: true });
    expect(next).to.not.have.been.called;
  });

  it('should call next with error when controller function throws', async () => {
    // Arrange
    const error = new Error('Test error');
    const controllerFn: ControllerFunction = async () => {
      throw error;
    };
    const wrappedController = wrapController(controllerFn);

    // Act
    await wrappedController(req as Request, res as Response, next as NextFunction);

    // Assert
    expect(next).to.have.been.calledWith(error);
  });
}); 