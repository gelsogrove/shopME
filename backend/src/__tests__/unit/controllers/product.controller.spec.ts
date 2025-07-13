import { describe, expect, it } from '@jest/globals';
import { ProductController } from '../../../interfaces/http/controllers/product.controller';

describe('ProductController', () => {
  it('should instantiate without error', () => {
    const controller = new ProductController();
    expect(controller).toBeDefined();
  });
}); 