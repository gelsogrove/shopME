/**
 * Mock per request e response di Express
 */

import { jest } from '@jest/globals';
import { Request, Response } from 'express';

// Mock per Express Request
export const createMockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: null,
    session: {
      destroy: jest.fn((cb) => cb()),
    },
    ...overrides
  } as unknown as Request;

  return req;
};

// Mock per Express Response
export const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.type = jest.fn().mockReturnValue(res);
  return res;
};

// Mock per Express Next
export const createMockNext = () => jest.fn();

// Esempio di creazione di un request con un utente autenticato
export const createAuthenticatedRequest = (userId = 'user-test-id', role = 'USER', email = 'test@example.com') => {
  return createMockRequest({
    user: {
      id: userId,
      role,
      email,
    },
    headers: {
      'x-workspace-id': 'workspace-test-id',
    }
  });
};

// Esempio di request per test di workspace
export const createWorkspaceRequest = (workspaceId = 'workspace-test-id') => {
  return createMockRequest({
    params: {
      workspaceId,
    },
    headers: {
      'x-workspace-id': workspaceId,
    }
  });
};

// Esempio di request per test di prodotti
export const createProductRequest = (productId = 'product-test-id', workspaceId = 'workspace-test-id') => {
  return createMockRequest({
    params: {
      id: productId,
      workspaceId,
    },
    body: {
      name: 'Test Product',
      description: 'Test description',
      price: 19.99,
      categoryId: 'category-test-id',
      workspaceId,
    },
    headers: {
      'x-workspace-id': workspaceId,
    }
  });
};

// Esempio di request per test di categorie
export const createCategoryRequest = (categoryId = 'category-test-id', workspaceId = 'workspace-test-id') => {
  return createMockRequest({
    params: {
      id: categoryId,
      workspaceId,
    },
    body: {
      name: 'Test Category',
      description: 'Test description',
      workspaceId,
    },
    headers: {
      'x-workspace-id': workspaceId,
    }
  });
};

// Esempio di request per test di offerte
export const createOfferRequest = (offerId = 'offer-test-id', workspaceId = 'workspace-test-id') => {
  return createMockRequest({
    params: {
      id: offerId,
      workspaceId,
    },
    body: {
      name: 'Test Offer',
      description: 'Test description',
      discount: 10,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      categoryId: 'category-test-id',
      workspaceId,
    },
    headers: {
      'x-workspace-id': workspaceId,
    }
  });
}; 