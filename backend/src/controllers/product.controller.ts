import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response) => {
    const { workspaceId } = req.query;
    const products = await this.productService.getAllProducts(workspaceId as string);
    return res.json(products);
  };

  getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  getProductsByCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const products = await this.productService.getProductsByCategory(categoryId);
    return res.json(products);
  };

  createProduct = async (req: Request, res: Response) => {
    const productData = req.body;
    const product = await this.productService.createProduct(productData);
    return res.status(201).json(product);
  };

  updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productData = req.body;
    const product = await this.productService.updateProduct(id, productData);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.deleteProduct(id);
    return res.status(204).send();
  };

  updateProductStock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await this.productService.updateProductStock(id, stock);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  updateProductStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const product = await this.productService.updateProductStatus(id, status);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };
} 