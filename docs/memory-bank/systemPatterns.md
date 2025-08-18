# 🧠 MEMORY BANK - SYSTEM PATTERNS

## 📋 **ARCHITECTURAL PATTERNS**

### 🏗️ **Domain-Driven Design (DDD)**
**Pattern:** Layered Architecture with Domain Focus  
**Implementation:** Clean separation of business logic and infrastructure  

#### **Domain Layer**
```typescript
// Business entities with business logic
export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public stock: number,
    public workspaceId: string
  ) {}

  isAvailable(): boolean {
    return this.stock > 0;
  }

  updateStock(quantity: number): void {
    this.stock = Math.max(0, this.stock - quantity);
  }
}
```

#### **Repository Pattern**
```typescript
// Repository interface in domain layer
export interface ProductRepository {
  findById(id: string, workspaceId: string): Promise<Product | null>;
  findByWorkspace(workspaceId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string, workspaceId: string): Promise<void>;
}

// Implementation in infrastructure layer
export class PrismaProductRepository implements ProductRepository {
  async findById(id: string, workspaceId: string): Promise<Product | null> {
    const product = await prisma.product.findFirst({
      where: { id, workspaceId, isActive: true }
    });
    return product ? this.mapToEntity(product) : null;
  }
}
```

### 🔄 **Application Service Pattern**
**Pattern:** Use Case Implementation  
**Purpose:** Orchestrate domain objects for business operations  

```typescript
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private workspaceService: WorkspaceService
  ) {}

  async createProduct(data: CreateProductDto, workspaceId: string): Promise<Product> {
    // Business logic validation
    if (data.price < 0) {
      throw new Error('Price cannot be negative');
    }

    const product = new Product(
      generateId(),
      data.name,
      data.price,
      data.stock,
      workspaceId
    );

    return await this.productRepository.save(product);
  }
}
```

---

## 🔒 **SECURITY PATTERNS**

### 🛡️ **Workspace Isolation Pattern**
**Pattern:** Multi-tenant Data Isolation  
**Implementation:** All queries filter by workspaceId  

```typescript
// Base repository with workspace isolation
export abstract class BaseRepository<T> {
  protected async findByWorkspace(workspaceId: string): Promise<T[]> {
    return await this.prisma[this.modelName].findMany({
      where: { 
        workspaceId,
        isActive: true,
        isDelete: false 
      }
    });
  }

  protected async findByIdAndWorkspace(id: string, workspaceId: string): Promise<T | null> {
    return await this.prisma[this.modelName].findFirst({
      where: { 
        id,
        workspaceId,
        isActive: true,
        isDelete: false 
      }
    });
  }
}
```

### 🔐 **Authentication Middleware Pattern**
**Pattern:** JWT Token Validation with Workspace Context  
**Implementation:** Middleware chain for security  

```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const workspaceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid workspace' });
  }
};
```

---

## 🤖 **AI INTEGRATION PATTERNS**

### 🔄 **Two-LLM Architecture Pattern**
**Pattern:** Separation of Concerns for AI Processing  
**Implementation:** RAG Processor + Response Formatter  

```typescript
// LLM 1: RAG Processor (Temperature: 0.3)
export class RagProcessor {
  async processQuery(query: string, context: any): Promise<StructuredData> {
    const searchResults = await this.searchService.search(query, context.workspaceId);
    const structuredData = await this.llm1.process({
      query,
      searchResults,
      temperature: 0.3
    });
    return structuredData;
  }
}

// LLM 2: Response Formatter (Temperature: 0.7)
export class ResponseFormatter {
  async formatResponse(data: StructuredData, conversation: any): Promise<string> {
    const response = await this.llm2.format({
      structuredData: data,
      conversationHistory: conversation.history,
      agentConfig: conversation.agentConfig,
      temperature: 0.7
    });
    return response;
  }
}
```

### 📞 **Calling Function Pattern**
**Pattern:** LLM Function Calling for Business Operations  
**Implementation:** Structured function execution  

```typescript
export class CallingFunctionExecutor {
  private functions = {
    getProductsForCustomer: this.getProductsForCustomer.bind(this),
    getServicesForCustomer: this.getServicesForCustomer.bind(this),
    confirmOrderFromConversation: this.confirmOrderFromConversation.bind(this),
    ContactOperator: this.ContactOperator.bind(this)
  };

  async executeFunction(functionName: string, params: any): Promise<any> {
    const functionToExecute = this.functions[functionName];
    if (!functionToExecute) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    return await functionToExecute(params);
  }

  private async getProductsForCustomer(params: any): Promise<any> {
    const { customerQuery, workspaceId } = params;
    const products = await this.productService.searchProducts(customerQuery, workspaceId);
    return { products, type: 'product_list' };
  }
}
```

---

## 📊 **DATA ACCESS PATTERNS**

### 🔍 **Repository Pattern with Caching**
**Pattern:** Data Access with Performance Optimization  
**Implementation:** Repository with Redis caching  

```typescript
export class CachedProductRepository implements ProductRepository {
  constructor(
    private productRepository: ProductRepository,
    private cacheService: CacheService
  ) {}

  async findById(id: string, workspaceId: string): Promise<Product | null> {
    const cacheKey = `product:${workspaceId}:${id}`;
    
    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const product = await this.productRepository.findById(id, workspaceId);
    if (product) {
      await this.cacheService.set(cacheKey, JSON.stringify(product), 3600);
    }

    return product;
  }
}
```

### 📈 **Query Optimization Pattern**
**Pattern:** Efficient Database Queries  
**Implementation:** Optimized queries with proper indexing  

```typescript
export class OptimizedProductService {
  async searchProducts(query: string, workspaceId: string): Promise<Product[]> {
    // Use full-text search with proper indexing
    return await prisma.product.findMany({
      where: {
        workspaceId,
        isActive: true,
        isDelete: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}
```

---

## 🔄 **ERROR HANDLING PATTERNS**

### 🛡️ **Global Error Handler Pattern**
**Pattern:** Centralized Error Management  
**Implementation:** Express error handling middleware  

```typescript
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    workspaceId: req.workspaceId
  });

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: error.message
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
};
```

### 🔄 **Async Error Wrapper Pattern**
**Pattern:** Consistent Async Error Handling  
**Implementation:** Wrapper for async operations  

```typescript
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in controllers
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req;
  const products = await productService.getProducts(workspaceId);
  res.json(products);
});
```

---

## 📊 **VALIDATION PATTERNS**

### ✅ **DTO Validation Pattern**
**Pattern:** Request Data Validation  
**Implementation:** Joi schema validation  

```typescript
export const createProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000),
  price: Joi.number().required().min(0),
  stock: Joi.number().required().min(0),
  categoryId: Joi.string().required().uuid()
});

export const validateProduct = (data: any): CreateProductDto => {
  const { error, value } = createProductSchema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};
```

### 🔍 **Business Rule Validation Pattern**
**Pattern:** Domain-Specific Validation  
**Implementation:** Business logic validation in domain layer  

```typescript
export class ProductValidator {
  static validateProductCreation(data: CreateProductDto, workspaceId: string): void {
    if (data.price < 0) {
      throw new BusinessRuleError('Product price cannot be negative');
    }

    if (data.stock < 0) {
      throw new BusinessRuleError('Product stock cannot be negative');
    }

    if (!data.name.trim()) {
      throw new BusinessRuleError('Product name is required');
    }
  }
}
```

---

## 🔄 **INTEGRATION PATTERNS**

### 🔗 **API Integration Pattern**
**Pattern:** External Service Integration  
**Implementation:** Service abstraction with error handling  

```typescript
export class OpenRouterService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async generateResponse(prompt: string, model: string): Promise<string> {
    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenRouter API error:', error);
      throw new IntegrationError('Failed to generate AI response');
    }
  }
}
```

### 📄 **PDF Generation Pattern**
**Pattern:** Document Generation Service  
**Implementation:** PDF creation with templates  

```typescript
export class PdfService {
  async generateInvoice(order: Order, customer: Customer): Promise<Buffer> {
    const template = await this.loadTemplate('invoice');
    const html = await this.renderTemplate(template, {
      order,
      customer,
      items: order.items,
      total: order.total
    });

    return await puppeteer.launch().then(async (browser) => {
      const page = await browser.newPage();
      await page.setContent(html);
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();
      return pdf;
    });
  }
}
```

---

## 🧪 **TESTING PATTERNS**

### 🧪 **Repository Mock Pattern**
**Pattern:** Test Data Isolation  
**Implementation:** Mock repositories for testing  

```typescript
export class MockProductRepository implements ProductRepository {
  private products: Product[] = [];

  async findById(id: string, workspaceId: string): Promise<Product | null> {
    return this.products.find(p => p.id === id && p.workspaceId === workspaceId) || null;
  }

  async save(product: Product): Promise<Product> {
    const existingIndex = this.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      this.products[existingIndex] = product;
    } else {
      this.products.push(product);
    }
    return product;
  }
}
```

### 🔄 **Integration Test Pattern**
**Pattern:** End-to-End Testing  
**Implementation:** Complete flow testing  

```typescript
describe('Order Flow Integration', () => {
  it('should create order from chat conversation', async () => {
    // Setup test data
    const workspace = await createTestWorkspace();
    const customer = await createTestCustomer(workspace.id);
    const product = await createTestProduct(workspace.id);

    // Simulate chat conversation
    const conversation = {
      customerId: customer.id,
      messages: [
        { role: 'user', content: 'I want to order 2 pizzas' },
        { role: 'assistant', content: 'I found 2 pizza products for you' }
      ]
    };

    // Execute order confirmation
    const result = await confirmOrderFromConversation(conversation, workspace.id);

    // Verify results
    expect(result.order).toBeDefined();
    expect(result.order.customerId).toBe(customer.id);
    expect(result.order.items).toHaveLength(1);
  });
});
```

---

## 🎯 **PERFORMANCE PATTERNS**

### ⚡ **Caching Strategy Pattern**
**Pattern:** Multi-Level Caching  
**Implementation:** Redis + Memory caching  

```typescript
export class MultiLevelCache {
  constructor(
    private memoryCache: Map<string, any>,
    private redisCache: Redis
  ) {}

  async get(key: string): Promise<any> {
    // Level 1: Memory cache
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Level 2: Redis cache
    const redisValue = await this.redisCache.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue);
      this.memoryCache.set(key, parsed);
      return parsed;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    this.memoryCache.set(key, value);
    await this.redisCache.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 🔄 **Connection Pooling Pattern**
**Pattern:** Database Connection Management  
**Implementation:** Prisma with connection pooling  

```typescript
export class DatabaseManager {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: ['query', 'info', 'warn', 'error']
      });
    }
    return DatabaseManager.instance;
  }
}
```

---

## 📋 **DEPLOYMENT PATTERNS**

### 🐳 **Docker Pattern**
**Pattern:** Containerized Deployment  
**Implementation:** Multi-service Docker setup  

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@database:5432/shopme
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=shopme
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 🔧 **Environment Configuration Pattern**
**Pattern:** Environment-Specific Configuration  
**Implementation:** Config management with validation  

```typescript
export class ConfigManager {
  static validate(): void {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'OPENROUTER_API_KEY',
      'WHATSAPP_API_KEY'
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  static getDatabaseConfig() {
    return {
      url: process.env.DATABASE_URL!,
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10')
      }
    };
  }
}
```
