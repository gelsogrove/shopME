# Backend Architecture Documentation

## Domain-Driven Design Architecture

This project follows the Domain-Driven Design (DDD) architectural pattern to structure the codebase in a way that reflects the business domain and separates concerns effectively.

### Directory Structure

```
/src
  /domain                # Core business, entities and rules
    /entities            # Domain models representing business concepts
    /repositories        # Repository interfaces (contracts)
    /value-objects       # Immutable value objects
  /application           # Application use cases
    /services            # Services orchestrating business logic
    /use-cases           # Specific use cases
    /dto                 # Data Transfer Objects
  /infrastructure        # Implementation details
    /repositories        # Concrete repository implementations
    /persistence         # Database configuration and providers
    /external-services   # External API services
  /interfaces            # Interface with the outside world
    /http
      /controllers       # HTTP request handlers
      /middlewares       # HTTP middleware
      /routes            # Route definitions
  /utils                 # Shared utilities
  /config                # Application configuration
```

## Layer Responsibilities

### Domain Layer

The Domain layer contains business models and rules that are independent of any external frameworks or technologies.

- **Entities**: Core business objects with identity and lifecycle (e.g., Offer, Product)
- **Repositories (interfaces)**: Contracts that define how to access domain objects
- **Value Objects**: Immutable objects that have no identity (e.g., Address, Money)

Example:
```typescript
// domain/entities/offer.entity.ts
export class Offer {
  id: string;
  // properties...
  
  isCurrentlyActive(): boolean {
    // business logic...
  }
}

// domain/repositories/offer.repository.interface.ts
export interface IOfferRepository {
  findAll(workspaceId: string): Promise<Offer[]>;
  // methods...
}
```

### Application Layer

The Application layer coordinates high-level activities but does not contain business rules.

- **Services**: Orchestrate multiple domain objects to perform tasks
- **Use Cases**: Specific application features

Example:
```typescript
// application/services/offer.service.ts
export class OfferService {
  constructor(private offerRepository: IOfferRepository) {}
  
  async getActiveOffers(workspaceId: string): Promise<Offer[]> {
    // service logic to get active offers
  }
}
```

### Infrastructure Layer

The Infrastructure layer contains implementations of interfaces defined in the domain:

- **Repositories**: Concrete implementations of domain repositories
- **Persistence**: Database connection and ORM configuration
- **External Services**: Integration with external APIs

Example:
```typescript
// infrastructure/repositories/offer.repository.ts
export class OfferRepository implements IOfferRepository {
  async findAll(workspaceId: string): Promise<Offer[]> {
    // database implementation...
  }
}
```

### Interfaces Layer

The Interfaces layer handles interaction with the outside world:

- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints
- **Middlewares**: Process HTTP requests

Example:
```typescript
// interfaces/http/controllers/offer.controller.ts
export class OfferController {
  async getAllOffers(req: Request, res: Response): Promise<Response> {
    // handle HTTP request...
  }
}
```

## Adding New Features

Follow these steps to add a new feature:

1. **Define the Domain Entity**: Create the entity class in the domain layer
2. **Define the Repository Interface**: Define the data access methods
3. **Implement the Repository**: Create the concrete implementation
4. **Create the Service**: Add the service to orchestrate business logic
5. **Add the Controller**: Create a controller to handle HTTP requests
6. **Define Routes**: Set up the API endpoints

## Naming Conventions

- **Entities**: `<name>.entity.ts` - e.g., `offer.entity.ts`
- **Repository Interfaces**: `<name>.repository.interface.ts` - e.g., `offer.repository.interface.ts`
- **Repository Implementations**: `<name>.repository.ts` - e.g., `offer.repository.ts`
- **Services**: `<name>.service.ts` - e.g., `offer.service.ts`
- **Controllers**: `<name>.controller.ts` - e.g., `offer.controller.ts`
- **Routes**: `<name>.routes.ts` - e.g., `offers.routes.ts`

## Testing

Tests are organized in a similar structure:

- **Unit Tests**: `__tests__/unit/<layer>/<name>.spec.ts`
- **Integration Tests**: `__tests__/integration/<feature>.spec.ts`

Each layer should be tested independently, with mock dependencies. 